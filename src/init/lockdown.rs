use std::collections::BTreeMap;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::{Activity, County, Population, MSOA};

/// The result is in [0, 1]
pub fn calculate_lockdown_per_day(
    msoas_per_county: BTreeMap<County, Vec<MSOA>>,
    population: &Population,
) -> Result<Vec<f64>> {
    info!("Calculating per-day lockdown values");

    // First get the total population per Google mobility area (which is a bunch of MSOAs)
    let population_per_county: BTreeMap<County, usize> = msoas_per_county
        .into_iter()
        .map(|(county, msoas)| {
            (
                county,
                msoas
                    .iter()
                    .map(|msoa| population.info_per_msoa[msoa].population)
                    .sum(),
            )
        })
        .collect();

    // Indexed by day
    let mut total_change_per_day: Vec<f64> = Vec::new();

    for rec in csv::Reader::from_reader(File::open(
        "raw_data/nationaldata/timeAtHomeIncreaseCTY.csv",
    )?)
    .deserialize()
    {
        let rec: Row = rec?;
        // The CSV file seems to list days in order, but just in case, pad with 0's to make sure
        // the vector is the right size
        if rec.day >= total_change_per_day.len() {
            total_change_per_day.resize(rec.day + 1, 0.0);
        }
        // We only have some Google mobility regions
        if let Some(pop) = population_per_county.get(&rec.county) {
            // Weight by the population in this area
            total_change_per_day[rec.day] += rec.change * (*pop as f64);
        }
    }

    // Find the mean probability of staying at home, over the entire population
    let mean_pr_home = population
        .people
        .iter()
        .map(|person| person.duration_per_activity[Activity::Home])
        .sum::<f64>()
        / population.people.len() as f64;

    let mut lockdown_per_day = Vec::new();
    let total_population: f64 = population_per_county.values().sum::<usize>() as f64;
    for change in total_change_per_day {
        // Re-scale the change by total population
        let x = change / total_population;
        // "From extra time at home to less time away from home"
        lockdown_per_day.push((1.0 - (mean_pr_home * x)) / mean_pr_home);
    }

    Ok(lockdown_per_day)
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "CTY20")]
    county: County,
    day: usize,
    change: f64,
    // date doesn't matter
}
