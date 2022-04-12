use std::collections::{BTreeMap, BTreeSet};
use std::time::{Duration, Instant};

use anyhow::Result;
use enum_map::EnumMap;
use fs_err::File;
use geo::Point;
use rand::rngs::StdRng;
use serde::{Deserialize, Deserializer};
use typed_index_collections::TiVec;

use super::quant::{get_flows, load_venues, Threshold};
use crate::utilities::{
    memory_usage, print_count, progress_count, progress_count_with_msg, progress_file_with_msg,
};
use crate::{
    Activity, Household, Input, Obesity, Person, PersonID, Population, VenueID, MSOA, MSOAID,
};

impl Population {
    /// Create a population from some time-use files, only keeping people in the specified MSOAs. Also
    /// returns the duration for the commuting calculation.
    ///
    /// This doesn't download or extract raw data files if they already exist.
    pub async fn create(input: Input, rng: &mut StdRng) -> Result<(Population, Duration)> {
        let raw_results = super::raw_data::grab_raw_data(&input).await?;

        let _s = info_span!("creating population").entered();

        let mut population = Population {
            msoas: input
                .msoas
                .into_iter()
                .enumerate()
                .map(|(idx, msoa)| (msoa, MSOAID(idx)))
                .collect(),
            households: TiVec::new(),
            people: TiVec::new(),
            venues_per_activity: EnumMap::default(),
            info_per_msoa: TiVec::new(),
            lockdown_per_day: Vec::new(),
        };

        // Fill this out early, so we can map between MSOA and MSOAID
        population.info_per_msoa =
            super::msoas::get_info_per_msoa(&population.msoas, raw_results.osm_directories)?;

        read_individual_time_use_and_health_data(&mut population, raw_results.tus_files)?;

        // The order doesn't matter for these steps
        let commuting_duration = if input.enable_commuting {
            let now = Instant::now();
            super::commuting::create_commuting_flows(&mut population, rng)?;
            Instant::now() - now
        } else {
            Duration::ZERO
        };
        setup_venue_flows(Activity::Retail, Threshold::TopN(10), &mut population)?;
        setup_venue_flows(Activity::Nightclub, Threshold::TopN(10), &mut population)?;
        setup_venue_flows(Activity::PrimarySchool, Threshold::TopN(5), &mut population)?;
        setup_venue_flows(
            Activity::SecondarySchool,
            Threshold::TopN(5),
            &mut population,
        )?;

        // TODO The Python implementation has lots of commented stuff, then some rounding

        population.lockdown_per_day =
            super::lockdown::calculate_lockdown_per_day(raw_results.msoas_per_county, &population)?;
        population.remove_unused_venues();
        Ok((population, commuting_duration))
    }

    // Remove venues where nobody goes (by zeroing out the location)
    //
    // TODO Should we do this earlier and only keep venues matching our input MSOAs (the same as
    // where people live?)
    // - Since we take the top N flows, it could change the results
    // - Do we have to check if the venue's location is physically inside an MSOA polygon, or do we
    //  use the *Population.csv files somehow?
    //
    //  TODO Actually remove the venues from the output entirely, and compact VenueIDs.
    fn remove_unused_venues(&mut self) {
        let mut visited_venues: BTreeSet<(Activity, VenueID)> = BTreeSet::new();
        for person in &self.people {
            for (activity, flows) in &person.flows_per_activity {
                for (venue, _) in flows {
                    visited_venues.insert((activity, *venue));
                }
            }
        }
        let mut unvisited_venues = 0;
        for (activity, venues) in &mut self.venues_per_activity {
            for (id, venue) in venues.iter_mut_enumerated() {
                if !visited_venues.contains(&(activity, id)) {
                    unvisited_venues += 1;
                    venue.location = geo::Point::new(0.0, 0.0);
                }
            }
        }
        info!("Removed {} unvisited venues", print_count(unvisited_venues));
    }
}

