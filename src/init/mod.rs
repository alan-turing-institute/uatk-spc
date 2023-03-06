mod commuting;
mod diaries;
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
            time_use_diaries: TiVec::new(),
            year: input.year,
        };

        population.info_per_msoa =
            msoas::get_info_per_msoa(&population.msoas, raw_results.osm_directories)?;

        population::read_people(
            &mut population,
            raw_results.population_files,
            raw_results.oa_to_msoa,
        )?;

        // The order doesn't matter for these steps
        let commuting_duration = if input.enable_commuting {
            let now = Instant::now();
            commuting::create_commuting_flows(&mut population, input.sic_threshold, rng)?;
            Instant::now() - now
        } else {
            Duration::ZERO
        };
        population::setup_venue_flows(Activity::Retail, Threshold::TopN(10), &mut population)?;
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

        population.lockdown = lockdown::calculate_lockdown_per_day(raw_results.msoas_per_county)?;
        population.remove_unused_venues();

        diaries::load_time_use_diaries(&mut population)?;
        diaries::load_diaries_per_person(&mut population)?;

        if input.filter_empty_msoas {
            let mut msoas_seen = BTreeSet::new();
            for hh in &population.households {
                msoas_seen.insert(hh.msoa.clone());
            }
            let n = population.info_per_msoa.len();
            population
                .info_per_msoa
                .retain(|msoa, _| msoas_seen.contains(msoa));
            let change = n - population.info_per_msoa.len();
            if change != 0 {
                warn!("Filtered out {change} empty MSOAs");
            }
        }

        Ok((population, commuting_duration))
    }

    // Remove venues where nobody goes
    //
    // TODO Should we do this earlier and only keep venues matching our input MSOAs (the same as
    // where people live?)
    // - Since we take the top N flows, it could change the results
    // - Do we have to check if the venue's location is physically inside an MSOA polygon, or do we
    //  use the *Population.csv files somehow?
    fn remove_unused_venues(&mut self) {
        let mut visited_venues: BTreeSet<(Activity, VenueID)> = BTreeSet::new();
        for msoa in self.info_per_msoa.values() {
            for (activity, flows) in &msoa.flows_per_activity {
                for (venue, _) in flows {
                    visited_venues.insert((activity, *venue));
                }
            }
        }

        for (activity, venues) in &mut self.venues_per_activity {
            // Home and Work are not stored in per-MSOA flows, so don't touch them
            if activity == Activity::Home || activity == Activity::Work {
                continue;
            }

            let mut unvisited_venues = 0;

            // Remove unused venues, which means we'll have to rewrite all VenueIDs for this
            // activity. Build up an old -> new mapping
            let mut id_mapping: BTreeMap<VenueID, VenueID> = BTreeMap::new();
            let mut surviving_venues = TiVec::new();
            for mut venue in venues.drain(..) {
                if visited_venues.contains(&(activity, venue.id)) {
                    let old_id = venue.id;
                    venue.id = VenueID(surviving_venues.len());
                    id_mapping.insert(old_id, venue.id);
                    surviving_venues.push(venue);
                } else {
                    unvisited_venues += 1;
                }
            }
            *venues = surviving_venues;

            // There's only one other place that stores VenueIDs for these activities
            for info in self.info_per_msoa.values_mut() {
                for (old_id, _) in &mut info.flows_per_activity[activity] {
                    *old_id = id_mapping[old_id];
                }
            }

            info!(
                "Removed {} unvisited venues for {:?}",
                print_count(unvisited_venues),
                activity
            );
        }
    }
}
