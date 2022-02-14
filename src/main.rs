//! This is the command-line interface to RAMP.

#[macro_use]
extern crate log;

use std::collections::BTreeMap;

use anyhow::Result;
use clap::Parser;
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use serde::Deserialize;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

use ramp::utilities;
use ramp::{Input, Model, Population, Snapshot, MSOA};

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

    let mut rng = if let Some(seed) = args.rng_seed {
        StdRng::seed_from_u64(seed)
    } else {
        StdRng::from_entropy()
    };

    match args.action {
        Action::Init { region } => {
            let input = region.to_input().await?;
            let population = Population::create(input, &mut rng).await?;

            // First clear the target directory
            let target_dir = format!("processed_data/{:?}", region);
            // Ignore errors if this directory doesn't even exist
            let _ = fs_err::remove_dir_all(&target_dir);
            fs_err::create_dir_all(format!("{target_dir}/snapshot"))?;

            info!("By the end, {}", utilities::memory_usage());
            // Write all data to a file only readable from Rust (using Serde)
            let output = format!("{target_dir}/rust_cache.bin");
            info!("Writing population to {}", output);
            utilities::write_binary(&population, output)?;

            // Write the snapshot in the format the Python pipeline expects
            info!("Writing snapshot");
            Snapshot::convert_to_npz(population, target_dir, &mut rng)?;
        }
        Action::RunModel { region } => {
            info!("Loading population");
            let population =
                utilities::read_binary::<Population>(format!("processed_data/{:?}.bin", region))?;
            let mut model = Model::new(population, rng)?;
            model.run()?;
        }
    }

    Ok(())
}

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    #[clap(subcommand)]
    action: Action,
    /// By default, the output will be different every time the tool is run, based on a different
    /// random number generator seed. Specify this to get deterministic behavior, given the same
    /// input.
    #[clap(long)]
    rng_seed: Option<u64>,
}

#[derive(clap::ArgEnum, Clone, Copy, Debug)]
/// Which counties to operate on
enum Region {
    WestYorkshireSmall,
    WestYorkshireLarge,
    Devon,
    TwoCounties,
    National,
}

#[derive(clap::Subcommand, Clone)]
enum Action {
    /// Import raw data and build an activity model for a region
    Init {
        #[clap(arg_enum)]
        region: Region,
    },
    /// Run the model, for a fixed number of days
    RunModel {
        #[clap(arg_enum)]
        region: Region,
    },
}

impl Region {
    async fn to_input(self) -> Result<Input> {
        let mut input = Input {
            initial_cases_per_msoa: BTreeMap::new(),
        };

        // Determine the MSOAs to operate on using CSV files from the original repo
        let csv_input = match self {
            Region::WestYorkshireSmall => "Input_Test_3.csv",
            Region::WestYorkshireLarge => "Input_WestYorkshire.csv",
            Region::Devon => "Input_Devon.csv",
            Region::TwoCounties => "Input_Test_accross.csv",
            Region::National => {
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
