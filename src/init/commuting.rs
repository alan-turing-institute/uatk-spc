use std::collections::{BTreeSet, HashMap};

use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use serde::Deserialize;
use typed_index_collections::TiVec;

use crate::utilities::{print_count, progress_count};
use crate::{Activity, Population, Venue, VenueID, MSOA};

pub fn create_commuting_flows(population: &mut Population, rng: &mut StdRng) -> Result<()> {
    // min proportion of the population that must be preserved when using the sic1d07 classification
    // TODO Plumb from YAML
    let sic_threshold = 0.0;

    let mut businesses = load_businesses(population)?;

    info!("Assigning workplaces");
    let pb = progress_count(population.people.len());
    for person in &mut population.people {
        pb.inc(1);
        if person.duration_per_activity[Activity::Work] == 0.0 {
            continue;
        }
        // TODO Handle people without an assigned SIC
        if let Some(sic) = person.sic1d07 {
            // Each person could work at any business matching their SIC. Weight the choice by the
            // number of available jobs there and the inverse square distance between the person
            // and business.
            let mut choices: Vec<(BusinessID, f32)> = Vec::new();
            if let Some(list) = businesses.list_per_sic.get(&sic) {
                for id in list {
                    let jobs_available = businesses.available_jobs[id];
                    if jobs_available > 0 {
                        let dist = person
                            .location
                            .haversine_distance(&businesses.locations[id]);
                        choices.push((*id, (jobs_available as f32) / dist.powi(2)));
                    }
                }
            }
            if let Ok((business_id, _)) = choices.choose_weighted(rng, |pair| pair.1) {
                let venue_id = businesses.get_venue(*business_id);

                // Assign the one and only workplace
                person.flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];

                // This job is gone
                // (Note the or_insert_with will never happen -- the entry is alwayst there)
                *businesses.available_jobs.entry(*business_id).or_insert(0) -= 1;
            } else {
                // There were no remaining jobs for this SIC.
                // TODO What should we do?
            }
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

#[derive(Clone, Copy, PartialEq, Eq, Hash, Deserialize)]
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

fn load_businesses(population: &Population) -> Result<Businesses> {
    let mut result = Businesses {
        list_per_sic: HashMap::new(),
        locations: HashMap::new(),
        available_jobs: HashMap::new(),

        business_to_venue: HashMap::new(),
        venues: TiVec::new(),
    };

    // Only keep businesses in MSOAs where a worker lives.
    //
    // The rationale: if we're restricting the study area, we don't want to send people to work far
    // away, where the only activity occuring is work.
    let mut msoas = BTreeSet::new();
    for person in &population.people {
        if person.duration_per_activity[Activity::Work] > 0.0 {
            msoas.insert(population.households[person.household].msoa.clone());
        }
    }

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
