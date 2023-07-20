use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::utilities::{basename, download, filename, gunzip, print_count, untar, unzip};
use crate::{County, Input, MSOA, OA};

pub struct RawDataResults {
    pub population_files: Vec<String>,
    pub osm_directories: Vec<String>,
    pub msoas_per_county: BTreeMap<County, Vec<MSOA>>,
    pub oa_to_msoa: BTreeMap<OA, MSOA>,
}

#[instrument(skip_all)]
pub async fn grab_raw_data(input: &Input) -> Result<RawDataResults> {
    let mut results = RawDataResults {
        population_files: Vec::new(),
        osm_directories: Vec::new(),
        msoas_per_county: BTreeMap::new(),
        oa_to_msoa: BTreeMap::new(),
    };

    // This maps MSOA IDs to things like OSM geofabrik URL
    let lookup_path = gunzip(download_file("referencedata", "lookUp-GB.csv.gz").await?)?;

    let mut pop_files_needed = BTreeSet::new();
    let mut osm_needed = BTreeSet::new();
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: LookupRow = rec?;
        results.oa_to_msoa.insert(rec.oa, rec.msoa.clone());
        if input.msoas.contains(&rec.msoa) {
            pop_files_needed.insert((rec.country, rec.azure_ref));
            osm_needed.insert(rec.osm);
            results
                .msoas_per_county
                .entry(rec.county)
                .or_insert_with(Vec::new)
                .push(rec.msoa.clone());
        }
    }
    info!(
        "From {} MSOAs, we need {} time use files and {} OSM files",
        print_count(input.msoas.len()),
        print_count(pop_files_needed.len()),
        print_count(osm_needed.len())
    );

    for (country, area) in pop_files_needed {
        results.population_files.push(gunzip(
            download_file(
                &format!("countydata-v2-1/{country}/{}", input.year),
                format!("pop_{area}_{}.csv.gz", input.year,),
            )
            .await?,
        )?);
    }

    for osm_url in osm_needed {
        let zip_path = download(
            &osm_url,
            format!("data/raw_data/countydata-v2-1/OSM/{}", filename(&osm_url)),
        )
        .await?;
        // TODO .shp.zip, so we have to do basename twice
        let output_dir = format!(
            "data/raw_data/countydata-v2-1/OSM/{}/",
            basename(basename(&osm_url))
        );
        unzip(zip_path, &output_dir)?;
        results.osm_directories.push(output_dir);
    }

    let path = download_file("nationaldata-v2", "QUANT_RAMP_spc.tar.gz").await?;
    untar(path, "data/raw_data/nationaldata-v2/QUANT_RAMP/")?;

    gunzip(download_file("nationaldata-v2", "businessRegistry.csv.gz").await?)?;

    gunzip(download_file("nationaldata-v2", "timeAtHomeIncreaseCTY.csv.gz").await?)?;

    download_file("nationaldata-v2", "GIS/MSOA_2011_Pop20.geojson").await?;

    gunzip(download_file("nationaldata-v2", "diariesRef.csv.gz").await?)?;

    Ok(results)
}

#[derive(Deserialize)]
struct LookupRow {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    #[serde(rename = "OA11CD")]
    oa: OA,
    #[serde(rename = "AzureRef")]
    azure_ref: String,
    #[serde(rename = "OSM")]
    osm: String,
    #[serde(rename = "GoogleMob")]
    county: County,
    #[serde(rename = "Country")]
    country: String,
}

/// Calculates all MSOAs nationally from the lookup table
pub async fn all_msoas_nationally() -> Result<BTreeSet<MSOA>> {
    let lookup_path = gunzip(download_file("referencedata", "lookUp-GB.csv.gz").await?)?;
    let mut msoas = BTreeSet::new();
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: LookupRow = rec?;
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
