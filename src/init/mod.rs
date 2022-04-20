mod commuting;
mod lockdown;
mod msoas;
mod population;
mod quant;
mod raw_data;

use std::collections::{BTreeMap, BTreeSet};
use std::time::{Duration, Instant};

use anyhow::Result;
use enum_map::EnumMap;
use rand::rngs::StdRng;
use typed_index_collections::TiVec;

use crate::utilities::print_count;
use crate::{Activity, Input, Population, VenueID};
use quant::Threshold;
pub use raw_data::all_msoas_nationally;

impl Population {
    /// Generates a Population for a given area. Also returns the duration for the commuting
    /// calculation, for tracking stats.
    ///
    /// This doesn't download or extract raw data files if they already exist.
    pub async fn create(input: Input, rng: &mut StdRng) -> Result<(Population, Duration)> {
        let raw_results = raw_data::grab_raw_data(&input).await?;

        let _s = info_span!("creating population").entered();
        let mut population = Population {
            msoas: input.msoas,
            households: TiVec::new(),
            people: TiVec::new(),
            venues_per_activity: EnumMap::default(),
            info_per_msoa: BTreeMap::new(),
            lockdown: crate::pb::Lockdown::default(),
        };

        population.info_per_msoa =
            msoas::get_info_per_msoa(&population.msoas, raw_results.osm_directories)?;

        population::read_individual_time_use_and_health_data(
            &mut population,
            raw_results.tus_files,
        )?;

        // The order doesn't matter for these steps
        let commuting_duration = if input.enable_commuting {
            let now = Instant::now();
            commuting::create_commuting_flows(&mut population, rng)?;
            Instant::now() - now
        } else {
            Duration::ZERO
        };
        population::setup_venue_flows(Activity::Retail, Threshold::TopN(10), &mut population)?;
        population::setup_venue_flows(Activity::Nightclub, Threshold::TopN(10), &mut population)?;
        population::setup_venue_flows(
            Activity::PrimarySchool,
            Threshold::TopN(5),
            &mut population,
        )?;
        population::setup_venue_flows(
            Activity::SecondarySchool,
            Threshold::TopN(5),
            &mut population,
        )?;

        // TODO The Python implementation has lots of commented stuff, then some rounding

        population.lockdown =
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
        for msoa in self.info_per_msoa.values() {
            for (activity, flows) in &msoa.flows_per_activity {
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
