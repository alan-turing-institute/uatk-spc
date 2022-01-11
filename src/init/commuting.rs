use std::collections::HashMap;

use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use rand::seq::SliceRandom;
use serde::Deserialize;

use crate::utilities::print_count;
use crate::{Activity, Population, VenueID, MSOA};

pub fn create_commuting_flows(population: &mut Population) -> Result<()> {
    // TODO Plumb through and set from a seed
    let mut rng = rand::thread_rng();

    // Only keep businesses in MSOAs where somebody lives
    // TODO Only people who work -- does it matter?
    // TODO I guess if we're restricting the study area, we don't want to send people far away,
    // because we're not modeling people who live far away
    let msoas = population.unique_msoas();

    // Find all of the businesses, grouped by the Standard Industry Classification
    info!("Finding all businesses");
    let mut businesses_per_sic: HashMap<usize, Vec<Business>> = HashMap::new();
    for rec in csv::Reader::from_reader(File::open("raw_data/nationaldata/businessRegistry.csv")?)
        .deserialize()
    {
        let rec: Row = rec?;
        if msoas.contains(&rec.msoa) {
            businesses_per_sic
                .entry(rec.sic1d07)
                .or_insert_with(Vec::new)
                .push(Business {
                    id: rec.id,
                    location: Point::new(rec.lng, rec.lat),
                    num_workers: rec.size,
                });
        }
    }

    // Just to understand the data
    for (sic, businesses) in &businesses_per_sic {
        info!(
            "SIC {} has {} businesses",
            sic,
            print_count(businesses.len())
        );
    }

    // Assign numeric VenueIDs as we decide to use a business. Note we assume the 'id' field in the
    // CSV is already unique!
    let mut id_to_venue: HashMap<String, VenueID> = HashMap::new();

    info!("Assigning workplaces");
    for person in &mut population.people {
        if person.duration_per_activity[Activity::Work] == 0.0 {
            continue;
        }
        // TODO Handle people without an assigned SIC
        if let Some(sic) = person.sic1d07 {
            // Each person could work at any business matching their SIC. Weight the choice by the
            // size of the business and the distance between the person and business.
            let mut choices: Vec<(&str, f64)> = Vec::new();
            if let Some(list) = businesses_per_sic.get(&sic) {
                for business in list {
                    let dist = person.location.haversine_distance(&business.location);
                    choices.push((&business.id, dist * (business.num_workers as f64)));
                }
            } else {
                // TODO Very spammy, but I'm still looking into why these're missing -- I guess
                // that job doesn't exist in the few MSOAs where people live
                //warn!("No businesses for SIC {}", sic);
                continue;
            }
            let (business_id, _) = choices.choose_weighted(&mut rng, |pair| pair.1).unwrap();

            // Do the ID lookup, creating new ones as needed
            // TODO This is a common pattern
            let venue_id = match id_to_venue.get(&business_id.to_string()) {
                Some(id) => *id,
                None => {
                    let id = VenueID(id_to_venue.len());
                    id_to_venue.insert(business_id.to_string(), id);
                    id
                }
            };

            // Assign the one and only workplace
            person.flows_per_activity[Activity::Work] = vec![(venue_id, 1.0)];
        }
    }

    Ok(())
}

#[allow(unused)]
#[derive(Deserialize)]
struct Row {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    id: String,
    // Represents the centroid of an LSOA
    lng: f64,
    lat: f64,
    size: usize,
    sic1d07: usize,
}

struct Business {
    id: String,
    location: Point<f64>,
    num_workers: usize,
}
