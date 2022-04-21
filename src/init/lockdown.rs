use std::collections::BTreeMap;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::pb::Lockdown;
use crate::utilities::print_count;
use crate::{County, Population, MSOA};

#[instrument(skip_all)]
pub fn calculate_lockdown_per_day(
    msoas_per_county: BTreeMap<County, Vec<MSOA>>,
    population: &Population,
) -> Result<Lockdown> {
    let day0 = "2020-02-15";

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
    let total_population = population_per_county.values().sum();
    info!(
        "Population has {} people, but based on per-county sum, it's {}",
        print_count(population.people.len()),
        print_count(total_population)
    );

    // Indexed by day. This is change * population, summed over all matching counties
    let mut total_change_per_day: Vec<f32> = Vec::new();

    for rec in csv::Reader::from_reader(File::open(
        "data/raw_data/nationaldata/timeAtHomeIncreaseCTY.csv",
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
        if rec.day >= total_change_per_day.len() {
            total_change_per_day.resize(rec.day + 1, 0.0);
        }
        // We only have some Google mobility regions
        if let Some(pop) = population_per_county.get(&rec.county) {
            // Weight by the population in this area
            total_change_per_day[rec.day] += rec.change * (*pop as f32);
        }
    }

    // Find the mean decrease of time spent outside of home, over the entire population
    let mean_pr_home_tot = population
        .people
        .iter()
        .map(|person| person.time_use.home_total as f32)
        .sum::<f32>()
        / total_population as f32;

    let mut per_day = Vec::new();
    for change in total_change_per_day {
        // Re-scale the change by total population
        let x = change / total_population as f32;
        // From extra time at home to less time away from home
        per_day.push((1.0 - (mean_pr_home_tot * x)) / (1.0 - mean_pr_home_tot));
    }

    Ok(Lockdown {
        start_date: day0.to_string(),
        per_day,
    })
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "CTY20")]
    county: County,
    day: usize,
    change: f32,
    date: String,
}
