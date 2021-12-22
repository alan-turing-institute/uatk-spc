use std::collections::{HashMap, HashSet};
use std::fmt;
use std::fs::File;

use anyhow::Result;
use serde::Deserialize;

use crate::quant::quant_get_flows;
use crate::utilities::print_count;
use crate::MSOA;

pub struct Population {
    pub households: Vec<Household>,
    pub people: Vec<Person>,

    pub activities: HashMap<Activity, ActivityLocation>,
}

impl Population {
    pub fn unique_msoas(&self) -> HashSet<MSOA> {
        let mut result = HashSet::new();
        for h in &self.households {
            result.insert(h.msoa.clone());
        }
        result
    }
}

pub struct Household {
    pub id: HouseholdID,
    pub msoa: MSOA,
    pub orig_hid: isize,
    pub members: Vec<PersonID>,

    // TODO Actually, this should probably be separate
    pub disease_danger: f64,
}

pub struct Person {
    pub id: PersonID,
    pub household: HouseholdID,
    pub orig_pid: isize,

    pub age_years: usize,
    pub pr_primary_school: f64,
    pub pr_secondary_school: f64,
    // Per activity:
    // - list of locations likely to visit
    // - How likely they are to do the activity -- a "flow"
    //   - same length as locations, sum to 1
    // - Duration
}

pub enum Activity {
    Retail,
    PrimarySchool,
    SecondarySchool,
    Home,
    Work,
    Nightclubs,
}

pub struct ActivityLocation {
    activity: Activity,
    locations: Vec<Location>,
    // The danger per location is kept here -- why is it per activity though?
}

pub struct Location {}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord)]
pub struct HouseholdID(pub usize);
impl fmt::Display for HouseholdID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Household #{}", self.0)
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord)]
pub struct PersonID(pub usize);
impl fmt::Display for PersonID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Person #{}", self.0)
    }
}

// population_initialisation.py
pub fn initialize() -> Result<()> {
    let mut population = Population {
        households: Vec::new(),
        people: Vec::new(),
        activities: HashMap::new(),
    };
    read_individual_time_use_and_health_data(&mut population)?;

    setup_retail(&mut population)?;

    Ok(())
}

fn read_individual_time_use_and_health_data(population: &mut Population) -> Result<()> {
    let mut households: Vec<Household> = Vec::new();
    let mut people: Vec<Person> = Vec::new();
    let mut household_lookup: HashMap<(MSOA, isize), HouseholdID> = HashMap::new();

    let mut no_household = 0;
    // TODO Read from the combined TU file, not this hardcoded thing
    for rec in
        csv::Reader::from_reader(File::open("raw_data/tus_hse_west-yorkshire.csv")?).deserialize()
    {
        // TODO Progress bar
        if people.len() % 1000 == 0 {
            info!("{} people so far", print_count(people.len()));
            /*if !people.is_empty() {
                break;
            }*/
        }

        let rec: TuPerson = rec?;
        // Strip out people that weren't matched to a household
        // No such examples in this file:
        // > xsv search -s hid '\-1' county_data/tus_hse_west-yorkshire.csv
        if rec.hid == -1 {
            no_household += 1;
            continue;
        }

        let household_id = household_lookup
            .entry((rec.msoa.clone(), rec.hid))
            .or_insert_with(|| {
                let id = HouseholdID(households.len());
                households.push(Household {
                    id,
                    msoa: rec.msoa,
                    orig_hid: rec.hid,
                    members: Vec::new(),

                    disease_danger: 0.0,
                });
                id
            });
        let household = &mut households[household_id.0];
        let person_id = PersonID(people.len());
        household.members.push(person_id);

        // Use pschool and age to calculate primary/secondary school
        let pr_primary_school = if rec.age < 11 { rec.pschool } else { 0.0 };
        let pr_secondary_school = if rec.age >= 11 && rec.age < 19 {
            rec.pschool
        } else {
            0.0
        };
        // TODO If rec.age > 18 and pschool is nonzero, currently skipping that activity

        people.push(Person {
            id: person_id,
            household: household.id,
            orig_pid: rec.pid,

            age_years: rec.age,
            pr_primary_school,
            pr_secondary_school,
        });
    }
    if no_household > 0 {
        warn!(
            "{} people skipped, no household originally",
            print_count(no_household)
        );
    }

    // TODO Strip out households with >10 people and fix up all the IDs

    population.households = households;
    population.people = people;
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

    pschool: f64,
    age: usize,
}

fn setup_retail(population: &mut Population) -> Result<()> {
    info!("Reading retail flow data...");
    // generate flows
    // and info about the stores

    // id, zonei, east, north
    let stores = "raw_data/QUANT_RAMP/retailpointsZones.csv";

    // threshold is 10, nr
    let flows = quant_get_flows("Retail", population.unique_msoas())?;

    Ok(())
}
