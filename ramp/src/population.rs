use std::collections::{HashMap, HashSet};
use std::fmt;

use crate::MSOA;

pub struct Population {
    pub households: Vec<Household>,
    pub people: Vec<Person>,

    // VenueID indexes into each list
    pub venues_per_activity: HashMap<Activity, Vec<Venue>>,
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
    // Some kind of work-related ID
    pub sic1d07: Option<usize>,

    pub age_years: usize,

    // The probabilities sum to 1 (TODO Make a distribution type or something)
    pub flows_per_activity: HashMap<Activity, Vec<(VenueID, f64)>>,
    // These are unitless, or a fraction of a day? They sum to 1
    pub duration_per_activity: HashMap<Activity, f64>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Activity {
    Retail,
    PrimarySchool,
    SecondarySchool,
    Home,
    Work,
    Nightclub,
    // TODO I see quant files for hospitals, why not incorporated yet?
}

pub struct Venue {
    pub id: VenueID,
    pub activity: Activity,

    // TODO Turn this into WGS84 from whatever coordinate system this is...
    pub east: f64,
    pub north: f64,
    /// This only exists for PrimarySchool and SecondarySchool. It's a
    /// https://en.wikipedia.org/wiki/Unique_Reference_Number
    pub urn: Option<usize>,
}

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

// TODO These're also scoped by an activity, like retail!
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord)]
pub struct VenueID(pub usize);
impl fmt::Display for VenueID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Venue #{}", self.0)
    }
}
