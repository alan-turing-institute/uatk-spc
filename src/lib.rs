//! This is a Rust implementation of RAMP (Rapid Assistance in Modelling the Pandemic).
//!
//! It's split into several stages:
//! 1) init -- from raw data, build an activity model for a study area
//! 2) snapshot -- from an activity model, build a snapshot for the OpenCL simulation
//! 3) TODO -- simulate COVID in the population

#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod init;
mod model;
mod python_cache;
mod snapshot;
pub mod utilities;

use derive_more::{From, Into};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use typed_index_collections::TiVec;

use anyhow::Result;
use cap::Cap;
use enum_map::{Enum, EnumMap};
use geo::{MultiPolygon, Point};
use serde::{Deserialize, Serialize};

pub use self::model::Model;
pub use self::snapshot::Snapshot;

// Override the memory allocator, so utilities::memory_usage can take measurements
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

/// After running the initialization for a study area, this one file carries all data needed for
/// the simulation.
#[derive(Serialize, Deserialize)]
pub struct Population {
    /// VenueIDs for `Activity::Home` index into this
    pub households: Vec<Household>,
    pub people: TiVec<PersonID, Person>,

    /// Per activity, a list of venues. VenueID indexes into this list.
    /// This is not filled out for `Activity::Home`; see `households` for that.
    pub venues_per_activity: EnumMap<Activity, Vec<Venue>>,

    pub info_per_msoa: BTreeMap<MSOA, InfoPerMSOA>,
    /// A number in [0, 1] for each day. 0 means all time just spent at home
    pub lockdown_per_day: Vec<f32>,
    pub events: Vec<Event>,
    pub input: Input,
}

#[derive(Serialize, Deserialize)]
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

/// This represents a 2020 county boundary, which contains several MSOAs. It's used in Google
/// mobility data. It's not the same county as defined by ONS.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct County(String);

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
    // TODO Not guaranteed to be non-empty
    // TODO Probably easier to use f32
    pub buildings: Vec<Point<f64>>,
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

/// A special type of venue where people live
#[derive(Serialize, Deserialize)]
pub struct Household {
    pub id: VenueID,
    pub msoa: MSOA,
    /// An ID from the original data, kept around for debugging
    pub orig_hid: isize,
    pub members: Vec<PersonID>,
}

#[derive(Serialize, Deserialize)]
pub struct Person {
    pub id: PersonID,
    pub household: VenueID,
    /// This is the centroid of the household's MSOA. It's redundant to store it per person, but
    /// very convenient.
    pub location: Point<f64>,
    /// An ID from the original data, kept around for debugging
    pub orig_pid: isize,
    /// The Standard Industry Classification for where this person works
    pub sic1d07: Option<usize>,

    // Nobody's older than 256 years
    pub age_years: u8,
    pub obesity: Obesity,
    // Unclear what the values mean
    pub cardiovascular_disease: u8,
    pub diabetes: u8,
    pub blood_pressure: u8,

    // TODO This seems like it should be equivalent to 1 - duration_per_activity[Activity::Home]
    pub pr_not_home: f32,

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

impl Activity {
    pub fn all() -> Vec<Activity> {
        vec![
            Activity::Retail,
            Activity::PrimarySchool,
            Activity::SecondarySchool,
            Activity::Home,
            Activity::Work,
            Activity::Nightclub,
        ]
    }
}

/// Represents a place where people do an activity
#[derive(Serialize, Deserialize)]
pub struct Venue {
    pub id: VenueID,
    pub activity: Activity,

    // TODO Store a geo::Point
    pub latitude: f32,
    pub longitude: f32,
    /// This only exists for PrimarySchool and SecondarySchool. It's a
    /// https://en.wikipedia.org/wiki/Unique_Reference_Number
    pub urn: Option<usize>,
}

#[derive(Serialize, Deserialize)]
pub enum Obesity {
    Obese3,
    Obese2,
    Obese1,
    Overweight,
    Normal,
}

/// A one-time event attended by many people -- like a concert or sports match. Each event is
/// broken into a sequence of contact cycles, involving the same people.
#[derive(Serialize, Deserialize)]
pub struct Event {
    pub event_id: String,
    /// YYYY-MM-DD
    pub date: String,
    pub number_attendees: usize,
    pub location: Point<f64>,
    pub event_type: String,
    /// If false, draw per individual. If true, draw per individual
    pub family: bool,
    pub contact_cycles: Vec<ContactCycle>,
}

/// A single event is broken into different contact cycles, such as queuing, the main concert, an
/// intermission, after-party, etc. Each one might have different risk parameters, but they involve
/// the same people.
#[derive(Serialize, Deserialize)]
pub struct ContactCycle {
    /// estimated number of individual contacts per person per contact cycle
    pub contacts: usize,
    /// transmission risk associated to a typical contact at the event (one-to-one, normalised to one minute)
    pub risk: f64,
    /// total length of the event in minutes
    pub duration: usize,
    /// typical length of a contact cycle in minutes
    pub typical_time: usize,
}

// These are unsigned integers, used to index into different vectors. They're wrapped in a type, so
// we never accidentally confuse a VenueID with a PersonID.

#[derive(
    Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, From, Into, Serialize, Deserialize,
)]
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
