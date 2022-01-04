//! This is the command-line interface to RAMP.

#[macro_use]
extern crate log;

use std::collections::BTreeMap;

use anyhow::Result;
use clap::Parser;
use fs_err::File;
use serde::Deserialize;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

use ramp::utilities;
use ramp::{Input, StudyAreaCache, MSOA};

#[tokio::main]
async fn main() -> Result<()> {
    // Specify the logging format
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
    let cache = StudyAreaCache::create(input).await?;

    info!("By the end, {}", utilities::memory_usage());
    let output = format!("processed_data/{:?}.bin", args.dataset);
    info!("Writing study area cache to {}", output);
    utilities::write_binary(&cache, output)?;

    Ok(())
}

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    /// Which counties to operate on
    #[clap(arg_enum)]
    dataset: InputDataset,
}

#[derive(clap::ArgEnum, Clone, Debug)]
enum InputDataset {
    WestYorkshireSmall,
    WestYorkshireLarge,
    Devon,
    TwoCounties,
    National,
}

impl Args {
    async fn to_input(&self) -> Result<Input> {
        let mut input = Input {
            initial_cases_per_msoa: BTreeMap::new(),
        };

        // Determine the MSOAs to operate on using CSV files from the original repo
        let csv_input = match self.dataset {
            InputDataset::WestYorkshireSmall => "Input_Test_3.csv",
            InputDataset::WestYorkshireLarge => "Input_WestYorkshire.csv",
            InputDataset::Devon => "Input_Devon.csv",
            InputDataset::TwoCounties => "Input_Test_accross.csv",
            InputDataset::National => {
                for msoa in MSOA::all_msoas_nationally().await? {
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
    // This field is missing from some of the input files
    #[serde(default = "default_cases")]
    cases: usize,
}

fn default_cases() -> usize {
    5
}
