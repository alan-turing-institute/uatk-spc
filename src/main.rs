//! This is the command-line interface to SPC.

use std::collections::BTreeSet;
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use std::time::Instant;

use anyhow::Result;
use clap::Parser;
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use tracing::{info, info_span};

use spc::utilities::{memory_usage, print_count};
use spc::{protobuf, Input, Population, MSOA};

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

    let (input, region) = args.to_input().await?;
    let _s = info_span!("initialisation", ?region).entered();
    let (population, commuting_runtime) = Population::create(input, &mut rng).await?;

    info!("By the end, {}", memory_usage());

    info!("Saving output file");
    let pb_file_size = indicatif::HumanBytes({
        // Create the output dir if needed
        fs_err::create_dir_all("data/output")?;
        let output = format!("data/output/{region}.pb");
        let _s = info_span!("Writing protobuf to", ?output).entered();
        protobuf::convert_to_pb(&population, output)?
    } as u64)
    .to_string();

    if output_stats {
        write_stats(
            &population,
            &region,
            pb_file_size,
            indicatif::HumanDuration(Instant::now() - start).to_string(),
            indicatif::HumanDuration(commuting_runtime).to_string(),
        )?;
    }

    Ok(())
}

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    msoa_input: String,
    #[clap(long)]
    no_commuting: bool,
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
    async fn to_input(self) -> Result<(Input, String)> {
        let mut input = Input {
            enable_commuting: !self.no_commuting,
            filter_empty_msoas: self.filter_empty_msoas,
            msoas: BTreeSet::new(),
            sic_threshold: self.sic_threshold,
        };
        let region = Path::new(&self.msoa_input)
            .file_stem()
            .unwrap()
            .to_os_string()
            .into_string()
            .unwrap();

        // A special case
        if region == "national" {
            input.msoas = MSOA::all_msoas_nationally().await?;
            Ok((input, "national".to_string()))
        } else {
            for line in BufReader::new(File::open(&self.msoa_input)?).lines() {
                // Strip leading/trailing quotes
                let msoa = MSOA(line?.trim_matches('"').to_string());
                input.msoas.insert(msoa);
            }
            Ok((input, region))
        }
    }
}

fn write_stats(
    population: &Population,
    region: &str,
    pb_file_size: String,
    runtime: String,
    commuting_runtime: String,
) -> Result<()> {
    let num_msoas = print_count(population.msoas.len());
    let num_households = print_count(population.households.len());
    let num_people = print_count(population.people.len());
    let memory_usage = memory_usage()
        .strip_prefix("Memory usage: ")
        .unwrap()
        .to_string();
    let mut file = File::create("stats.csv")?;
    // The formatted numbers use commas; add quotes around them
    writeln!(file, "study_area,num_msoas,num_households,num_people,pb_file_size,runtime,commuting_runtime,memory_usage")?;
    writeln!(
        file,
        r#""{region}","{num_msoas}","{num_households}","{num_people}","{pb_file_size}","{runtime}","{commuting_runtime}","{memory_usage}""#
    )?;
    Ok(())
}
