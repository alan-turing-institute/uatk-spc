#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod commuting;
pub mod lockdown;
pub mod make_population;
pub mod msoas;
mod population;
mod quant;
pub mod raw_data;
pub mod utilities;

use std::collections::BTreeMap;

use anyhow::Result;
use cap::Cap;
use fs_err::File;
use serde::{Deserialize, Serialize};

#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

#[derive(clap::ArgEnum, Clone, Copy, Debug, Serialize, Deserialize)]
pub enum InputDataset {
    WestYorkshireSmall,
    WestYorkshireLarge,
    Devon,
    TwoCounties,
    National,
}

impl InputDataset {
    pub async fn to_input(self) -> Result<Input> {
        let mut input = Input {
            dataset: self,
            initial_cases_per_msoa: BTreeMap::new(),
        };

        let csv_input = match self {
            InputDataset::WestYorkshireSmall => "Input_Test_3.csv",
            InputDataset::WestYorkshireLarge => "Input_WestYorkshire.csv",
            InputDataset::Devon => "Input_Devon.csv",
            InputDataset::TwoCounties => "Input_Test_accross.csv",
            InputDataset::National => {
                for msoa in raw_data::all_msoas_nationally().await? {
                    input.initial_cases_per_msoa.insert(msoa, default_cases());
                }
                return Ok(input);
            }
        };
        let csv_path = format!("model_parameters/{}", csv_input);
        for rec in csv::Reader::from_reader(File::open(csv_path)?).deserialize() {
            let rec: InitialCaseRow = rec?;
            input.initial_cases_per_msoa.insert(rec.msoa, rec.cases);
        }
        Ok(input)
    }
}

#[derive(Deserialize)]
struct InitialCaseRow {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    // It's just missing from some of the input files...
    #[serde(default = "default_cases")]
    cases: usize,
}
fn default_cases() -> usize {
    5
}

// Equivalent to InitialisationCache
#[derive(Serialize, Deserialize)]
pub struct StudyAreaCache {
    pub population: population::Population,
    pub info_per_msoa: BTreeMap<MSOA, msoas::InfoPerMSOA>,
    pub lockdown_per_day: Vec<f64>,
}

// Parts of model_parameters/default.yml
pub struct Input {
    pub dataset: InputDataset,
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

// TODO I don't trust the results...
pub fn memory_usage() -> String {
    format!(
        "Memory usage: {}",
        indicatif::HumanBytes(ALLOCATOR.allocated() as u64)
    )
}
