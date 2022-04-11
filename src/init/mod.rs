mod commuting;
mod lockdown;
mod msoas;
mod population;
mod quant;
mod raw_data;

use std::collections::BTreeSet;
use std::time::Duration;

use anyhow::Result;
use rand::rngs::StdRng;

use crate::utilities::print_count;
use crate::{Activity, Input, Population, VenueID};
pub use raw_data::all_msoas_nationally;

impl Population {
    /// Generates a Population for a given area. Also returns the duration for the commuting
    /// calculation, for tracking stats.
    ///
    /// This doesn't download or extract raw data files if they already exist.
    pub async fn create(input: Input, rng: &mut StdRng) -> Result<(Population, Duration)> {
        let raw_results = raw_data::grab_raw_data(&input).await?;
        let (mut population, commuting_duration) =
            population::create(input, raw_results.tus_files, rng)?;
        population.info_per_msoa =
            msoas::get_info_per_msoa(&population.msoas, raw_results.osm_directories)?;
        population.lockdown_per_day =
            lockdown::calculate_lockdown_per_day(raw_results.msoas_per_county, &population)?;
        population.remove_unused_venues();
        Ok((population, commuting_duration))
    }

    // Remove venues where nobody goes (by zeroing out the location)
    //
    // TODO Should we do this earlier and only keep venues matching our input MSOAs (the same as
    // where people live?)
    // - Since we take the top N flows, it could change the results
    // - Do we have to check if the venue's location is physically inside an MSOA polygon, or do we
    //  use the *Population.csv files somehow?
    //
    //  TODO Actually remove the venues from the output entirely, and compact VenueIDs.
    fn remove_unused_venues(&mut self) {
        let mut visited_venues: BTreeSet<(Activity, VenueID)> = BTreeSet::new();
        for person in &self.people {
            for (activity, flows) in &person.flows_per_activity {
                for (venue, _) in flows {
                    visited_venues.insert((activity, *venue));
                }
            }
        }
        let mut unvisited_venues = 0;
        for (activity, venues) in &mut self.venues_per_activity {
            for (id, venue) in venues.iter_mut_enumerated() {
                if !visited_venues.contains(&(activity, id)) {
                    unvisited_venues += 1;
                    venue.location = geo::Point::new(0.0, 0.0);
                }
            }
        }
        info!("Removed {} unvisited venues", print_count(unvisited_venues));
    }
}
