use std::collections::HashSet;
use std::fs::File;
use std::path::Path;

use anyhow::Result;
use serde::Deserialize;

use crate::utilities::{basename, download, untar, unzip};
use crate::{Input, MSOA};

// TODO Just writes a bunch of output files to a fixed location
pub async fn grab_raw_data(input: &Input) -> Result<()> {
    let azure = Path::new("https://ramp0storage.blob.core.windows.net/");

    // This maps MSOA IDs to things like OSM geofabrik URL
    // TODO Who creates/maintains this?
    let lookup_path = download(azure.join("referencedata").join("lookUp.csv")).await?;

    // TODO TUS files. county_data/tus_hse_{xyz}.gz. MSOA ID -> NewTU
    // TODO And who creates these?
    // tu = time use
    // This grabbed tus_hse_west-yorkshire.gz, which is an 800MB (!!) CSV that seems to be a
    // per-person model
    let mut tus_needed = HashSet::new();
    let mut osm_needed = HashSet::new();
    // TODO This is much more heavyweight than the python one-liner
    for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
        let rec: MsoaLookupRow = rec?;
        if input.initial_cases_per_msoa.contains_key(&rec.msoa) {
            tus_needed.insert(rec.new_tu);
            osm_needed.insert(rec.osm);
        }
    }
    for tu in tus_needed {
        let path = download(azure.join("countydata").join(&format!("tus_hse_{}.gz", tu))).await?;
        untar(path, format!("raw_data/tus_hse_{}.csv", tu))?;
    }
    for osm_url in osm_needed {
        let path = download(osm_url.into()).await?;
        let output_dir = format!("raw_data/osm/{}", basename(&path));
        unzip(path, output_dir)?;
    }

    // TODO combine all the TU files
    // TODO combine all the OSM shapefiles files

    // TODO Azure calls it nationaldata, local output seems to be national_data
    let path = download(azure.join("nationaldata").join("QUANT_RAMP.tar.gz")).await?;
    untar(path, "raw_data/QUANT_RAMP/".to_string())?;

    // CommutingOD is all commented out

    download(azure.join("nationaldata").join("businessRegistry.csv")).await?;

    download(azure.join("nationaldata").join("timeAtHomeIncreaseCTY.csv")).await?;

    let path = download(azure.join("nationaldata").join("MSOAS_shp.tar.gz")).await?;
    untar(path, "raw_data/MSOAS_shp/".to_string())?;

    // TODO Some transformation of the lockdown file, "Dealing with the TimeAtHomeIncrease data".
    // It gets pickled later.

    Ok(())
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
