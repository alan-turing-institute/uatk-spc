use std::collections::BTreeSet;
use std::io::{BufRead, BufReader};

use anyhow::Result;
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use serde::Serialize;
use sha2::{Digest, Sha256};

use spc::writers::{WriteJSON, WriteParquet};
use spc::{pb, Input, Population, MSOA};

// Generate protobuf population.
async fn generate_population(input: &Input, mut rng: StdRng) -> Result<pb::Population> {
    let (population, _) = Population::create(input.clone(), &mut rng).await?;
    pb::Population::try_from(&population)
}

// Generate SHA256 hash from bytes object.
fn generate_hash(bytes: impl AsRef<[u8]>) -> String {
    hex::encode(Sha256::digest(bytes))
}

// Gets the hex encoded SHA256 hash from a generated population protobuf output given input and rng.
fn population_protobuf_hash(population: &pb::Population) -> Result<String> {
    Ok(generate_hash(bincode::serialize(&population)?))
}

// Test output determinism for parquet
fn test_parquet_determinism(
    tmp_dir: &str,
    field_0: impl WriteParquet,
    field_1: impl WriteParquet,
    field_2: impl WriteParquet,
    seed_determinism: bool,
) -> Result<()> {
    field_0.write_parquet(&format!("{tmp_dir}/out_0.pq"))?;
    field_1.write_parquet(&format!("{tmp_dir}/out_1.pq"))?;
    field_2.write_parquet(&format!("{tmp_dir}/out_2.pq"))?;

    let hash_0 = generate_hash(std::fs::read(format!("{tmp_dir}/out_0.pq"))?);
    let hash_1 = generate_hash(std::fs::read(format!("{tmp_dir}/out_1.pq"))?);
    let hash_2 = generate_hash(std::fs::read(format!("{tmp_dir}/out_2.pq"))?);
    assert!(hash_0 == hash_1);
    if seed_determinism {
        assert!(hash_0 == hash_2);
    } else {
        assert!(hash_0 != hash_2);
    }
    Ok(())
}

// Test output determinism for JSON (expected to be invariant for different seeds)
fn test_json_determinism(
    tmp_dir: &str,
    field_0: impl WriteJSON + Serialize,
    field_1: impl WriteJSON + Serialize,
    field_2: impl WriteJSON + Serialize,
    expected_determinism_independent_of_seed: bool,
) -> Result<()> {
    field_0.write_json(&format!("{tmp_dir}/out_0.json"))?;
    field_1.write_json(&format!("{tmp_dir}/out_1.json"))?;
    field_2.write_json(&format!("{tmp_dir}/out_2.json"))?;

    let hash_0 = generate_hash(std::fs::read(format!("{tmp_dir}/out_0.json"))?);
    let hash_1 = generate_hash(std::fs::read(format!("{tmp_dir}/out_1.json"))?);
    let hash_2 = generate_hash(std::fs::read(format!("{tmp_dir}/out_2.json"))?);
    assert!(hash_0 == hash_1);
    if expected_determinism_independent_of_seed {
        assert!(hash_0 == hash_2);
    } else {
        assert!(hash_0 != hash_2);
    }
    Ok(())
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
    std::fs::create_dir_all(&tmp_dir)?;

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

    // Generate populations
    let pop_0 = generate_population(&input, StdRng::seed_from_u64(0)).await?;
    // Run with same seed (expected to produce same hash for protobuf)
    let pop_1 = generate_population(&input, StdRng::seed_from_u64(0)).await?;
    // Run with different seed (expected to produce different hash for protobuf)
    let pop_2 = generate_population(&input, StdRng::seed_from_u64(1)).await?;

    // Check protobuf determinism: compare hashes
    let hash_0 = population_protobuf_hash(&pop_0)?;
    let hash_1 = population_protobuf_hash(&pop_1)?;
    let hash_2 = population_protobuf_hash(&pop_2)?;
    assert!(hash_0 == hash_1);
    assert!(hash_0 != hash_2);

    // Test expected parquet and JSON determinism
    test_parquet_determinism(&tmp_dir, pop_0.people, pop_1.people, pop_2.people, false)?;
    test_parquet_determinism(
        &tmp_dir,
        pop_0.households,
        pop_1.households,
        pop_2.households,
        true,
    )?;
    test_parquet_determinism(
        &tmp_dir,
        pop_0.venues_per_activity,
        pop_1.venues_per_activity,
        pop_2.venues_per_activity,
        true,
    )?;
    test_parquet_determinism(
        &tmp_dir,
        pop_0.time_use_diaries,
        pop_1.time_use_diaries,
        pop_2.time_use_diaries,
        true,
    )?;
    test_json_determinism(
        &tmp_dir,
        pop_0.info_per_msoa,
        pop_1.info_per_msoa,
        pop_2.info_per_msoa,
        true,
    )?;

    Ok(())
}
