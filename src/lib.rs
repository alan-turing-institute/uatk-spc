//! TODO Describe all the everything. This is SPC -- synthetic population catalyst.

#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate tracing;

mod init;
pub mod protobuf;
pub mod tracing_span_tree;
pub mod utilities;
pub mod writers;

use derive_more::{From, Into};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use typed_index_collections::TiVec;

use anyhow::Result;
use cap::Cap;
use enum_map::{Enum, EnumMap};
use geo::{MultiPolygon, Point};
use serde::Deserialize;

pub mod pb {
    include!(concat!(env!("OUT_DIR"), "/synthpop.rs"));
}

// Override the memory allocator, so utilities::memory_usage can take measurements
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

/// After running the initialization for a study area, this one file carries all data needed for
/// the simulation.
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

    pub lockdown: pb::Lockdown,
    pub time_use_diaries: TiVec<DiaryID, pb::TimeUseDiary>,

    pub year: u32,
}

#[derive(Clone)]
pub struct Input {
    pub year: u32,
    pub enable_commuting: bool,
    pub filter_empty_msoas: bool,
    /// Only people living in MSOAs filled out here will be part of the population
    pub msoas: BTreeSet<MSOA>,
    /// The minimum proportion of the population that must be preserved when using the sic1d2007
    /// classification
    pub sic_threshold: f64,
}

/// A region of the UK with around 7800 people.
///
/// See https://en.wikipedia.org/wiki/ONS_coding_system. This is usually called `MSOA11CD`.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
pub struct MSOA(pub String);

/// A region of the UK with around X people.
///
/// See https://en.wikipedia.org/wiki/ONS_coding_system. This is usually called `OA11CD`.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
pub struct OA(pub String);

/// This represents a 2020 county boundary, which contains several MSOAs. It's used in Google
/// mobility data. It's not the same county as defined by ONS.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
pub struct County(String);

impl MSOA {
    pub async fn all_msoas_nationally() -> Result<BTreeSet<MSOA>> {
        init::all_msoas_nationally().await
    }
}

pub struct InfoPerMSOA {
    pub shape: MultiPolygon<f32>,
    pub population: u64,
    /// All building centroids within this MSOA.
    ///
    /// Note there are many caveats about building data in OpenStreetMap -- what counts as
    /// residential, commercial? And some areas don't have any buildings mapped yet!
    // TODO Not guaranteed to be non-empty
    pub buildings: Vec<Point<f32>>,
    /// Per activity, a list of venues where anybody in this MSOA is likely to go do that activity.
    /// The probabilities sum to 1.
    // TODO Consider a distribution type to represent this
    pub flows_per_activity: EnumMap<Activity, Vec<(VenueID, f64)>>,
}

/// A special type of venue where people live
pub struct Household {
    pub id: VenueID,
    pub msoa: MSOA,
    pub oa: OA,
    pub members: Vec<PersonID>,
    pub details: pb::HouseholdDetails,
}

pub struct Person {
    pub id: PersonID,
    pub household: VenueID,
    pub workplace: Option<VenueID>,
    /// This is the centroid of the household's OA. It's redundant to store it per person, but very
    /// convenient.
    pub location: Point<f32>,

    pub identifiers: pb::Identifiers,
    pub demographics: pb::Demographics,
    pub employment: pb::Employment,
    pub health: pb::Health,

    pub events: pb::Events,
    pub weekday_diaries: Vec<DiaryID>,
    pub weekend_diaries: Vec<DiaryID>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Enum)]
pub enum Activity {
    Retail,
    PrimarySchool,
    SecondarySchool,
    Home,
    Work,
}

/// Represents a place where people do an activity
pub struct Venue {
    pub id: VenueID,
    pub activity: Activity,

    pub location: Point<f32>,
    /// This only exists for PrimarySchool and SecondarySchool. It's a
    /// https://en.wikipedia.org/wiki/Unique_Reference_Number
    pub urn: Option<String>,
}

// These are unsigned integers, used to index into different vectors. They're wrapped in a type, so
// we never accidentally confuse a VenueID with a PersonID.

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, From, Into)]
pub struct PersonID(pub usize);
impl fmt::Display for PersonID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Person #{}", self.0)
    }
}

/// These IDs are scoped by Activity. This means two VenueIDs may be equal, but represent different
/// places!
// TODO Just encode Activity in here too
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, From, Into)]
pub struct VenueID(pub usize);
impl fmt::Display for VenueID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Venue #{}", self.0)
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, From, Into)]
pub struct DiaryID(pub usize);
impl fmt::Display for DiaryID {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Diary #{}", self.0)
    }
}
