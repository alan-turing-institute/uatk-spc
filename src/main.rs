#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod commuting;
mod make_population;
mod population;
mod quant;
mod raw_data;
mod utilities;

use std::collections::HashMap;
use std::fs::File;

use anyhow::Result;
use serde::Deserialize;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

#[tokio::main]
async fn main() -> Result<()> {
    TermLogger::init(
        LevelFilter::Debug,
        ConfigBuilder::new()
            .set_time_format_str("%H:%M:%S%.3f")
            .set_location_level(LevelFilter::Error)
            .build(),
        TerminalMode::Stderr,
        ColorChoice::Auto,
    )?;

    // TODO Input from a .yml
    let input = Input {
        initial_cases_per_msoa: load_initial_cases_per_msoa(
            //"/home/dabreegster/RAMP-UA/model_parameters/Input_Test_3.csv",
            "/home/dabreegster/RAMP-UA/model_parameters/Input_WestYorkshire.csv",
        )?,
    };

    if true {
        raw_data::grab_raw_data(&input).await?;
    }
    let _population = make_population::initialize()?;

    Ok(())
}

fn load_initial_cases_per_msoa(path: &str) -> Result<HashMap<MSOA, usize>> {
    let mut cases = HashMap::new();
    for rec in csv::Reader::from_reader(File::open(path)?).deserialize() {
        let rec: InitialCaseRow = rec?;
        cases.insert(rec.msoa, rec.cases);
    }
    Ok(cases)
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
/*struct StudyAreaCache {
    // individuals.pkl
    // activity_locations.pkl
    // lockdown.csv
    // msoa_building_coordinates.json
}*/

// Parts of model_parameters/default.yml
pub struct Input {
    initial_cases_per_msoa: HashMap<MSOA, usize>,
}

// MSOA11CD
//
// TODO Given one of these, how do we look it up?
// - http://statistics.data.gov.uk/id/statistical-geography/E02002191
// - https://mapit.mysociety.org/area/36070.html (they have a paid API)
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
pub struct MSOA(String);
