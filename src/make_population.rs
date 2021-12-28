use std::collections::{BTreeMap, HashMap};
use std::fs::File;

use anyhow::Result;
use serde::{Deserialize, Deserializer};

use crate::population::{Activity, Household, HouseholdID, Person, PersonID, Population, VenueID};
use crate::quant::{load_venues, quant_get_flows, Threshold};
use crate::utilities::print_count;
use crate::MSOA;

// population_initialisation.py
pub fn initialize() -> Result<Population> {
    let mut population = Population {
        households: Vec::new(),
        people: Vec::new(),
        venues_per_activity: HashMap::new(),
    };
    read_individual_time_use_and_health_data(&mut population)?;

    setup_venue_flows(Activity::Retail, Threshold::TopN(10), &mut population)?;
    setup_venue_flows(Activity::Nightclub, Threshold::TopN(10), &mut population)?;
    setup_venue_flows(Activity::PrimarySchool, Threshold::TopN(5), &mut population)?;
    setup_venue_flows(
        Activity::SecondarySchool,
        Threshold::TopN(5),
        &mut population,
    )?;

    // Commuting is special-cased
    // TODO Share logic with setup_venue_flows?
    let _commuting_flows = crate::commuting::get_commuting_flows()?;

    // TODO Lots of commented stuff, then rounding

    Ok(population)
}

fn read_individual_time_use_and_health_data(population: &mut Population) -> Result<()> {
    // First read the raw CSV file and just group the raw rows by household (MSOA and hid)
    // This isn't all that memory-intensive; the Population ultimately has to hold everyone anyway.
    let mut people_per_household: BTreeMap<(MSOA, isize), Vec<TuPerson>> = BTreeMap::new();
    let mut no_household = 0;
    // TODO Read from the combined TU file, not this hardcoded thing
    for rec in
        csv::Reader::from_reader(File::open("raw_data/tus_hse_west-yorkshire.csv")?).deserialize()
    {
        // TODO Real progress bar based on bytes read
        if people_per_household.len() % 1000 == 0 {
            info!(
                "{} households so far",
                print_count(people_per_household.len())
            );
        }

        let rec: TuPerson = rec?;
        // Strip out people that weren't matched to a household
        // No such examples in this file:
        // > xsv search -s hid '\-1' county_data/tus_hse_west-yorkshire.csv
        if rec.hid == -1 {
            no_household += 1;
            continue;
        }

        people_per_household
            .entry((rec.msoa.clone(), rec.hid))
            .or_insert_with(Vec::new)
            .push(rec);
    }

    if no_household > 0 {
        warn!(
            "{} people skipped, no household originally",
            print_count(no_household)
        );
    }

    // Strip out households with >10 people
    let before_households = people_per_household.len();
    people_per_household.retain(|_, people| people.len() <= 10);
    let after_households = people_per_household.len();
    if before_households != after_households {
        warn!(
            "{} households with >10 people filtered out",
            print_count(before_households - after_households)
        );
    }

    // Now create the people and households
    for ((msoa, orig_hid), raw_people) in people_per_household {
        let household_id = HouseholdID(population.households.len());
        let mut household = Household {
            id: household_id,
            msoa,
            orig_hid,
            members: Vec::new(),

            disease_danger: 0.0,
        };
        for raw_person in raw_people {
            let person_id = PersonID(population.people.len());
            household.members.push(person_id);
            population
                .people
                .push(raw_person.create(household_id, person_id)?);
        }
        population.households.push(household);
    }

    info!(
        "{} people across {} households, and {} MSOAs",
        print_count(population.people.len()),
        print_count(population.households.len()),
        print_count(population.unique_msoas().len())
    );
    Ok(())
}

#[derive(Deserialize)]
struct TuPerson {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    hid: isize,
    pid: isize,
    #[serde(deserialize_with = "parse_usize_or_na")]
    sic1d07: Option<usize>,

    phome: f64,
    pwork: f64,
    pleisure: f64,
    pshop: f64,
    pschool: f64,
    age: usize,
}

fn parse_usize_or_na<'de, D: Deserializer<'de>>(d: D) -> Result<Option<usize>, D::Error> {
    // We have to parse it as a string first, or we lose the chance to check that it's "NA" later
    let raw = <String>::deserialize(d)?;
    if let Ok(x) = raw.parse::<usize>() {
        return Ok(Some(x));
    }
    if raw == "NA" {
        return Ok(None);
    }
    Err(serde::de::Error::custom(format!(
        "Not a usize or \"NA\": {}",
        raw
    )))
}

impl TuPerson {
    fn create(self, household: HouseholdID, id: PersonID) -> Result<Person> {
        let mut duration_per_activity: HashMap<Activity, f64> = HashMap::new();
        duration_per_activity.insert(Activity::Retail, self.pshop);
        duration_per_activity.insert(Activity::Home, self.phome);
        duration_per_activity.insert(Activity::Work, self.pwork);
        duration_per_activity.insert(Activity::Nightclub, self.pleisure);

        // Use pschool and age to calculate primary/secondary school
        if self.age < 11 {
            duration_per_activity.insert(Activity::PrimarySchool, self.pschool);
            duration_per_activity.insert(Activity::SecondarySchool, 0.0);
        } else if self.age < 19 {
            duration_per_activity.insert(Activity::PrimarySchool, 0.0);
            duration_per_activity.insert(Activity::SecondarySchool, self.pschool);
        } else {
            // TODO Seems like we need a University activity
            duration_per_activity.insert(Activity::PrimarySchool, 0.0);
            duration_per_activity.insert(Activity::SecondarySchool, 0.0);
        }
        pad_durations(&mut duration_per_activity)?;

        Ok(Person {
            id,
            household,
            orig_pid: self.pid,
            sic1d07: self.sic1d07,

            age_years: self.age,

            flows_per_activity: HashMap::new(),
            duration_per_activity,
        })
    }
}

fn setup_venue_flows(
    activity: Activity,
    threshold: Threshold,
    population: &mut Population,
) -> Result<()> {
    info!("Reading {:?} flow data...", activity);

    population
        .venues_per_activity
        .insert(activity, load_venues(activity)?);

    // Per MSOA, a list of venues and the probability of going from the MSOA to that venue
    let flows_per_msoa: HashMap<MSOA, Vec<(VenueID, f64)>> =
        quant_get_flows(activity, population.unique_msoas(), threshold)?;

    // Now let's assign these flows to the people. Near as I can tell, this just copies the flows
    // to every person in the MSOA. That's loads of duplication -- we could just keep it by (MSOA x
    // activity), but let's follow the Python for now.
    info!("Copying {:?} flows to the people", activity);
    for person in &mut population.people {
        let msoa = &population.households[person.household.0].msoa;
        if let Some(flows) = flows_per_msoa.get(msoa) {
            person.flows_per_activity.insert(activity, flows.clone());
        } else {
            // TODO I think this is an error; not happening for the small input
            warn!("No flows for {:?} in {}", activity, msoa.0);
        }
    }

    Ok(())
}

// If the durations don't sum to 1, pad Home
fn pad_durations(durations: &mut HashMap<Activity, f64>) -> Result<()> {
    let total: f64 = durations.values().sum();
    // TODO Check the rounding in the Python version
    let epsilon = 0.00001;
    if total > 1.0 + epsilon {
        bail!("Someone's durations sum to {}", total);
    } else if total < 1.0 {
        durations.insert(Activity::Home, 1.0 - total);
    }
    Ok(())
}
