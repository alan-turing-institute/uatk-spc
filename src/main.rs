#[macro_use]
extern crate log;

use anyhow::Result;
use clap::Parser;
use simplelog::{ColorChoice, ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

use ramp::{InputDataset, StudyAreaCache};

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    /// Which counties to operate on
    #[clap(arg_enum)]
    input: InputDataset,
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

    let input = args.input.to_input().await?;
    let raw_results = ramp::raw_data::grab_raw_data(&input).await?;
    let population = ramp::make_population::initialize(
        raw_results.tus_files,
        input.initial_cases_per_msoa.keys().cloned().collect(),
    )?;
    let info_per_msoa =
        ramp::msoas::get_info_per_msoa(population.unique_msoas(), raw_results.osm_directories)?;
    let lockdown_per_day = ramp::lockdown::calculate_lockdown_per_day(
        raw_results.msoas_per_google_mobility,
        &info_per_msoa,
        &population,
    )?;

    let cache = StudyAreaCache {
        population,
        info_per_msoa,
        lockdown_per_day,
    };
    info!("Memory currently at {}", ramp::memory_usage());
    info!("Writing study area cache for {:?}", input.dataset);
    ramp::utilities::write_binary(&cache, format!("processed_data/{:?}.bin", input.dataset))?;

    Ok(())
}
