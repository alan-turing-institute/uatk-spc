use base64ct::{Base64, Encoding};
use fs_err::File;
use rand::rngs::StdRng;
use rand::SeedableRng;
use sha2::{Digest, Sha256};
use spc::{protobuf, Input, Population, MSOA};
use std::collections::BTreeSet;
use std::io::{BufRead, BufReader};
// use tracing::{info, info_span};

#[tokio::test]
#[ignore = "requires data retrieval."]
async fn test_determinism() -> anyhow::Result<()> {
    spc::tracing_span_tree::SpanTree::new().enable();
    let seed = 0;
    let tmp_path = tempfile::tempdir()
        .unwrap()
        .path()
        .as_os_str()
        .to_str()
        .unwrap()
        .to_string();
    // let mut rng = StdRng::seed_from_u64(seed);
    let msoas = BTreeSet::new();
    let mut input = Input {
        year: 2020,
        filter_empty_msoas: false,
        enable_commuting: true,
        sic_threshold: 0.,
        msoas,
    };
    let country: &str = "England";
    let region: &str = "rutland";
    let input_path: &str = &format!("config/{country}/{region}.txt");
    BufReader::new(File::open(input_path)?)
        .lines()
        .for_each(|line| {
            input
                .msoas
                .insert(MSOA(line.unwrap().trim_matches('"').to_string()));
        });

    // Run 1 with seed
    let (population, _) =
        Population::create(input.clone(), &mut StdRng::seed_from_u64(seed)).await?;
    let dir = format!("{tmp_path}/data/output/{country}/{}", population.year);
    std::fs::create_dir_all(&dir).unwrap();
    let output = format!("{dir}/{region}{}.pb", 1);
    protobuf::convert_to_pb(&population, output.clone())?;
    let hash1 = Base64::encode_string(&Sha256::digest(std::fs::read(output).unwrap()));

    // Run 2 with same seed
    let (population, _) =
        Population::create(input.clone(), &mut StdRng::seed_from_u64(seed)).await?;
    let dir = format!("{tmp_path}/data/output/{country}/{}", population.year);
    std::fs::create_dir_all(&dir).unwrap();
    let output = format!("{dir}/{region}{}.pb", 2);
    protobuf::convert_to_pb(&population, output.clone())?;
    let hash2 = Base64::encode_string(&Sha256::digest(std::fs::read(output).unwrap()));

    assert_eq!(hash1, hash2);

    // Run 3 with different seed
    let seed_diff = 1u64;
    let (population, _) = Population::create(input, &mut StdRng::seed_from_u64(seed_diff)).await?;
    let dir = format!("{tmp_path}/data/output/{country}/{}", population.year);
    std::fs::create_dir_all(&dir).unwrap();
    let output = format!("{dir}/{region}{}.pb", 3);
    protobuf::convert_to_pb(&population, output.clone())?;
    let hash3 = Base64::encode_string(&Sha256::digest(std::fs::read(output).unwrap()));

    assert!(hash1 != hash3);

    Ok(())
}
