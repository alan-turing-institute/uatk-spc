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

use anyhow::Result;
use maplit::hashmap;
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
        initial_cases_per_msoa: hashmap! {
            MSOA("E02002241".to_string()) => 5,
            MSOA("E02002191".to_string()) => 5,
            MSOA("E02002187".to_string()) => 5,
        },
    };

    if true {
        raw_data::grab_raw_data(&input).await?;
    }
    let _population = make_population::initialize()?;

    Ok(())
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
