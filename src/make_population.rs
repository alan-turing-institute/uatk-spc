use std::collections::BTreeMap;

use anyhow::Result;
use enum_map::EnumMap;
use fs_err::File;
use indicatif::{ProgressBar, ProgressStyle};
use serde::{Deserialize, Deserializer};

use crate::population::{Activity, Household, HouseholdID, Person, PersonID, Population, VenueID};
use crate::quant::{load_venues, quant_get_flows, Threshold};
use crate::raw_data::RawData;
use crate::utilities::print_count;
use crate::{memory_usage, MSOA};

// population_initialisation.py
pub fn initialize(raw_data: RawData) -> Result<Population> {
    let mut population = Population {
        households: Vec::new(),
        people: Vec::new(),
        venues_per_activity: EnumMap::default(),
    };
    read_individual_time_use_and_health_data(&mut population, raw_data)?;

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

fn read_individual_time_use_and_health_data(
    population: &mut Population,
    raw_data: RawData,
) -> Result<()> {
    // First read the raw CSV files and just group the raw rows by household (MSOA and hid)
    // This isn't all that memory-intensive; the Population ultimately has to hold everyone anyway.
    //
    // If there are multiple time use files, we assume this grouping won't have any overlaps --
    // MSOAs shouldn't be the same between different files.
    let mut people_per_household: BTreeMap<(MSOA, isize), Vec<TuPerson>> = BTreeMap::new();
    let mut no_household = 0;

    // TODO Two-level progress bar. MultiProgress seems to demand two threads and calling join() :(
    for path in raw_data.tus_files {
        info!("Reading {}", path);
        let file = File::open(path)?;
        let pb = ProgressBar::new(file.metadata()?.len());
        pb.set_style(
            ProgressStyle::default_bar()
                .template(
                    "{msg}\n[{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})",
                )
                .progress_chars("#-"),
        );

        for rec in csv::Reader::from_reader(pb.wrap_read(file)).deserialize() {
            if people_per_household.len() % 1000 == 0 {
                pb.set_message(format!(
                    "{} households so far ({})",
                    print_count(people_per_household.len()),
                    memory_usage()
                ));
            }

            let rec: TuPerson = rec?;
            // Strip out people that weren't matched to a household
            // No such examples in this file:
            // > xsv search -s hid '\-1' countydata/tus_hse_west-yorkshire.csv
            if rec.hid == -1 {
                no_household += 1;
                continue;
            }

            people_per_household
                .entry((rec.msoa.clone(), rec.hid))
                .or_insert_with(Vec::new)
                .push(rec);
        }
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
    info!("Creating households ({})", memory_usage());
    let pb = ProgressBar::new(people_per_household.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("[{elapsed_precise}] [{wide_bar:.cyan/blue}] {human_pos}/{human_len} ({eta})")
            .progress_chars("#-"),
    );

    // TODO Quick way to add a label, prettyprint the count?
    for ((msoa, orig_hid), raw_people) in people_per_household {
        pb.inc(1);
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

    // The MSOAs from the time-use files are usually a superset of the initial_cases_per_msoa. Is
    // that intentional?
    // TODO The long line gets truncated somehow?
    info!(
        "{} people across {} households, and {} MSOAs ({})",
        print_count(population.people.len()),
        print_count(population.households.len()),
        print_count(population.unique_msoas().len()),
        memory_usage()
    );
    Ok(())
}

#[derive(Deserialize)]
struct TuPerson {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    #[serde(deserialize_with = "parse_isize")]
    hid: isize,
    pid: isize,
    #[serde(deserialize_with = "parse_usize_or_na")]
    sic1d07: Option<usize>,

    phome: f64,
    pwork: f64,
    pleisure: f64,
    pshop: f64,
    pschool: f64,
    age: u8,
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

fn parse_isize<'de, D: Deserializer<'de>>(d: D) -> Result<isize, D::Error> {
    // tus_hse_northamptonshire.csv expresses HID in scientific notation: 2.00563e+11
    // Parse to f64, then cast
    let float = <f64>::deserialize(d)?;
    // TODO Is there a safety check we should do? Make sure it's already rounded?
    Ok(float as isize)
}

impl TuPerson {
    fn create(self, household: HouseholdID, id: PersonID) -> Result<Person> {
        let mut duration_per_activity: EnumMap<Activity, f64> = EnumMap::default();
        duration_per_activity[Activity::Retail] = self.pshop;
        duration_per_activity[Activity::Home] = self.phome;
        duration_per_activity[Activity::Work] = self.pwork;
        duration_per_activity[Activity::Nightclub] = self.pleisure;

        // Use pschool and age to calculate primary/secondary school
        if self.age < 11 {
            duration_per_activity[Activity::PrimarySchool] = self.pschool;
            duration_per_activity[Activity::SecondarySchool] = 0.0;
        } else if self.age < 19 {
            duration_per_activity[Activity::PrimarySchool] = 0.0;
            duration_per_activity[Activity::SecondarySchool] = self.pschool;
        } else {
            // TODO Seems like we need a University activity
            duration_per_activity[Activity::PrimarySchool] = 0.0;
            duration_per_activity[Activity::SecondarySchool] = 0.0;
        }
        pad_durations(&mut duration_per_activity)?;

        Ok(Person {
            id,
            household,
            orig_pid: self.pid,
            sic1d07: self.sic1d07,

            age_years: self.age,

            flows_per_activity: EnumMap::default(),
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

    population.venues_per_activity[activity] = load_venues(activity)?;

    // Per MSOA, a list of venues and the probability of going from the MSOA to that venue
    let flows_per_msoa: BTreeMap<MSOA, Vec<(VenueID, f64)>> =
        quant_get_flows(activity, population.unique_msoas(), threshold)?;

    // Now let's assign these flows to the people. Near as I can tell, this just copies the flows
    // to every person in the MSOA. That's loads of duplication -- we could just keep it by (MSOA x
    // activity), but let's follow the Python for now.
    info!("Copying {:?} flows to the people", activity);
    let pb = ProgressBar::new(population.people.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("{msg}\n[{elapsed_precise}] [{wide_bar:.cyan/blue}] {human_pos}/{human_len} ({eta})")
            .progress_chars("#-"),
    );
    for person in &mut population.people {
        pb.inc(1);
        if pb.position() % 1000 == 0 {
            pb.set_message(memory_usage());
        }

        let msoa = &population.households[person.household.0].msoa;
        if let Some(flows) = flows_per_msoa.get(msoa) {
            // TODO This OOMs.
            person.flows_per_activity[activity] = flows.clone();
        } else {
            // TODO I think this is an error; not happening for the small input
            warn!("No flows for {:?} in {}", activity, msoa.0);
        }
    }

    Ok(())
}

// If the durations don't sum to 1, pad Home
fn pad_durations(durations: &mut EnumMap<Activity, f64>) -> Result<()> {
    let total: f64 = durations.values().sum();
    // TODO Check the rounding in the Python version
    let epsilon = 0.00001;
    if total > 1.0 + epsilon {
        bail!("Someone's durations sum to {}", total);
    } else if total < 1.0 {
        durations[Activity::Home] = 1.0 - total;
    }
    Ok(())
}
