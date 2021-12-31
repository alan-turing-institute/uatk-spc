use std::collections::BTreeSet;
use std::fmt;

use enum_map::{Enum, EnumMap};
use serde::{Deserialize, Serialize};

use crate::MSOA;

#[derive(Serialize, Deserialize)]
pub struct Population {
    pub households: Vec<Household>,
    pub people: Vec<Person>,

    // VenueID indexes into each list
    pub venues_per_activity: EnumMap<Activity, Vec<Venue>>,
}

impl Population {
    pub fn unique_msoas(&self) -> BTreeSet<MSOA> {
        let mut result = BTreeSet::new();
        for h in &self.households {
            result.insert(h.msoa.clone());
        }
        result
    }
}

#[derive(Serialize, Deserialize)]
pub struct Household {
    pub id: HouseholdID,
    pub msoa: MSOA,
    pub orig_hid: isize,
    pub members: Vec<PersonID>,

    // TODO Actually, this should probably be separate
    pub disease_danger: f64,
}

#[derive(Serialize, Deserialize)]
pub struct Person {
    pub id: PersonID,
    pub household: HouseholdID,
    pub orig_pid: isize,
    // Some kind of work-related ID
    pub sic1d07: Option<usize>,

    // Nobody's older than 256 years
    pub age_years: u8,

    // The probabilities sum to 1 (TODO Make a distribution type or something)
    pub flows_per_activity: EnumMap<Activity, Vec<(VenueID, f64)>>,
    // These are unitless, or a fraction of a day? They sum to 1
    pub duration_per_activity: EnumMap<Activity, f64>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Enum, Serialize, Deserialize)]
pub enum Activity {
    Retail,
    PrimarySchool,
    SecondarySchool,
    Home,
    Work,
    Nightclub,
    // TODO I see quant files for hospitals, why not incorporated yet?
}

#[derive(Serialize, Deserialize)]
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

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct HouseholdID(pub usize);
impl fmt::Display for HouseholdID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Household #{}", self.0)
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct PersonID(pub usize);
impl fmt::Display for PersonID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Person #{}", self.0)
    }
}

// TODO These're also scoped by an activity, like retail!
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct VenueID(pub usize);
impl fmt::Display for VenueID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Venue #{}", self.0)
    }
}
