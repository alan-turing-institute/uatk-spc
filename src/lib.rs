#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod init;
pub mod utilities;

use std::collections::{BTreeMap, BTreeSet};
use std::fmt;

use anyhow::Result;
use cap::Cap;
use enum_map::{Enum, EnumMap};
use geo::{MultiPolygon, Point};
use serde::{Deserialize, Serialize};

// So that utilities::memory_usage works
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

// Equivalent to InitialisationCache
#[derive(Serialize, Deserialize)]
pub struct StudyAreaCache {
    pub population: Population,
    pub info_per_msoa: BTreeMap<MSOA, InfoPerMSOA>,
    pub lockdown_per_day: Vec<f64>,
}

// Parts of model_parameters/default.yml
pub struct Input {
    pub initial_cases_per_msoa: BTreeMap<MSOA, usize>,
}

// MSOA11CD
//
// TODO Given one of these, how do we look it up?
// - http://statistics.data.gov.uk/id/statistical-geography/E02002191
// - https://mapit.mysociety.org/area/36070.html (they have a paid API)
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct MSOA(String);

// No idea what this stands for. It's a larger region name, used in Google mobility data.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct CTY20(String);

impl MSOA {
    pub async fn all_msoas_nationally() -> Result<BTreeSet<MSOA>> {
        init::all_msoas_nationally().await
    }
}

#[derive(Serialize, Deserialize)]
pub struct InfoPerMSOA {
    pub shape: MultiPolygon<f64>,
    pub population: usize,
    /// All building centroids within this MSOA.
    ///
    /// Note there are many caveats about building data in OpenStreetMap -- what counts as
    /// residential, commercial? And some areas don't have any buildings mapped yet!
    pub buildings: Vec<Point<f64>>,
}

#[derive(Serialize, Deserialize)]
pub struct Population {
    pub households: Vec<Household>,
    pub people: Vec<Person>,

    // VenueID indexes into each list
    pub venues_per_activity: EnumMap<Activity, Vec<Venue>>,
}

impl Population {
    // Just store this explicitly? Will it ever not match the input set?
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
