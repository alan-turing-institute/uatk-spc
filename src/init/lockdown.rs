use std::collections::BTreeMap;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::pb::Lockdown;
use crate::{County, MSOA};

#[instrument(skip_all)]
pub fn calculate_lockdown_per_day(
    msoas_per_county: BTreeMap<County, Vec<MSOA>>,
) -> Result<Lockdown> {
    let day0 = "2020-02-15";

    info!("Calculating per-day lockdown values");

    // msoas_per_county only contains counties matching some MSOA in this study area. Just average
    // the value in the Google mobility data for matching counties.

    // Indexed by day. This is change, with all all matching counties listed
    let mut all_changes_per_day: Vec<Vec<f32>> = Vec::new();

    for rec in csv::Reader::from_reader(File::open(
        "data/raw_data/nationaldata-v2/timeAtHomeIncreaseCTY.csv",
    )?)
    .deserialize()
    {
        let rec: Row = rec?;
        // Make sure day 0 is consistent across counties
        if rec.day == 0 {
            assert_eq!(rec.date, day0);
        }

        // The CSV file seems to list days in order, but just in case, pad with 0's to make sure
        // the vector is the right size
        if rec.day >= all_changes_per_day.len() {
            all_changes_per_day.resize(rec.day + 1, Vec::new());
        }
        if msoas_per_county.contains_key(&rec.county) {
            all_changes_per_day[rec.day].push(rec.change);
        }
    }

    // Now average per day
    let mut change_per_day = Vec::new();
    for changes in all_changes_per_day {
        let n = changes.len() as f32;
        let avg = changes.into_iter().sum::<f32>() / n;
        change_per_day.push(avg);
    }

    Ok(Lockdown {
        start_date: day0.to_string(),
        change_per_day,
    })
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "GoogleCTY_CNC")]
    county: County,
    day: usize,
    change: f32,
    date: String,
}
