//! TODO Describe all the everything. This is SPC -- synthetic population catalyst.

#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate tracing;

mod init;
pub mod protobuf;
pub mod tracing_span_tree;
pub mod utilities;

use derive_more::{From, Into};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use typed_index_collections::TiVec;

use anyhow::Result;
use cap::Cap;
use enum_map::{Enum, EnumMap};
use geo::{MultiPolygon, Point};
use ordered_float::NotNan;
use serde::{Deserialize, Serialize};

pub mod pb {
    include!(concat!(env!("OUT_DIR"), "/synthpop.rs"));
}

// Override the memory allocator, so utilities::memory_usage can take measurements
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

/// After running the initialization for a study area, this one file carries all data needed for
/// the simulation.
#[derive(Serialize, Deserialize)]
pub struct Population {
    /// The study area covers these MSOAs
    pub msoas: BTreeSet<MSOA>,

    /// Only VenueIDs for `Activity::Home` index into this
    pub households: TiVec<VenueID, Household>,
    pub people: TiVec<PersonID, Person>,

    /// Per activity, a list of venues. VenueID for the appropriate Activity indexes into this
    /// list. This is not filled out for `Activity::Home`; see `households` for that.
    pub venues_per_activity: EnumMap<Activity, TiVec<VenueID, Venue>>,

    pub info_per_msoa: BTreeMap<MSOA, InfoPerMSOA>,
    /// A number in [0, 1] for each day. 0 means all time just spent at home
    pub lockdown_per_day: Vec<f32>,
}

#[derive(Serialize, Deserialize)]
pub struct Input {
    pub enable_commuting: bool,
    /// Only people living in MSOAs filled out here will be part of the population
    pub msoas: BTreeSet<MSOA>,
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
    pub shape: MultiPolygon<f32>,
    pub population: usize,
    /// All building centroids within this MSOA.
    ///
    /// Note there are many caveats about building data in OpenStreetMap -- what counts as
    /// residential, commercial? And some areas don't have any buildings mapped yet!
    // TODO Not guaranteed to be non-empty
    pub buildings: Vec<Point<f32>>,
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
    pub location: Point<f32>,
    /// An ID from the original data, kept around for debugging
    pub orig_pid: isize,
    /// The Standard Industry Classification for where this person works
    pub sic1d07: Option<usize>,

    // Nobody's older than 256 years
    pub age_years: u8,
    pub obesity: Obesity,
    pub has_cardiovascular_disease: bool,
    pub has_diabetes: bool,
    pub has_high_blood_pressure: bool,

    // This isn't equal to 1 - duration_per_activity[Activity::Home], because the activities
    // captured are a subset of the time-use data.
    pub pr_not_home: f32,

    /// Per activity, a list of venues where this person is likely to go do that activity. The
    /// probabilities sum to 1.
    // TODO Consider a distribution type to represent this
    pub flows_per_activity: EnumMap<Activity, Vec<(VenueID, f64)>>,
    /// These sum to 1, representing a fraction of a day
    pub duration_per_activity: EnumMap<Activity, f64>,
}

impl Person {
    /// Flatten all the flows, regardless of activity
    pub fn get_baseline_flows(&self, places_to_keep_per_person: usize) -> Vec<Flow> {
        let mut flows = Vec::new();
        for activity in Activity::all() {
            let duration = self.duration_per_activity[activity];
            for (venue, flow) in &self.flows_per_activity[activity] {
                // Weight the flows by duration
                flows.push(Flow {
                    activity,
                    venue: *venue,
                    weight: (flow * duration) as f32,
                });
            }
        }

        // Sort by flows, descending
        flows.sort_by_key(|flow| NotNan::new(flow.weight).unwrap());
        flows.reverse();
        // Only keep the top few
        flows.truncate(places_to_keep_per_person);

        flows
    }
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

#[derive(Clone, Debug)]
pub struct Flow {
    // TODO The biggest simplification we could make is encoding Activity into VenueID directly.
    // The "global place ID" concept does this, but in a more complicated way.
    pub activity: Activity,
    pub venue: VenueID,
    pub weight: f32,
}

/// Represents a place where people do an activity
#[derive(Serialize, Deserialize)]
pub struct Venue {
    pub id: VenueID,
    pub activity: Activity,

    pub location: Point<f32>,
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
#[derive(
    Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, From, Into, Serialize, Deserialize,
)]
pub struct VenueID(pub usize);
impl fmt::Display for VenueID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Venue #{}", self.0)
    }
}
