#[macro_use]
extern crate log;

use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;
use maplit::hashmap;
use serde::Deserialize;

fn main() -> Result<()> {
    simple_logger::SimpleLogger::new().init().unwrap();

    // TODO Input from a .yml
    let input = Input {
        initial_cases_per_msoa: hashmap! {
            MSOA("E02002241".to_string()) => 5,
            MSOA("E02002191".to_string()) => 5,
            MSOA("E02002187".to_string()) => 5,
        },
    };

    raw_data_handler(&input)?;

    Ok(())
}

// Equivalent to InitialisationCache
struct StudyAreaCache {
    // individuals.pkl
// activity_locations.pkl
// lockdown.csv
// msoa_building_coordinates.json
}

// Parts of model_parameters/default.yml
struct Input {
    initial_cases_per_msoa: HashMap<MSOA, usize>,
}

// MSOA11CD
//
// TODO Given one of these, how do we look it up?
// - http://statistics.data.gov.uk/id/statistical-geography/E02002191
// - https://mapit.mysociety.org/area/36070.html (they have a paid API)
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
struct MSOA(String);

// raw_data_handler.py
// TODO Just writes a bunch of output files to a fixed location
fn raw_data_handler(input: &Input) -> Result<()> {
    let azure = Path::new("https://ramp0storage.blob.core.windows.net/");

    // This maps MSOA IDs to things like OSM geofabrik URL
    // TODO Who creates/maintains this?
    let lookup_path = download(azure.join("referencedata").join("lookUp.csv"))?;

    // TODO TUS files. county_data/tus_hse_{xyz}.gz. MSOA ID -> NewTU
    // TODO And who creates these?
    // This grabbed tus_hse_west-yorkshire.gz, which is an 800MB (!!) CSV that seems to be a
    // per-person model
    let tus_needed = {
        // TODO This is much more heavyweight than the python one-liner
        let mut result = HashSet::new();
        for rec in csv::Reader::from_reader(File::open(lookup_path)?).deserialize() {
            let rec: MsoaLookupRow = rec?;
            if input.initial_cases_per_msoa.contains_key(&rec.msoa) {
                result.insert(rec.new_tu);
            }
        }
        result
    };
    for tu in tus_needed {
        let path = download(azure.join("countydata").join(&format!("tus_hse_{}.gz", tu)))?;
        untar(path)?;
    }

    // TODO combine all the TU files

    Ok(())
}

#[derive(Deserialize)]
struct MsoaLookupRow {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    #[serde(rename = "NewTU")]
    new_tu: String,
}

/// Returns the filename
fn download(url: PathBuf) -> Result<PathBuf> {
    let filename = url
        .file_name()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap();
    let output = Path::new("raw_data").join(filename);

    info!("Downloading {} to {}", url.display(), output.display());

    if output.exists() {
        info!("... file exists, skipping");
        return Ok(output);
    }

    std::fs::create_dir_all("raw_data")?;
    Command::new("wget")
        .arg(url)
        .arg("-O")
        .arg(&output)
        .status()?;
    // TODO assert success or turn into error
    Ok(output)
}

fn untar(file: PathBuf) -> Result<()> {
    info!("Untarring {}...", file.display());
    // TODO Skipping isn't really idempotent; we still spend time gunzipping. Maybe we have to
    // insist on extracting one known path.
    Command::new("tar")
        .arg("xzvf")
        .arg(file)
        .arg("--directory")
        .arg("raw_data")
        .arg("--skip-old-files")
        .status()?;
    Ok(())
}
