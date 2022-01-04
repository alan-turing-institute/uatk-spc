//! This is a Rust implementation of RAMP (Rapid Assistance in Modelling the Pandemic).
//!
//! It's split into several stages:
//! 1) init -- from raw data, build an activity model for a study area
//! 2) TODO -- simulate COVID in the population

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

// Override the memory allocator, so utilities::memory_usage can take measurements
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

/// After running the initialization for a study area, this one file carries all data needed for
/// the simulation.
#[derive(Serialize, Deserialize)]
pub struct StudyAreaCache {
    pub population: Population,
    pub info_per_msoa: BTreeMap<MSOA, InfoPerMSOA>,
    /// A number in [0, 1] for each day, representing... TODO
    pub lockdown_per_day: Vec<f64>,
}

pub struct Input {
    /// Only people living in MSOAs filled out here will be part of the population
    pub initial_cases_per_msoa: BTreeMap<MSOA, usize>,
}

/// Represents a region of the UK.
///
/// See https://en.wikipedia.org/wiki/ONS_coding_system. This is usually called `MSOA11CD`.
// TODO Given one of these, how do we look it up?
// - http://statistics.data.gov.uk/id/statistical-geography/E02002191
// - https://mapit.mysociety.org/area/36070.html (they have a paid API)
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct MSOA(String);

/// This represents a larger region than an MSOA. It's used in Google mobility data.
///
/// TODO What does it stand for?
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

    /// Per activity, a list of venues. VenueID indexes into this list.
    pub venues_per_activity: EnumMap<Activity, Vec<Venue>>,
}

impl Population {
    /// All the MSOAs of people in this population.
    // TODO Should we just store this set? It'll be a subset of initial_cases_per_msoa, only
    // different if there are no people for some MSOA.
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
    /// An ID from the original data, kept around for debugging
    pub orig_hid: isize,
    pub members: Vec<PersonID>,
}

#[derive(Serialize, Deserialize)]
pub struct Person {
    pub id: PersonID,
    pub household: HouseholdID,
    /// An ID from the original data, kept around for debugging
    pub orig_pid: isize,
    /// Some kind of work-related ID
    pub sic1d07: Option<usize>,

    // Nobody's older than 256 years
    pub age_years: u8,

    /// Per activity, a list of venues where this person is likely to go do that activity. The
    /// probabilities sum to 1.
    // TODO Consider a distribution type to represent this
    pub flows_per_activity: EnumMap<Activity, Vec<(VenueID, f64)>>,
    /// These sum to 1, representing a fraction of a day
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

/// Represents a place where people do an activity
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

// These are unsigned integers, used to index into different vectors. They're wrapped in a type, so
// we never accidentally confuse a VenueID with a PersonID.

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

/// These IDs are scoped by Activity. This means two VenueIDs may be equal, but represent different
/// places!
// TODO Just encode Activity in here too
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct VenueID(pub usize);
impl fmt::Display for VenueID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Venue #{}", self.0)
    }
}
