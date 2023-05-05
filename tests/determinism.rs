use std::collections::BTreeSet;
use std::io::{BufRead, BufReader};

use anyhow::Result;
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use sha2::{Digest, Sha256};

use spc::{protobuf, Input, Population, MSOA};

// Gets the hex encoded SHA256 hash from a generated population protobuf output given input and rng.
async fn population_protobuf_hash(input: &Input, dir: &str, mut rng: StdRng) -> Result<String> {
    let (population, _) = Population::create(input.clone(), &mut rng).await?;
    std::fs::create_dir_all(dir).unwrap();
    let output = format!("{dir}/population.pb");
    protobuf::convert_to_pb(&population, output.clone())?;
    Ok(hex::encode(Sha256::digest(std::fs::read(output).unwrap())))
}

// To run: `cargo test --release -- --include-ignored`
#[tokio::test]
#[ignore = "requires data retrieval."]
async fn test_determinism() -> Result<()> {
    // Create tmp dir for saving output files
    let tmp_dir = tempfile::tempdir()
        .unwrap()
        .path()
        .to_path_buf()
        .into_os_string()
        .into_string()
        .unwrap();

    // Input for a single test region
    let input = Input {
        year: 2020,
        filter_empty_msoas: false,
        enable_commuting: true,
        sic_threshold: 0.,
        msoas: BufReader::new(File::open("config/England/rutland.txt")?)
            .lines()
            .fold(BTreeSet::new(), |mut acc, line| {
                acc.insert(MSOA(line.unwrap().trim_matches('"').to_string()));
                acc
            }),
    };

    // Run with specified seed
    let hash = population_protobuf_hash(&input, &tmp_dir, StdRng::seed_from_u64(0)).await?;

    // Run with same seed (expected to produce same hash)
    let hash_same = population_protobuf_hash(&input, &tmp_dir, StdRng::seed_from_u64(0)).await?;
    assert!(hash == hash_same);

    // Run with different seed (expected to produce different hash)
    let hash_diff = population_protobuf_hash(&input, &tmp_dir, StdRng::seed_from_u64(1)).await?;
    assert!(hash != hash_diff);

    Ok(())
}
