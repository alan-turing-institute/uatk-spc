#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod commuting;
mod make_population;
mod msoa_buildings;
mod population;
mod quant;
mod raw_data;
mod utilities;

use std::collections::BTreeMap;

use anyhow::Result;
use cap::Cap;
use clap::arg_enum;
use fs_err::File;
use serde::Deserialize;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};
use structopt::StructOpt;

#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

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
        National,
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

    let input = args.input.to_input().await?;
    let raw_results = raw_data::grab_raw_data(&input).await?;
    let population = make_population::initialize(raw_results.tus_files)?;

    let _buildings_per_msoa = msoa_buildings::get_buildings_per_msoa(
        population.unique_msoas(),
        raw_results.osm_directories,
    )?;

    Ok(())
}

impl InputDataset {
    async fn to_input(self) -> Result<Input> {
        let mut input = Input {
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
        // TODO This code depends on the main repo being cloned in a particular path. Move those files
        // here
        let csv_path = format!("/home/dabreegster/RAMP-UA/model_parameters/{}", csv_input);
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
/*struct StudyAreaCache {
    // individuals.pkl
    // activity_locations.pkl
    // lockdown.csv
    // msoa_building_coordinates.json
}*/

// Parts of model_parameters/default.yml
pub struct Input {
    initial_cases_per_msoa: BTreeMap<MSOA, usize>,
}

// MSOA11CD
//
// TODO Given one of these, how do we look it up?
// - http://statistics.data.gov.uk/id/statistical-geography/E02002191
// - https://mapit.mysociety.org/area/36070.html (they have a paid API)
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
pub struct MSOA(String);

// TODO I don't trust the results...
fn memory_usage() -> String {
    format!(
        "Memory usage: {}",
        indicatif::HumanBytes(ALLOCATOR.allocated() as u64)
    )
}
