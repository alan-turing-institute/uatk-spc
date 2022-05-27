use std::io::{BufWriter, Write};

use anyhow::Result;
use fs_err::File;
use geo::coords_iter::CoordsIter;
use geo::{Coordinate, Point};
use prost::Message;

use crate::{pb, Activity, InfoPerMSOA, Population, BMI};

/// Returns the bytes written
pub fn convert_to_pb(input: &Population, output_path: String) -> Result<usize> {
    let mut output = pb::Population::default();

    for household in &input.households {
        output.households.push(pb::Household {
            id: household.id.0.try_into()?,
            msoa11cd: household.msoa.0.clone(),
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
            workplace: match person.workplace {
                Some(id) => id.0.try_into()?,
                None => u64::MAX,
            },
            identifiers: Some(person.identifiers.clone()),
            demographics: Some(person.demographics.clone()),
            employment: Some(person.employment.clone()),
            health: Some(pb::Health {
                bmi: match person.bmi {
                    BMI::NotApplicable => pb::Bmi::NotApplicable,
                    BMI::Underweight => pb::Bmi::Underweight,
                    BMI::Normal => pb::Bmi::Normal,
                    BMI::Overweight => pb::Bmi::Overweight,
                    BMI::Obese1 => pb::Bmi::Obese1,
                    BMI::Obese2 => pb::Bmi::Obese2,
                    BMI::Obese3 => pb::Bmi::Obese3,
                }
                .into(),
                has_cardiovascular_disease: person.has_cardiovascular_disease,
                has_diabetes: person.has_diabetes,
                has_high_blood_pressure: person.has_high_blood_pressure,
            }),
            time_use: Some(person.time_use.clone()),
            activity_durations: person
                .duration_per_activity
                .iter()
                .map(|(activity, duration)| pb::ActivityDuration {
                    activity: convert_activity(activity).into(),
                    duration: *duration,
                })
                .collect(),
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
                flows_per_activity: convert_flows(info),
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

fn convert_flows(msoa: &InfoPerMSOA) -> Vec<pb::Flows> {
    let mut output = Vec::new();
    for (activity, flows) in &msoa.flows_per_activity {
        output.push(pb::Flows {
            activity: convert_activity(activity).into(),
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
    }
}
