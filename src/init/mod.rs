mod commuting;
mod lockdown;
mod msoas;
mod population;
mod quant;
mod raw_data;

use anyhow::Result;

pub use self::raw_data::all_msoas_nationally;
use crate::{Input, Population};

impl Population {
    /// Generates a Population for a given area.
    ///
    /// This doesn't download or extract raw data files if they already exist.
    pub async fn create(input: Input) -> Result<Population> {
        let raw_results = raw_data::grab_raw_data(&input).await?;
        let mut population = population::create(
            raw_results.tus_files,
            input.initial_cases_per_msoa.keys().cloned().collect(),
        )?;
        population.info_per_msoa =
            msoas::get_info_per_msoa(population.unique_msoas(), raw_results.osm_directories)?;
        population.lockdown_per_day =
            lockdown::calculate_lockdown_per_day(raw_results.msoas_per_county, &population)?;
        Ok(population)
    }
}
