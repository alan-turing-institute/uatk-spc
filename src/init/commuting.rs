use std::collections::BTreeMap;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::{VenueID, MSOA};

pub fn get_commuting_flows() -> Result<BTreeMap<MSOA, Vec<(VenueID, f64)>>> {
    // The work activity flows come from a different source, not QUANT data like everything else.
    for rec in csv::Reader::from_reader(File::open("raw_data/nationaldata/businessRegistry.csv")?)
        .deserialize()
    {
        let _rec: Row = rec?;
    }

    let result = BTreeMap::new();
    Ok(result)
}

#[allow(unused)]
#[derive(Deserialize)]
struct Row {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    lng: f64,
    lat: f64,

    // TODO What do all of these mean?
    id: String,
    size: usize,
    // Each person also has this
    sic1d07: usize,
    // sic2d07 isn't unused
}
