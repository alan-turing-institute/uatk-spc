use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::MSOA;

pub fn calculate() -> Result<()> {
    for rec in csv::Reader::from_reader(File::open(
        "raw_data/nationaldata/timeAtHomeIncreaseCTY.csv",
    )?)
    .deserialize()
    {
        let _rec: Row = rec?;
    }

    Ok(())
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "CTY20")]
    cty20: String,
    date: String,
    day: usize,
    change: f64,
}
