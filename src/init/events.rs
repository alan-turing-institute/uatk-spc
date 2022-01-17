use anyhow::Result;
use fs_err::File;
use geo::prelude::HaversineDistance;
use geo::Point;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use serde::{Deserialize, Deserializer, Serialize};

use crate::{PersonID, Population};

// TODO This maybe doesn't belong buried in init -- it's used while the model runs

/// Represents one-time events, like concerts and sports matches, that many people attend.
#[derive(Serialize, Deserialize)]
pub struct Events {
    events: Vec<Event>,
}

/// An event attended by many people. Each event is broken into a sequence of contact cycles,
/// involving the same people.
#[derive(Serialize, Deserialize)]
struct Event {
    event_id: String,
    /// YYYY-MM-DD
    date: String,
    number_attendees: usize,
    location: Point<f64>,
    event_type: String,
    /// If false, draw per individual. If true, draw per individual
    family: bool,
    contact_cycles: Vec<ContactCycle>,
}

/// A single event is broken into different contact cycles, such as queuing, the main concert, an
/// intermission, after-party, etc. Each one might have different risk parameters, but they involve
/// the same people.
#[derive(Serialize, Deserialize)]
struct ContactCycle {
    /// estimated number of individual contacts per person per contact cycle
    contacts: usize,
    /// transmission risk associated to a typical contact at the event (one-to-one, normalised to one minute)
    risk: f64,
    /// total length of the event in minutes
    duration: usize,
    /// typical length of a contact cycle in minutes
    typical_time: usize,
}

#[derive(Deserialize)]
struct Row {
    #[serde(rename = "EId")]
    event_id: String,
    /// YYYY-MM-DD
    date: String,
    /// estimated number of individual contacts per person per contact cycle
    contacts: usize,
    /// transmission risk associated to a typical contact at the event (one-to-one, normalised to one minute)
    risk: f64,
    /// maximum attendance size of the venue
    size: usize,
    /// a percentage in [0, 1] of the size, giving the number of actual visitors at the event
    attendance: f64,
    // Location
    long: f64,
    lat: f64,
    #[serde(rename = "type")]
    event_type: String,
    /// total length of the event in minutes
    duration: usize,
    /// typical length of a contact cycle in minutes
    #[serde(rename = "typTime")]
    typical_time: usize,
    /// If false, draw per individual. If true, draw per individual
    #[serde(deserialize_with = "parse_bool")]
    family: bool,
    /// key to indicate several events attended by the exact same list of visitors
    #[serde(rename = "sim", deserialize_with = "parse_bool")]
    _simultaneous_with_previous_event: bool,
}

/// 0 = false, 1 = true
fn parse_bool<'de, D: Deserializer<'de>>(d: D) -> Result<bool, D::Error> {
    let string = <String>::deserialize(d)?;
    if string == "0" {
        Ok(false)
    } else if string == "1" {
        Ok(true)
    } else {
        Err(serde::de::Error::custom(format!(
            "boolean isn't 0 or 1: {}",
            string
        )))
    }
}

impl Events {
    pub fn empty() -> Events {
        Events { events: Vec::new() }
    }

    pub fn load(path: &str) -> Result<Events> {
        info!("Loading events data");
        let mut events = Vec::new();
        for rec in csv::Reader::from_reader(File::open(path)?).deserialize() {
            let rec: Row = rec?;
            events.push(Event {
                event_id: rec.event_id,
                date: rec.date,
                // TODO Why this indirection?
                number_attendees: (rec.attendance * rec.size as f64) as usize,
                location: Point::new(rec.long, rec.lat),
                event_type: rec.event_type,
                family: rec.family,
                // TODO Glue together based on 'sim'... or just fill out a more clear data model in
                // the first place
                contact_cycles: vec![ContactCycle {
                    contacts: rec.contacts,
                    risk: rec.risk,
                    duration: rec.duration,
                    typical_time: rec.typical_time,
                }],
            });
        }
        Ok(Events { events })
    }

    /// At the end of every timestep, the simulation will call this
    pub fn get_newly_infected(
        &self,
        date: String,
        pop: &Population,
        rng: &mut StdRng,
    ) -> Vec<PersonID> {
        for event in &self.events {
            // TODO We could also just index these by date, but if the list is small, meh
            if event.date != date {
                continue;
            }

            let _attendees: Vec<PersonID> = if event.family {
                // TODO Haven't deciphered the index magic yet
                todo!()
            } else {
                // Find all the people interested in this event type, and how far they are to the
                // event
                let candidates: Vec<(PersonID, f64)> = pop
                    .people
                    .iter()
                    .filter_map(|person| {
                        // TODO need to scrape their event interest
                        let dist = person.location.haversine_distance(&event.location);
                        Some((person.id, 1.0 / dist.powi(2)))
                    })
                    .collect();
                candidates
                    .choose_multiple_weighted(rng, event.number_attendees, |pair| pair.1)
                    .unwrap()
                    .map(|pair| pair.0)
                    .collect()
            };

            // TODO We need people statuses; indeed this code doesn't belong in init/
        }
        Vec::new()
    }
}
