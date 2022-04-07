mod commuting;
mod events;
mod lockdown;
mod msoas;
mod population;
mod quant;
mod raw_data;

use anyhow::Result;
use rand::rngs::StdRng;

use crate::{Input, Population};
pub use raw_data::all_msoas_nationally;

impl Population {
    /// Generates a Population for a given area.
    ///
    /// This doesn't download or extract raw data files if they already exist.
    pub async fn create(input: Input, rng: &mut StdRng) -> Result<Population> {
        let raw_results = raw_data::grab_raw_data(&input).await?;
        let mut population = population::create(input, raw_results.tus_files, rng)?;
        population.info_per_msoa =
            msoas::get_info_per_msoa(&population.msoas, raw_results.osm_directories)?;
        population.lockdown_per_day =
            lockdown::calculate_lockdown_per_day(raw_results.msoas_per_county, &population)?;
        population.events = events::load_events("../config/eventDataConcerts.csv")?;
        Ok(population)
    }
}