fn read_individual_time_use_and_health_data(
    population: &mut Population,
    tus_files: Vec<String>,
) -> Result<()> {
    let _s = info_span!("read_individual_time_use_and_health_data").entered();

    // First read the raw CSV files and just group the raw rows by household (MSOA and hid)
    // This isn't all that memory-intensive; the Population ultimately has to hold everyone anyway.
    //
    // If there are multiple time use files, we assume this grouping won't have any overlaps --
    // MSOAs shouldn't be the same between different files.
    let mut people_per_household: BTreeMap<(MSOAID, isize), Vec<TuPerson>> = BTreeMap::new();
    let mut no_household = 0;

    // TODO Two-level progress bar. MultiProgress seems to demand two threads and calling join() :(
    for path in tus_files {
        let _s = info_span!("Reading", ?path).entered();
        let file = File::open(path)?;
        let pb = progress_file_with_msg(&file)?;
        for rec in csv::Reader::from_reader(pb.wrap_read(file)).deserialize() {
            if people_per_household.len() % 1000 == 0 {
                pb.set_message(format!(
                    "{} households so far ({})",
                    print_count(people_per_household.len()),
                    memory_usage()
                ));
            }

            let rec: TuPerson = rec?;

            // Skip people that weren't matched to a household
            if rec.hid == -1 {
                no_household += 1;
                continue;
            }

            // Only keep people in the input set of MSOAs
            if let Some(msoa) = population.msoas.get(&rec.msoa) {
                people_per_household
                    .entry((*msoa, rec.hid))
                    .or_insert_with(Vec::new)
                    .push(rec);
            }
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
    let _s = info_span!("Creating households").entered();
    info!("Creating households ({})", memory_usage());
    let pb = progress_count(people_per_household.len());
    for ((msoa, orig_hid), raw_people) in people_per_household {
        pb.inc(1);
        let household_id = VenueID(population.households.len());
        let mut household = Household {
            id: household_id,
            msoa,
            orig_hid,
            members: Vec::new(),
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

    let mut actual_msoas = BTreeSet::new();
    for h in &population.households {
        actual_msoas.insert(population.info_per_msoa[h.msoa].name.clone());
    }
    let expected_msoas = population.msoas.keys().cloned().collect::<BTreeSet<_>>();
    if actual_msoas != expected_msoas {
        // See https://github.com/dabreegster/spc/issues/7
        error!(
            "Some input MSOAs had no people: {:?}",
            expected_msoas.difference(&actual_msoas).collect::<Vec<_>>()
        );
    }

    // TODO This long line gets truncated sometimes by a later progress bar?
    info!(
        "{} people across {} households, and {} MSOAs ({})",
        print_count(population.people.len()),
        print_count(population.households.len()),
        print_count(population.msoas.len()),
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
    lat: f32,
    lng: f32,

    phome: f64,
    pwork: f64,
    pleisure: f64,
    pshop: f64,
    pschool: f64,
    age: u8,
    #[serde(rename = "BMIvg6", deserialize_with = "parse_obesity")]
    obesity: Obesity,
    cvd: u8,
    diabetes: u8,
    bloodpressure: u8,
    pnothome: f32,
}

/// Parses either an unsigned integer or the string "NA"
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

/// Parses a signed integer, handling scientific notation
fn parse_isize<'de, D: Deserializer<'de>>(d: D) -> Result<isize, D::Error> {
    // tus_hse_northamptonshire.csv expresses HID in scientific notation: 2.00563e+11
    // Parse to f64, then cast
    let float = <f64>::deserialize(d)?;
    // TODO Is there a safety check we should do? Make sure it's already rounded?
    Ok(float as isize)
}

fn parse_obesity<'de, D: Deserializer<'de>>(d: D) -> Result<Obesity, D::Error> {
    let raw = <&str>::deserialize(d)?;
    match raw {
        "Obese III: 40 or more" => Ok(Obesity::Obese3),
        "Obese II: 35 to less than 40" => Ok(Obesity::Obese2),
        "Obese I: 30 to less than 35" => Ok(Obesity::Obese1),
        "Overweight: 25 to less than 30" => Ok(Obesity::Overweight),
        "Normal: 18.5 to less than 25" | "Not applicable" => Ok(Obesity::Normal),
        // There are some additional values that the Python maps to normal. It's nice to explicitly
        // list them
        "Underweight: less than 18.5" => Ok(Obesity::Normal),
        _ => Err(serde::de::Error::custom(format!(
            "Unknown BMIvg6 value {}",
            raw
        ))),
    }
}

impl TuPerson {
    fn create(self, household: VenueID, id: PersonID) -> Result<Person> {
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

        let mut flows_per_activity = EnumMap::default();
        // People only have one home
        flows_per_activity[Activity::Home] = vec![(household, 1.0)];

        Ok(Person {
            id,
            household,
            orig_pid: self.pid,
            sic1d07: self.sic1d07,
            location: Point::new(self.lng, self.lat),

            age_years: self.age,
            obesity: self.obesity,
            has_cardiovascular_disease: self.cvd > 0,
            has_diabetes: self.diabetes > 0,
            has_high_blood_pressure: self.bloodpressure > 0,

            pr_not_home: self.pnothome,

            flows_per_activity,
            duration_per_activity,
        })
    }
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

#[instrument(skip(threshold, population))]
fn setup_venue_flows(
    activity: Activity,
    threshold: Threshold,
    population: &mut Population,
) -> Result<()> {
    info!("Reading {:?} flow data...", activity);

    population.venues_per_activity[activity] = load_venues(activity)?;
    info!(
        "{:?} has {} venues",
        activity,
        print_count(population.venues_per_activity[activity].len())
    );

    // Per MSOA, a list of venues and the probability of going from the MSOA to that venue
    let flows_per_msoa: TiVec<MSOAID, Vec<(VenueID, f64)>> =
        get_flows(activity, &population.msoas, threshold)?;

    // Now let's assign these flows to the people. Near as I can tell, this just copies the flows
    // to every person in the MSOA. That's loads of duplication -- we could just keep it by (MSOA x
    // activity), but let's follow the Python for now.
    let _s = info_span!("Copying flows to people", ?activity).entered();
    let pb = progress_count_with_msg(population.people.len());
    for person in &mut population.people {
        pb.inc(1);
        if pb.position() % 1000 == 0 {
            pb.set_message(memory_usage());
        }

        let msoa = population.households[person.household].msoa;
        let flows = flows_per_msoa[msoa].clone();
        if flows.is_empty() {
            // I've never observed this, so crash if it ever happens
            panic!(
                "No flows for {:?} in {}",
                activity, population.info_per_msoa[msoa].name.0
            );
        }
        // TODO On the national run, we run out of memory around here.
        person.flows_per_activity[activity] = flows;
    }

    Ok(())
}
