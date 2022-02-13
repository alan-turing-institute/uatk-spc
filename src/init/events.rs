use anyhow::Result;
use fs_err::File;
use geo::Point;
use serde::{Deserialize, Deserializer};

use crate::{ContactCycle, Event};

pub fn load(path: &str) -> Result<Vec<Event>> {
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
    Ok(events)
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
    long: f32,
    lat: f32,
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
