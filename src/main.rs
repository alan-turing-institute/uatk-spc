//! This is the command-line interface to SPC.

use std::collections::BTreeSet;
use std::io::{BufRead, BufReader, Write};
use std::time::Instant;

use anyhow::Result;
use clap::Parser;
use fs_err::{File, OpenOptions};
use rand::rngs::StdRng;
use rand::SeedableRng;
use serde::{Deserialize, Serialize};
use spc::protobuf::encoded_len;
use spc::writers::{WriteJSON, WriteParquet};
use strum_macros::EnumString;
use tracing::{info, info_span};

use spc::utilities::{memory_usage, print_count};
use spc::{pb, protobuf, Input, Population, MSOA};

#[tokio::main]
async fn main() -> Result<()> {
    spc::tracing_span_tree::SpanTree::new().enable();

    let args = Args::parse();

    let mut rng = if let Some(seed) = args.rng_seed {
        StdRng::seed_from_u64(seed)
    } else {
        StdRng::from_entropy()
    };

    let start = Instant::now();
    let output_stats = args.output_stats;
    let output_format = args.output_formats.clone();
    let (input, country, region) = args.to_input().await?;
    let _s = info_span!("initialisation", ?region).entered();
    let (population, commuting_runtime) = Population::create(input, &mut rng).await?;

    info!("By the end, {}", memory_usage());

    info!("Saving output file");

    // Create the output dir if needed
    let dir = format!("data/output/{country}/{}", population.year);
    fs_err::create_dir_all(&dir)?;

    // Convert to protobuf population
    let pb_population: pb::Population = (&population).try_into()?;
    let pb_file_size = indicatif::HumanBytes(encoded_len(&pb_population) as u64).to_string();

    // Write outputs as parquet and JSON if OutputFormat is `All`` or `Parquet``
    let _s_outer = info_span!("writing outputs").entered();
    if output_format.contains(&OutputFormat::Parquet) {
        let output = format!("{dir}/{region}_households.parquet");
        let _s = info_span!("writing households to", ?output).entered();
        pb_population.households.write_parquet(&output)?;
        drop(_s);
        let output = format!("{dir}/{region}_people.parquet");
        let _s = info_span!("writing people to", ?output).entered();
        pb_population.people.write_parquet(&output)?;
        drop(_s);
        let output = format!("{dir}/{region}_time_use_diaries.parquet");
        let _s = info_span!("writing time use diaries to", ?output).entered();
        pb_population.time_use_diaries.write_parquet(&output)?;
        drop(_s);
        let output = format!("{dir}/{region}_venues.parquet");
        let _s = info_span!("writing venues to", ?output).entered();
        pb_population.venues_per_activity.write_parquet(&output)?;
        drop(_s);
        let output = format!("{dir}/{region}_info_per_msoa.json");
        let _s = info_span!("writing info per MSOA to", ?output).entered();
        pb_population.info_per_msoa.write_json(&output)?;
        drop(_s);
    }
    // Write outputs as parquet and JSON if OutputFormat is `All`` or `Protobuf`
    if output_format.contains(&OutputFormat::Protobuf) {
        let output = format!("{dir}/{region}.pb");
        let _s = info_span!("writing protobuf to", ?output).entered();
        protobuf::write_pb(&pb_population, output)?;
    }

    if output_stats {
        write_stats(
            &population,
            format!("{country}/{region}"),
            pb_file_size,
            indicatif::HumanDuration(Instant::now() - start).to_string(),
            indicatif::HumanDuration(commuting_runtime).to_string(),
        )?;
    }

    Ok(())
}

#[derive(Clone, Debug, Deserialize, Serialize, EnumString, PartialEq, Eq)]
#[strum(ascii_case_insensitive)]
enum OutputFormat {
    Protobuf,
    Parquet,
}

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    msoa_input: String,
    #[clap(long, default_value_t = 2020)]
    year: u32,
    #[clap(long)]
    no_commuting: bool,
    /// Specify output format
    #[clap(
        long,
        help = "Comma-separated list of output formats (`protobuf` or `parquet` currently supported)",
        value_delimiter = ',',
        num_args = 1,
        default_value = "protobuf"
    )]
    output_formats: Vec<OutputFormat>,
    #[clap(long)]
    filter_empty_msoas: bool,
    /// Write a `stats.json` file at the end for automated benchmarking
    #[clap(long)]
    output_stats: bool,
    /// By default, the output will be different every time the tool is run, based on a different
    /// random number generator seed. Specify this to get deterministic behavior, given the same
    /// input.
    #[clap(long)]
    rng_seed: Option<u64>,
    /// The minimum proportion of the population that must be preserved when using the sic1d2007
    /// classification
    #[clap(long, default_value_t = 0.0)]
    sic_threshold: f64,
}

impl Args {
    async fn to_input(self) -> Result<(Input, String, String)> {
        let mut input = Input {
            year: self.year,
            enable_commuting: !self.no_commuting,
            filter_empty_msoas: self.filter_empty_msoas,
            msoas: BTreeSet::new(),
            sic_threshold: self.sic_threshold,
        };

        let path_pieces: Vec<_> = self.msoa_input.split("/").collect();
        let mut country = "unknown_country".to_string();
        let mut region = "unknown_region".to_string();
        if path_pieces.len() == 3 && path_pieces[0] == "config" {
            country = path_pieces[1].to_string();
            // Strip the .txt
            region = path_pieces[2].split(".").next().unwrap().to_string();
        }

        // A special case
        if region == "national" {
            input.msoas = MSOA::all_msoas_nationally().await?;
            Ok((input, "UK".to_string(), "national".to_string()))
        } else {
            for line in BufReader::new(File::open(&self.msoa_input)?).lines() {
                // Strip leading/trailing quotes
                let msoa = MSOA(line?.trim_matches('"').to_string());
                input.msoas.insert(msoa);
            }
            Ok((input, country, region))
        }
    }
}

fn write_stats(
    population: &Population,
    country_region: String,
    pb_file_size: String,
    runtime: String,
    commuting_runtime: String,
) -> Result<()> {
    let year = population.year;
    let num_msoas = print_count(population.msoas.len());
    let num_households = print_count(population.households.len());
    let num_people = print_count(population.people.len());
    let memory_usage = memory_usage()
        .strip_prefix("Memory usage: ")
        .unwrap()
        .to_string();
    let mut file = OpenOptions::new().append(true).open("stats.csv")?;
    writeln!(
        file,
        r#""{year}","{country_region}","{num_msoas}","{num_households}","{num_people}","{pb_file_size}","{runtime}","{commuting_runtime}","{memory_usage}""#
    )?;
    Ok(())
}
