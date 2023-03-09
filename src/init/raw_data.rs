use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::utilities::{basename, download, filename, gunzip, print_count, untar, unzip};
use crate::{County, Input, MSOA};

pub struct RawDataResults {
    pub population_files: Vec<String>,
    pub osm_directories: Vec<String>,
    pub msoas_per_county: BTreeMap<County, Vec<MSOA>>,
}

#[instrument(skip_all)]
pub async fn grab_raw_data(input: &Input) -> Result<RawDataResults> {
    let mut results = RawDataResults {
        population_files: Vec::new(),
        osm_directories: Vec::new(),
        msoas_per_county: BTreeMap::new(),
    };

    // This maps MSOA IDs to things like OSM geofabrik URL
    let lookup_path = gunzip(download_file("referencedata", "lookUp-GB.csv.gz").await?)?;

    let mut pop_files_needed = BTreeSet::new();
    let mut osm_needed = BTreeSet::new();
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: MsoaLookupRow = rec?;
        if input.msoas.contains(&rec.msoa) {
            pop_files_needed.insert(rec.azure_ref);
            osm_needed.insert(rec.osm);
            results
                .msoas_per_county
                .entry(rec.county)
                .or_insert_with(Vec::new)
                .push(rec.msoa);
        }
    }
    info!(
        "From {} MSOAs, we need {} time use files and {} OSM files",
        print_count(input.msoas.len()),
        print_count(pop_files_needed.len()),
        print_count(osm_needed.len())
    );

    for area in pop_files_needed {
        // TODO The path will change -- Year, country, then something like pop_central-valleys_2020.gz
        let gzip_path = download_file("countydata", format!("pop_{area}.gz")).await?;
        let output_path = format!("data/raw_data/countydata/pop_{area}.csv");
        untar(gzip_path, &output_path)?;
        results.population_files.push(output_path);
    }

    for osm_url in osm_needed {
        let zip_path = download(
            &osm_url,
            format!("data/raw_data/countydata/OSM/{}", filename(&osm_url)),
        )
        .await?;
        // TODO .shp.zip, so we have to do basename twice
        let output_dir = format!(
            "data/raw_data/countydata/OSM/{}/",
            basename(&basename(&osm_url))
        );
        unzip(zip_path, &output_dir)?;
        results.osm_directories.push(output_dir);
    }

    let path = download_file("nationaldata-v2", "QUANT_RAMP_spc.tar.gz").await?;
    untar(path, "data/raw_data/nationaldata-v2/QUANT_RAMP/")?;

    let zip_path = download_file("nationaldata-v2", "businessRegistry.csv.zip").await?;
    unzip(zip_path, "data/raw_data/nationaldata-v2/")?;

    let zip_path = download_file("nationaldata-v2", "timeAtHomeIncreaseCTY.csv.zip").await?;
    unzip(zip_path, "data/raw_data/nationaldata-v2/")?;

    download_file("nationaldata-v2", "GIS/MSOA_2011_Pop20.geojson").await?;

    gunzip(download_file("nationaldata-v2", "diariesRef.csv.gz").await?)?;

    Ok(results)
}

#[derive(Deserialize)]
struct MsoaLookupRow {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    #[serde(rename = "AzureRef")]
    azure_ref: String,
    #[serde(rename = "OSM")]
    osm: String,
    #[serde(rename = "GoogleMob")]
    county: County,
}

/// Calculates all MSOAs nationally from the lookup table
pub async fn all_msoas_nationally() -> Result<BTreeSet<MSOA>> {
    let lookup_path = gunzip(download_file("referencedata", "lookUp-GB.csv.gz").await?)?;
    let mut msoas = BTreeSet::new();
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: MsoaLookupRow = rec?;
        msoas.insert(rec.msoa);
    }
    Ok(msoas)
}

async fn download_file<P: AsRef<str>>(dir: &str, file: P) -> Result<PathBuf> {
    let azure = Path::new("https://ramp0storage.blob.core.windows.net/");
    let file = file.as_ref();
    download(
        azure.join(dir).join(file),
        Path::new("data/raw_data").join(dir).join(file),
    )
    .await
}
