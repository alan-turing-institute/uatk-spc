use std::io::{BufWriter, Write};

use anyhow::Result;
use fs_err::File;
use geo::coords_iter::CoordsIter;
use geo::{Coord, Point};
use prost::Message;

use crate::{pb, Activity, InfoPerMSOA, Population};

impl TryFrom<&Population> for pb::Population {
    type Error = anyhow::Error;

    fn try_from(input: &Population) -> std::result::Result<Self, Self::Error> {
        let mut output = pb::Population {
            year: input.year,
            lockdown: input.lockdown.clone(),
            ..Default::default()
        };
        for household in &input.households {
            output.households.push(pb::Household {
                id: household.id.0.try_into()?,
                msoa11cd: household.msoa.0.clone(),
                oa11cd: household.oa.0.clone(),
                members: household
                    .members
                    .iter()
                    .map(|id| id.0.try_into().unwrap())
                    .collect(),
                details: household.details.clone(),
            });
        }

        for person in &input.people {
            output.people.push(pb::Person {
                id: person.id.0.try_into()?,
                household: person.household.0.try_into()?,
                workplace: person.workplace.map(|x| x.0 as u64),
                identifiers: person.identifiers.clone(),
                demographics: person.demographics.clone(),
                employment: person.employment.clone(),
                health: person.health.clone(),
                events: person.events.clone(),
                // We earlier verify these IDs fit
                weekday_diaries: person.weekday_diaries.iter().map(|x| x.0 as u32).collect(),
                weekend_diaries: person.weekend_diaries.iter().map(|x| x.0 as u32).collect(),
            });
        }

        for (activity, venues) in &input.venues_per_activity {
            let list = pb::VenueList {
                venues: venues
                    .iter()
                    .map(|venue| pb::Venue {
                        id: venue.id.0.try_into().unwrap(),
                        activity: convert_activity(activity).into(),
                        location: convert_point(&venue.location),
                        urn: venue.urn.clone(),
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
                    population: info.population,
                    buildings: info.buildings.iter().map(convert_point).collect(),
                    flows_per_activity: convert_flows(info),
                },
            );
        }

        for diary in &input.time_use_diaries {
            output.time_use_diaries.push(diary.clone());
        }
        Ok(output)
    }
}

/// Returns the size in bytes of protobuf population
pub fn encoded_len(population: &pb::Population) -> usize {
    population.encoded_len()
}

/// Writes a given protobuf population to output path, returning the bytes written
pub fn write_pb(output: &pb::Population, output_path: String) -> Result<usize> {
    let mut buf = Vec::with_capacity(output.encoded_len());
    output.encode(&mut buf)?;
    let mut f = BufWriter::new(File::create(output_path)?);
    f.write_all(&buf)?;
    Ok(buf.len())
}

/// Returns the bytes written
pub fn convert_to_pb(input: &Population, output_path: String) -> Result<usize> {
    write_pb(&pb::Population::try_from(input)?, output_path)
}

pub(crate) fn convert_point(pt: &Point<f32>) -> pb::Point {
    pb::Point {
        longitude: pt.x(),
        latitude: pt.y(),
    }
}

fn convert_coordinate(pt: Coord<f32>) -> pb::Point {
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
