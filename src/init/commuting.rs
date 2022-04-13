use std::collections::{BTreeMap, BTreeSet, HashMap};

use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use indicatif::{MultiProgress, ProgressBar};
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::{RngCore, SeedableRng};
use rayon::prelude::*;
use serde::Deserialize;
use typed_index_collections::TiVec;

use crate::utilities::{print_count, progress_count};
use crate::{Activity, PersonID, Population, Venue, VenueID, MSOA};

#[instrument(skip_all)]
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

    let businesses = Businesses::load(msoas)?;
    let markets = JobMarket::create(population, &businesses, &all_workers, rng);

    info!("Matching {} job markets", markets.len());
    let mp = MultiProgress::new();

    let matches: Vec<Vec<(PersonID, VenueID)>> = markets
        .into_par_iter()
        .map(|market| {
            let pb = mp.add(progress_count(market.jobs.len()));
            market.resolve(&population, &businesses, pb)
        })
        .collect();
    for (person, venue_id) in matches.into_iter().flatten() {
        // Assign the one and only workplace
        population.people[person].flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];
    }

    // Create venues
    population.venues_per_activity[Activity::Work] = businesses.venues;
    // TODO Filter out unused venues if needed

    Ok(())
}

#[derive(Debug, Deserialize)]
struct Row {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    // Represents the centroid of an LSOA
    lng: f32,
    lat: f32,
    // The number of workers
    size: usize,
    sic1d07: u64,
}

struct Businesses {
    venues_per_sic: HashMap<u64, Vec<VenueID>>,
    available_jobs: HashMap<VenueID, usize>,
    venues: TiVec<VenueID, Venue>,
}

impl Businesses {
    fn load(msoas: BTreeSet<MSOA>) -> Result<Businesses> {
        let mut result = Businesses {
            venues_per_sic: HashMap::new(),
            available_jobs: HashMap::new(),
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
                // The CSV has string IDs, but they're not used anywhere else. Immediately create a
                // venue and use integer IDs, which're much faster to copy around.
                let id = VenueID(result.venues.len());
                if rec.sic1d07 == 0 {
                    bail!("A business unexpectedly uses SIC 0: {:?}", rec);
                }
                result
                    .venues_per_sic
                    .entry(rec.sic1d07)
                    .or_insert_with(Vec::new)
                    .push(id);
                result.venues.push(Venue {
                    id,
                    activity: Activity::Work,
                    location: Point::new(rec.lng, rec.lat),
                    urn: None,
                });
                result.available_jobs.insert(id, rec.size);
                total_jobs += rec.size;
            }
        }
        info!(
            "{} jobs available among {} businesses",
            print_count(total_jobs),
            print_count(result.venues.len())
        );
        Ok(result)
    }
}

struct JobMarket {
    sic: Option<u64>,
    // workers and jobs have equal length
    workers: Vec<PersonID>,
    jobs: Vec<VenueID>,
    // Fork a new RNG per market, to avoid multi-threaded use
    rng: StdRng,
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
        for (sic, venue_list) in &businesses.venues_per_sic {
            let mut jobs: Vec<VenueID> = Vec::new();
            for id in venue_list {
                // Repeat based on how many jobs available there
                for _ in 0..businesses.available_jobs[id] {
                    jobs.push(*id);
                }
            }

            // Find workers with a matching SIC
            let mut workers: Vec<PersonID> = Vec::new();
            for id in all_workers {
                if population.people[*id].demographics.sic1d07 == *sic {
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
                // TODO from_rng consumes the original RNG; why?!
                rng: StdRng::seed_from_u64(rng.next_u64()),
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
        let mut all_jobs: Vec<VenueID> = Vec::new();
        for (id, size) in &businesses.available_jobs {
            for _ in 0..*size {
                all_jobs.push(*id);
            }
        }
        // TODO I'm not sure this one is correct -- we don't truncate to make sure workers/jobs
        // match!
        return vec![JobMarket {
            sic: None,
            workers: all_workers.clone(),
            jobs: all_jobs,
            rng: StdRng::from_rng(rng).unwrap(),
        }];
    }

    fn to_job_choices(&self) -> Vec<(VenueID, usize)> {
        let mut counts: BTreeMap<VenueID, usize> = BTreeMap::new();
        for id in &self.jobs {
            *counts.entry(*id).or_insert(0) += 1;
        }
        counts.into_iter().collect()
    }

    fn resolve(
        mut self,
        population: &Population,
        businesses: &Businesses,
        pb: ProgressBar,
    ) -> Vec<(PersonID, VenueID)> {
        assert_eq!(self.jobs.len(), self.workers.len());

        let mut choices: Vec<(VenueID, usize)> = self.to_job_choices();

        let mut output = Vec::new();
        for person in self.workers {
            pb.inc(1);
            let person_location = population.people[person].location;
            let pair = choices
                .choose_weighted_mut(&mut self.rng, |(id, available_jobs)| {
                    let dist = person_location.haversine_distance(&businesses.venues[*id].location);
                    (*available_jobs as f32) / dist.powi(2)
                })
                .unwrap();

            // This job is gone
            pair.1 -= 1;

            output.push((person, pair.0));
        }
        output
    }
}
