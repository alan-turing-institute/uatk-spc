#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

mod utilities;

use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::path::Path;

use anyhow::Result;
use maplit::hashmap;
use serde::Deserialize;

use self::utilities::{basename, download, untar, unzip};

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
        let path = download(azure.join("countydata").join(&format!("tus_hse_{}.gz", tu)))?;
        untar(path)?;
    }
    for osm_url in osm_needed {
        let path = download(osm_url.into())?;
        let output_dir = format!("raw_data/osm/{}", basename(&path));
        unzip(path, output_dir)?;
    }

    // TODO combine all the TU files

    // TODO Azure calls it nationaldata, local output seems to be national_data
    let path = download(azure.join("nationaldata").join("QUANT_RAMP.tar.gz"))?;
    untar(path)?;

    // CommutingOD is all commented out

    download(azure.join("nationaldata").join("businessRegistry.csv"))?;

    download(azure.join("nationaldata").join("timeAtHomeIncreaseCTY.csv"))?;

    let path = download(azure.join("nationaldata").join("MSOAS_shp.tar.gz"))?;
    untar(path)?;

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
