use std::collections::{BTreeMap, BTreeSet, HashMap};

use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use serde::Deserialize;
use typed_index_collections::TiVec;

use crate::utilities::{print_count, progress_count};
use crate::{Activity, PersonID, Population, Venue, VenueID, MSOA};

#[tracing::instrument(skip_all)]
pub fn create_commuting_flows(population: &mut Population, rng: &mut StdRng) -> Result<()> {
    let mut all_workers: Vec<PersonID> = Vec::new();
    // Only keep businesses in MSOAs where a worker lives.
    //
    // The rationale: if we're restricting the study area, we don't want to send people to work far
    // away, where the only activity occuring is work.
    let mut msoas = BTreeSet::new();
    for person in &population.people {
        if person.duration_per_activity[Activity::Work] > 0.0 {
            all_workers.push(person.id);
            msoas.insert(population.households[person.household].msoa.clone());
        }
    }

    let mut businesses = Businesses::load(msoas)?;
    let markets = JobMarket::create(population, &businesses, &all_workers, rng);

    info!("Matching {} job markets", markets.len());
    for market in markets {
        if let Some(sic) = market.sic {
            info!("Assigning workplaces for SIC {sic}");
        } else {
            info!("Assigning workplaces for everyone, ignoring SIC");
        }
        assert_eq!(market.jobs.len(), market.workers.len());

        let mut choices: Vec<(BusinessID, usize)> = market.to_job_choices();

        let pb = progress_count(market.jobs.len());
        // TODO Slow. Cache Haversine?
        for person in market.workers {
            pb.inc(1);
            let person_location = population.people[person].location;
            let pair = choices
                .choose_weighted_mut(rng, |(id, available_jobs)| {
                    let dist = person_location.haversine_distance(&businesses.locations[id]);
                    (*available_jobs as f32) / dist.powi(2)
                })
                .unwrap();

            // This job is gone
            pair.1 -= 1;
            let venue_id = businesses.get_venue(pair.0);

            // Assign the one and only workplace
            population.people[person].flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];
        }
    }

    // Create venues
    population.venues_per_activity[Activity::Work] = businesses.venues;

    Ok(())
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    // Represents the centroid of an LSOA
    lng: f32,
    lat: f32,
    // The number of workers
    size: usize,
    sic1d07: usize,
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize)]
struct BusinessID(u32);

struct Businesses {
    list_per_sic: HashMap<usize, Vec<BusinessID>>,
    locations: HashMap<BusinessID, Point<f32>>,
    available_jobs: HashMap<BusinessID, usize>,

    // Assign numeric VenueIDs as we decide to use a business.
    business_to_venue: HashMap<BusinessID, VenueID>,
    venues: TiVec<VenueID, Venue>,
}

impl Businesses {
    fn load(msoas: BTreeSet<MSOA>) -> Result<Businesses> {
        let mut result = Businesses {
            list_per_sic: HashMap::new(),
            locations: HashMap::new(),
            available_jobs: HashMap::new(),

            business_to_venue: HashMap::new(),
            venues: TiVec::new(),
        };

        // Find all of the businesses, grouped by the Standard Industry Classification.
        info!("Finding all businesses");
        let mut total_jobs = 0;
        for rec in csv::Reader::from_reader(File::open(
            "data/raw_data/nationaldata/businessRegistry.csv",
        )?)
        .deserialize()
        {
            let rec: Row = rec?;
            if msoas.contains(&rec.msoa) {
                // The CSV has string IDs, but they're not used anywhere else. Use integer IDs,
                // which're much faster to copy around.
                let id = BusinessID(result.locations.len().try_into()?);
                result
                    .list_per_sic
                    .entry(rec.sic1d07)
                    .or_insert_with(Vec::new)
                    .push(id);
                result.locations.insert(id, Point::new(rec.lng, rec.lat));
                result.available_jobs.insert(id, rec.size);
                total_jobs += rec.size;
            }
        }
        info!(
            "{} jobs available among {} businesses",
            print_count(total_jobs),
            print_count(result.locations.len())
        );
        Ok(result)
    }

    fn get_venue(&mut self, business_id: BusinessID) -> VenueID {
        // Do the ID lookup, creating new ones as needed
        match self.business_to_venue.get(&business_id) {
            Some(id) => *id,
            None => {
                let venue_id = VenueID(self.business_to_venue.len());
                self.business_to_venue.insert(business_id, venue_id);
                let location = &self.locations[&business_id];
                self.venues.push(Venue {
                    id: venue_id,
                    activity: Activity::Work,
                    location: *location,
                    urn: None,
                });
                venue_id
            }
        }
    }
}

struct JobMarket {
    sic: Option<usize>,
    // workers and jobs have equal length
    workers: Vec<PersonID>,
    jobs: Vec<BusinessID>,
}

impl JobMarket {
    fn create(
        population: &Population,
        businesses: &Businesses,
        all_workers: &Vec<PersonID>,
        rng: &mut StdRng,
    ) -> Vec<JobMarket> {
        // min proportion of the population that must be preserved when using the sic1d07 classification
        // TODO Plumb from YAML
        let sic_threshold = 0.0;

        let mut markets = Vec::new();

        // First pair workers and jobs using SIC
        info!("Grouping people by SIC");
        for (sic, business_list) in &businesses.list_per_sic {
            let mut jobs: Vec<BusinessID> = Vec::new();
            for id in business_list {
                // Repeat based on how many jobs available there
                for _ in 0..businesses.available_jobs[id] {
                    jobs.push(*id);
                }
            }

            // Find workers with a matching SIC
            let mut workers: Vec<PersonID> = Vec::new();
            for id in all_workers {
                if population.people[*id].sic1d07 == Some(*sic) {
                    workers.push(*id);
                }
            }

            // If we have less jobs than people, pick who we want to work
            if jobs.len() < workers.len() {
                workers.shuffle(rng);
                workers.truncate(jobs.len());
            }
            // Likewise, we may have too many jobs
            if jobs.len() > workers.len() {
                jobs.shuffle(rng);
                jobs.truncate(workers.len());
            }

            markets.push(JobMarket {
                sic: Some(*sic),
                workers,
                jobs,
            });
        }

        // How many people wind up with a job if we match by SIC?
        let total_sic_workers: usize = markets.iter().map(|market| market.workers.len()).sum();
        let ratio = (total_sic_workers as f64) / (all_workers.len() as f64);
        info!(
            "If we match workers to jobs by SIC, {} / {} = {:.02} get a job. SIC threshold is {}",
            print_count(total_sic_workers),
            print_count(all_workers.len()),
            ratio,
            sic_threshold
        );
        if ratio >= sic_threshold {
            markets.sort_by_key(|market| market.sic);
            return markets;
        }

        // Give up on using SIC. Just match up all workers with all jobs.
        let mut all_jobs: Vec<BusinessID> = Vec::new();
        for (id, size) in &businesses.available_jobs {
            for _ in 0..*size {
                all_jobs.push(*id);
            }
        }
        return vec![JobMarket {
            sic: None,
            workers: all_workers.clone(),
            jobs: all_jobs,
        }];
    }

    fn to_job_choices(&self) -> Vec<(BusinessID, usize)> {
        let mut counts: BTreeMap<BusinessID, usize> = BTreeMap::new();
        for id in &self.jobs {
            *counts.entry(*id).or_insert(0) += 1;
        }
        counts.into_iter().collect()
    }
}
