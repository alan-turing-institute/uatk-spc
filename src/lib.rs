#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod init;
mod population;
pub mod utilities;

use std::collections::{BTreeMap, BTreeSet};

use anyhow::Result;
use cap::Cap;
use geo::{MultiPolygon, Point};
use serde::{Deserialize, Serialize};

// So that utilities::memory_usage works
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

// Equivalent to InitialisationCache
#[derive(Serialize, Deserialize)]
pub struct StudyAreaCache {
    pub population: population::Population,
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
