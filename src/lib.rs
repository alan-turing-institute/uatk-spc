#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod commuting;
mod lockdown;
mod make_population;
mod msoas;
mod population;
mod quant;
pub mod raw_data;
pub mod utilities;

use std::collections::BTreeMap;

use anyhow::Result;
use cap::Cap;
use serde::{Deserialize, Serialize};

// So that utilities::memory_usage works
#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

// Equivalent to InitialisationCache
#[derive(Serialize, Deserialize)]
pub struct StudyAreaCache {
    pub population: population::Population,
    pub info_per_msoa: BTreeMap<MSOA, msoas::InfoPerMSOA>,
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

impl StudyAreaCache {
    pub async fn create(input: Input) -> Result<StudyAreaCache> {
        let raw_results = raw_data::grab_raw_data(&input).await?;
        let population = make_population::initialize(
            raw_results.tus_files,
            input.initial_cases_per_msoa.keys().cloned().collect(),
        )?;
        let info_per_msoa =
            msoas::get_info_per_msoa(population.unique_msoas(), raw_results.osm_directories)?;
        let lockdown_per_day = lockdown::calculate_lockdown_per_day(
            raw_results.msoas_per_google_mobility,
            &info_per_msoa,
            &population,
        )?;

        Ok(StudyAreaCache {
            population,
            info_per_msoa,
            lockdown_per_day,
        })
    }
}
