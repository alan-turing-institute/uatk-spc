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
mod raw_data;
mod utilities;

use std::collections::BTreeMap;

use anyhow::Result;
use cap::Cap;
use clap::Parser;
use fs_err::File;
use serde::{Deserialize, Serialize};
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

#[global_allocator]
static ALLOCATOR: Cap<std::alloc::System> = Cap::new(std::alloc::System, usize::max_value());

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    /// The path to a CSV file with aggregated origin/destination data
    #[clap(arg_enum)]
    input: InputDataset,
    /// When present, only read the first few households, to run more quickly. Be warned, the
    /// results will be strange
    #[clap(long)]
    max_households: Option<usize>,
}

#[derive(clap::ArgEnum, Clone, Copy, Debug, Serialize, Deserialize)]
/// Which counties to operate on
enum InputDataset {
    WestYorkshireSmall,
    WestYorkshireLarge,
    Devon,
    TwoCounties,
    National,
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

    let args = Args::parse();

    let input = args.to_input().await?;
    let raw_results = raw_data::grab_raw_data(&input).await?;
    let population = make_population::initialize(raw_results.tus_files, input.max_households)?;
    let info_per_msoa =
        msoas::get_info_per_msoa(population.unique_msoas(), raw_results.osm_directories)?;
    let lockdown_per_day = lockdown::calculate_lockdown_per_day(
        raw_results.msoas_per_google_mobility,
        &info_per_msoa,
        &population,
    )?;

    let cache = StudyAreaCache {
        population,
        info_per_msoa,
        lockdown_per_day,
    };
    info!("Writing study area cache for {:?}", input.dataset);
    utilities::write_binary(&cache, format!("processed_data/{:?}.bin", input.dataset))?;

    Ok(())
}

impl Args {
    async fn to_input(self) -> Result<Input> {
        let mut input = Input {
            dataset: self.input,
            initial_cases_per_msoa: BTreeMap::new(),
            max_households: self.max_households,
        };

        let csv_input = match self.input {
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
#[derive(Serialize, Deserialize)]
struct StudyAreaCache {
    population: population::Population,
    info_per_msoa: BTreeMap<MSOA, msoas::InfoPerMSOA>,
    lockdown_per_day: Vec<f64>,
}

// Parts of model_parameters/default.yml
pub struct Input {
    dataset: InputDataset,
    initial_cases_per_msoa: BTreeMap<MSOA, usize>,
    max_households: Option<usize>,
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
fn memory_usage() -> String {
    format!(
        "Memory usage: {}",
        indicatif::HumanBytes(ALLOCATOR.allocated() as u64)
    )
}
