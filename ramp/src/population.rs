use std::collections::{HashMap, HashSet};
use std::fmt;

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
