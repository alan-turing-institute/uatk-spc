use std::collections::HashMap;

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
    let mut businesses = load_businesses(population)?;

    // Assign numeric VenueIDs as we decide to use a business.
    let mut business_to_venue: HashMap<BusinessID, VenueID> = HashMap::new();
    let mut venues = TiVec::new();

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
                // Do the ID lookup, creating new ones as needed
                // TODO This is a common pattern
                let venue_id = match business_to_venue.get(business_id) {
                    Some(id) => *id,
                    None => {
                        let venue_id = VenueID(business_to_venue.len());
                        business_to_venue.insert(business_id.clone(), venue_id);
                        let location = &businesses.locations[&business_id];
                        venues.push(Venue {
                            id: venue_id,
                            activity: Activity::Work,
                            location: *location,
                            urn: None,
                        });
                        venue_id
                    }
                };

                // Assign the one and only workplace
                person.flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];

                // This job is gone
                businesses
                    .available_jobs
                    .insert(*business_id, businesses.available_jobs[business_id] - 1);
            } else {
                // There were no remaining jobs for this SIC.
                // TODO What should we do?
            }
        }
    }

    // Create venues
    population.venues_per_activity[Activity::Work] = venues;

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
}

fn load_businesses(population: &Population) -> Result<Businesses> {
    let mut result = Businesses {
        list_per_sic: HashMap::new(),
        locations: HashMap::new(),
        available_jobs: HashMap::new(),
    };

    // Only keep businesses in MSOAs where somebody lives.
    //
    // The rationale: if we're restricting the study area, we don't want to send people to work far
    // away, where the only activity occuring is work.
    //
    // TODO Only people who work -- does that matter?
    let msoas = population.unique_msoas();

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
