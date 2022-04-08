//! This is the command-line interface to SPC.

use std::collections::BTreeSet;
use std::path::Path;

use anyhow::Result;
use clap::Parser;
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use serde::Deserialize;
use tracing::{info, info_span};

use spc::{protobuf, utilities, Input, Population, MSOA};

#[tokio::main]
async fn main() -> Result<()> {
    spc::tracing_span_tree::SpanTree::new().enable();

    let args = Args::parse();

    let mut rng = if let Some(seed) = args.rng_seed {
        StdRng::seed_from_u64(seed)
    } else {
        StdRng::from_entropy()
    };

    let (input, region) = args.to_input().await?;
    let _s = info_span!("initialisation", ?region).entered();
    let population = Population::create(input, &mut rng).await?;

    info!("By the end, {}", utilities::memory_usage());

    {
        // Create the output dir if needed
        fs_err::create_dir_all("data/output")?;
        let output = format!("data/output/{region}.pb");
        let _s = info_span!("Writing protobuf to", ?output).entered();
        protobuf::convert_to_pb(&population, output)?;
    }

    Ok(())
}

#[derive(Parser)]
#[clap(about, version, author)]
struct Args {
    msoa_input: String,
    #[clap(long)]
    no_commuting: bool,
    /// By default, the output will be different every time the tool is run, based on a different
    /// random number generator seed. Specify this to get deterministic behavior, given the same
    /// input.
    #[clap(long)]
    rng_seed: Option<u64>,
}

impl Args {
    async fn to_input(self) -> Result<(Input, String)> {
        let mut input = Input {
            enable_commuting: !self.no_commuting,
            msoas: BTreeSet::new(),
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
            for rec in csv::Reader::from_reader(File::open(&self.msoa_input)?).deserialize() {
                let rec: Row = rec?;
                input.msoas.insert(rec.msoa);
            }
            Ok((input, region))
        }
    }
}

// TODO We could just read raw lines
#[derive(Deserialize)]
struct Row {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
}
