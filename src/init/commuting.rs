use std::collections::HashMap;

use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use serde::Deserialize;

use crate::{Activity, Population, Venue, VenueID, MSOA};

pub fn create_commuting_flows(population: &mut Population, rng: &mut StdRng) -> Result<()> {
    // Only keep businesses in MSOAs where somebody lives.
    //
    // The rationale: if we're restricting the study area, we don't want to send people to work far
    // away, where the only activity occuring is work.
    //
    // TODO Only people who work -- does that matter?
    let msoas = population.unique_msoas();

    // Find all of the businesses, grouped by the Standard Industry Classification.
    info!("Finding all businesses");
    let mut businesses_per_sic: HashMap<usize, Vec<BusinessID>> = HashMap::new();
    let mut business_locations: HashMap<BusinessID, Point<f64>> = HashMap::new();
    let mut available_jobs_per_business: HashMap<BusinessID, usize> = HashMap::new();
    for rec in csv::Reader::from_reader(File::open("raw_data/nationaldata/businessRegistry.csv")?)
        .deserialize()
    {
        let rec: Row = rec?;
        if msoas.contains(&rec.msoa) {
            businesses_per_sic
                .entry(rec.sic1d07)
                .or_insert_with(Vec::new)
                .push(rec.id.clone());
            business_locations.insert(rec.id.clone(), Point::new(rec.lng, rec.lat));
            available_jobs_per_business.insert(rec.id, rec.size);
        }
    }

    // Assign numeric VenueIDs as we decide to use a business.
    let mut business_to_venue: HashMap<BusinessID, VenueID> = HashMap::new();
    let mut venues = Vec::new();

    info!("Assigning workplaces");
    for person in &mut population.people {
        if person.duration_per_activity[Activity::Work] == 0.0 {
            continue;
        }
        // TODO Handle people without an assigned SIC
        if let Some(sic) = person.sic1d07 {
            // Each person could work at any business matching their SIC. Weight the choice by the
            // number of available jobs there and the inverse square distance between the person
            // and business.
            let mut choices: Vec<(&BusinessID, f64)> = Vec::new();
            if let Some(list) = businesses_per_sic.get(&sic) {
                for id in list {
                    let jobs_available = available_jobs_per_business[id];
                    let dist = person.location.haversine_distance(&business_locations[id]);
                    if jobs_available > 0 {
                        choices.push((id, (jobs_available as f64) / dist.powi(2)));
                    }
                }
            }
            if let Ok((business_id, _)) = choices.choose_weighted(rng, |pair| pair.1) {
                let business_id = *business_id;
                // Do the ID lookup, creating new ones as needed
                // TODO This is a common pattern
                let venue_id = match business_to_venue.get(business_id) {
                    Some(id) => *id,
                    None => {
                        let venue_id = VenueID(business_to_venue.len());
                        business_to_venue.insert(business_id.clone(), venue_id);
                        let location = &business_locations[&business_id];
                        venues.push(Venue {
                            id: venue_id,
                            activity: Activity::Work,
                            latitude: location.lat() as f32,
                            longitude: location.lng() as f32,
                            urn: None,
                        });
                        venue_id
                    }
                };

                // Assign the one and only workplace
                person.flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];

                // This job is gone
                available_jobs_per_business.insert(
                    business_id.clone(),
                    available_jobs_per_business[business_id] - 1,
                );
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
    id: BusinessID,
    // Represents the centroid of an LSOA
    lng: f64,
    lat: f64,
    // The number of workers
    size: usize,
    sic1d07: usize,
}

#[derive(Clone, PartialEq, Eq, Hash, Deserialize)]
struct BusinessID(String);
