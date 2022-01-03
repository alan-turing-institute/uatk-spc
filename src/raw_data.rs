use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::utilities::{basename, download, filename, print_count, untar, unzip};
use crate::{Input, MSOA};

pub struct RawData {
    // The Python implementation appends these into one dataframe, but we can logically do the same
    // later on
    pub tus_files: Vec<String>,
    pub osm_directories: Vec<String>,
}

async fn download_file<P: AsRef<str>>(dir: &str, file: P) -> Result<PathBuf> {
    let azure = Path::new("https://ramp0storage.blob.core.windows.net/");
    // TODO Azure uses nationaldata, countydata, etc. Local output in Python inserts an underscore.
    // Meh?
    let file = file.as_ref();
    download(
        azure.join(dir).join(file),
        Path::new("raw_data").join(dir).join(file),
    )
    .await
}

// Just writes a bunch of output files to a fixed location
pub async fn grab_raw_data(input: &Input) -> Result<RawData> {
    let mut results = RawData {
        tus_files: Vec::new(),
        osm_directories: Vec::new(),
    };

    // This maps MSOA IDs to things like OSM geofabrik URL
    // TODO Who creates/maintains this?
    let lookup_path = download_file("referencedata", "lookUp.csv").await?;

    // TODO Who creates these TUS?
    // tu = time use
    // This grabbed tus_hse_west-yorkshire.gz, which is an 800MB (!!) CSV that seems to be a
    // per-person model
    let mut tus_needed = BTreeSet::new();
    let mut osm_needed = BTreeSet::new();
    // TODO This is much more heavyweight than the python one-liner
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: MsoaLookupRow = rec?;
        if input.initial_cases_per_msoa.contains_key(&rec.msoa) {
            tus_needed.insert(rec.new_tu);
            osm_needed.insert(rec.osm);
        }
    }
    info!(
        "From {} MSOAs, we need {} time use files and {} OSM files",
        print_count(input.initial_cases_per_msoa.len()),
        print_count(tus_needed.len()),
        print_count(osm_needed.len())
    );
    for tu in tus_needed {
        let gzip_path = download_file("countydata", format!("tus_hse_{}.gz", tu)).await?;
        let output_path = format!("raw_data/countydata/tus_hse_{}.csv", tu);
        untar(gzip_path, &output_path)?;
        results.tus_files.push(output_path);
    }
    for osm_url in osm_needed {
        let zip_path = download(
            &osm_url,
            format!("raw_data/countydata/OSM/{}", filename(&osm_url)),
        )
        .await?;
        // TODO .shp.zip, so we have to do basename twice
        let output_dir = format!("raw_data/countydata/OSM/{}/", basename(&basename(&osm_url)));
        unzip(zip_path, &output_dir)?;
        results.osm_directories.push(output_dir);
    }

    let path = download_file("nationaldata", "QUANT_RAMP.tar.gz").await?;
    untar(path, "raw_data/nationaldata/QUANT_RAMP/")?;

    // CommutingOD is all commented out

    download_file("nationaldata", "businessRegistry.csv").await?;

    download_file("nationaldata", "timeAtHomeIncreaseCTY.csv").await?;

    let path = download_file("nationaldata", "MSOAS_shp.tar.gz").await?;
    untar(path, "raw_data/nationaldata/MSOAS_shp/")?;

    Ok(results)
}

#[derive(Deserialize)]
struct MsoaLookupRow {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    #[serde(rename = "NewTU")]
    new_tu: String,
    #[serde(rename = "OSM")]
    osm: String,
}

/// Calculates all MSOAs nationally from the lookup table
pub async fn all_msoas_nationally() -> Result<BTreeSet<MSOA>> {
    let lookup_path = download_file("referencedata", "lookUp.csv").await?;
    let mut msoas = BTreeSet::new();
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: MsoaLookupRow = rec?;
        msoas.insert(rec.msoa);
    }
    Ok(msoas)
}
