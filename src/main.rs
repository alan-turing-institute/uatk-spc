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
use clap::arg_enum;
use fs_err::File;
use serde::Deserialize;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};
use std::path::Path;
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(name = "rampfs", about = "Rapid Assistance in Modelling the Pandemic")]
struct Args {
    /// The path to a CSV file with aggregated origin/destination data
    #[structopt(possible_values = &InputDataset::variants(), case_insensitive = true)]
    input: InputDataset,
}

arg_enum! {
    #[derive(Debug)]
    /// Which counties to operate on
    enum InputDataset {
        WestYorkshireSmall,
        WestYorkshireLarge,
        Devon,
        TwoCounties,
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    TermLogger::init(
        LevelFilter::Info,
        ConfigBuilder::new()
            .set_time_format_str("%H:%M:%S%.3f")
            .set_location_level(LevelFilter::Error)
            .build(),
        TerminalMode::Stderr,
        ColorChoice::Auto,
    )?;

    let args = Args::from_args();

    // TODO Input from a .yml
    let csv_input = match args.input {
        InputDataset::WestYorkshireSmall => "Input_Test_3.csv",
        InputDataset::WestYorkshireLarge => "Input_WestYorkshire.csv",
        InputDataset::Devon => "Input_Devon.csv",
        InputDataset::TwoCounties => "Input_Test_accross.csv",
    };
    // TODO This code depends on the main repo being cloned in a particular path. Move those files
    // here
    let csv_path = format!("/home/dabreegster/RAMP-UA/model_parameters/{}", csv_input);
    let input = Input {
        initial_cases_per_msoa: load_initial_cases_per_msoa(csv_path)?,
    };

    let raw_results = raw_data::grab_raw_data(&input).await?;
    let _population = make_population::initialize(raw_results)?;

    Ok(())
}

fn load_initial_cases_per_msoa<P: AsRef<Path>>(path: P) -> Result<HashMap<MSOA, usize>> {
    let mut cases = HashMap::new();
    for rec in csv::Reader::from_reader(File::open(path.as_ref())?).deserialize() {
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
