use std::io::{BufWriter, Write};

use anyhow::Result;
use fs_err::File;
use geo::coords_iter::CoordsIter;
use geo::{Coordinate, Point};
use prost::Message;

use crate::{pb, Activity, Obesity, Person, Population};

/// Returns the bytes written
pub fn convert_to_pb(input: &Population, output_path: String) -> Result<usize> {
    let mut output = pb::Population::default();

    for household in &input.households {
        output.households.push(pb::Household {
            id: household.id.0.try_into()?,
            msoa: household.msoa.0.clone(),
            orig_hid: household.orig_hid.try_into()?,
            members: household
                .members
                .iter()
                .map(|id| id.0.try_into().unwrap())
                .collect(),
        });
    }

    for person in &input.people {
        output.people.push(pb::Person {
            id: person.id.0.try_into()?,
            household: person.household.0.try_into()?,
            location: Some(convert_point(&person.location)),
            orig_pid: person.orig_pid.try_into()?,
            // TODO Make sure 0 isn't a valid case
            sic1d07: person.sic1d07.unwrap_or(0).try_into()?,
            age_years: person.age_years.into(),
            health: Some(pb::Health {
                obesity: match person.obesity {
                    Obesity::Obese3 => pb::Obesity::Obese3,
                    Obesity::Obese2 => pb::Obesity::Obese2,
                    Obesity::Obese1 => pb::Obesity::Obese1,
                    Obesity::Overweight => pb::Obesity::Overweight,
                    Obesity::Normal => pb::Obesity::Normal,
                }
                .into(),
                has_cardiovascular_disease: person.has_cardiovascular_disease,
                has_diabetes: person.has_diabetes,
                has_high_blood_pressure: person.has_high_blood_pressure,
            }),
            time_use: Some(pb::TimeUse {
                not_home: person.pr_not_home,
            }),
            flows_per_activity: convert_flows(person),
        });
    }

    for (activity, venues) in &input.venues_per_activity {
        let list = pb::VenueList {
            venues: venues
                .iter()
                .map(|venue| pb::Venue {
                    id: venue.id.0.try_into().unwrap(),
                    activity: convert_activity(activity).into(),
                    location: Some(convert_point(&venue.location)),
                    // TODO Check 0 isn't valid
                    urn: venue.urn.unwrap_or(0).try_into().unwrap(),
                })
                .collect(),
        };
        output.venues_per_activity.insert(activity as i32, list);
    }

    for (msoa, info) in &input.info_per_msoa {
        output.info_per_msoa.insert(
            msoa.0.clone(),
            pb::InfoPerMsoa {
                shape: info.shape.coords_iter().map(convert_coordinate).collect(),
                population: info.population.try_into()?,
                buildings: info.buildings.iter().map(convert_point).collect(),
            },
        );
    }

    let mut buf = Vec::new();
    buf.reserve(output.encoded_len());
    output.encode(&mut buf)?;
    let mut f = BufWriter::new(File::create(output_path)?);
    f.write_all(&buf)?;
    Ok(buf.len())
}

fn convert_point(pt: &Point<f32>) -> pb::Point {
    pb::Point {
        longitude: pt.x(),
        latitude: pt.y(),
    }
}

fn convert_coordinate(pt: Coordinate<f32>) -> pb::Point {
    pb::Point {
        longitude: pt.x,
        latitude: pt.y,
    }
}

fn convert_flows(person: &Person) -> Vec<pb::Flows> {
    let mut output = Vec::new();
    for (activity, flows) in &person.flows_per_activity {
        output.push(pb::Flows {
            activity: convert_activity(activity).into(),
            activity_duration: person.duration_per_activity[activity],
            flows: flows
                .iter()
                .map(|(venue, weight)| pb::Flow {
                    venue_id: venue.0.try_into().unwrap(),
                    weight: *weight,
                })
                .collect(),
        });
    }
    output
}

fn convert_activity(activity: Activity) -> pb::Activity {
    match activity {
        Activity::Retail => pb::Activity::Retail,
        Activity::PrimarySchool => pb::Activity::PrimarySchool,
        Activity::SecondarySchool => pb::Activity::SecondarySchool,
        Activity::Home => pb::Activity::Home,
        Activity::Work => pb::Activity::Work,
        Activity::Nightclub => pb::Activity::Nightclub,
    }
}
