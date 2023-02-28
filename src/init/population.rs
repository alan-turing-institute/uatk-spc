use std::collections::{BTreeMap, BTreeSet};

use anyhow::Result;
use fs_err::File;
use geo::Point;
use serde::{Deserialize, Deserializer};

use super::quant::{get_flows, load_venues, Threshold};
use crate::utilities::{memory_usage, print_count, progress_count, progress_file_with_msg};
use crate::{pb, Activity, Household, Person, PersonID, Population, VenueID, MSOA, OA};

pub fn read_people(
    population: &mut Population,
    population_files: Vec<String>,
    oa_to_msoa: BTreeMap<OA, MSOA>,
) -> Result<()> {
    let _s = info_span!("read_people").entered();

    // First read the raw CSV files and just group the raw rows by household ID. This isn't all
    // that memory-intensive; the Population ultimately has to hold everyone anyway.
    //
    // If there are multiple time use files, we assume this grouping won't have any overlaps --
    // household IDs should be globally unique.
    let mut people_per_household: BTreeMap<String, Vec<RawPerson>> = BTreeMap::new();
    let mut household_details: BTreeMap<String, pb::HouseholdDetails> = BTreeMap::new();

    // TODO Two-level progress bar. MultiProgress seems to demand two threads and calling join() :(
    for path in population_files {
        let _s = info_span!("Reading", ?path).entered();
        let file = File::open(path)?;
        let pb = progress_file_with_msg(&file)?;
        for rec in csv::Reader::from_reader(pb.wrap_read(file)).deserialize() {
            if people_per_household.len() % 1000 == 0 {
                pb.set_message(format!(
                    "{} households so far ({})",
                    print_count(people_per_household.len()),
                    memory_usage()
                ));
            }

            let rec: RawPerson = rec?;
            let msoa = if let Some(msoa) = oa_to_msoa.get(&rec.oa) {
                msoa.clone()
            } else {
                bail!("Unknown {:?}", rec.oa);
            };

            // Only keep people in the input set of MSOAs
            if !population.msoas.contains(&msoa) {
                continue;
            }

            // Assume the household details are equivalent for every row in the input
            if !household_details.contains_key(&rec.hid) {
                household_details.insert(
                    rec.hid.clone(),
                    pb::HouseholdDetails {
                        hid: rec.hid.clone(),
                        // TODO If the numeric values don't match, just gives up. Should we check
                        // for -1 explicitly?
                        nssec8: pb::Nssec8::from_i32(rec.hh_nssec8).map(|x| x.into()),
                        accommodation_type: pb::AccommodationType::from_i32(rec.accommodation_type)
                            .map(|x| x.into()),
                        communal_type: pb::CommunalType::from_i32(rec.communal_type)
                            .map(|x| x.into()),
                        num_rooms: parse_optional_neg1(rec.num_rooms)?,
                        central_heat: match rec.central_heat {
                            0 => false,
                            1 => true,
                            x => bail!("Unexpected central_heat {x}"),
                        },
                        tenure: pb::Tenure::from_i32(rec.tenure).map(|x| x.into()),
                        num_cars: parse_optional_neg1(rec.num_cars)?,
                    },
                );
            }

            people_per_household
                .entry(rec.hid.clone())
                .or_insert_with(Vec::new)
                .push(rec);
        }
    }

    // Now create the people and households
    let _s = info_span!("Creating households").entered();
    info!("Creating households ({})", memory_usage());
    let pb = progress_count(people_per_household.len());
    for (hid, raw_people) in people_per_household {
        pb.inc(1);
        let household_id = VenueID(population.households.len());
        let mut household = Household {
            id: household_id,
            // TODO Assume everyone in the same household belongs to the same MSOA and OA. Check this?
            msoa: oa_to_msoa[&raw_people[0].oa].clone(),
            oa: raw_people[0].oa.clone(),
            members: Vec::new(),
            details: household_details.remove(&hid).unwrap(),
        };
        for raw_person in raw_people {
            let person_id = PersonID(population.people.len());
            household.members.push(person_id);
            population
                .people
                .push(raw_person.create(household_id, person_id)?);
        }
        population.households.push(household);
    }

    let mut actual_msoas = BTreeSet::new();
    for h in &population.households {
        actual_msoas.insert(h.msoa.clone());
    }
    if actual_msoas != population.msoas {
        // See https://github.com/alan-turing-institute/uatk-spc/issues/7
        error!(
            "Some input MSOAs had no people: {:?}",
            population
                .msoas
                .difference(&actual_msoas)
                .collect::<Vec<_>>()
        );
    }

    // TODO This long line gets truncated sometimes by a later progress bar?
    info!(
        "{} people across {} households, and {} MSOAs ({})",
        print_count(population.people.len()),
        print_count(population.households.len()),
        print_count(population.msoas.len()),
        memory_usage()
    );
    Ok(())
}

#[derive(Deserialize)]
struct RawPerson {
    #[serde(rename = "OA11CD")]
    oa: OA,
    hid: String,
    pid: String,

    #[serde(rename = "id_TUS_hh")]
    id_tus_hh: i64,
    #[serde(rename = "id_TUS_p")]
    id_tus_p: i64,
    #[serde(rename = "id_HS")]
    pid_hse: i64,
    lat: f32,
    lng: f32,

    sex: i32,
    age: u32,
    ethnicity: i32,
    nssec8: i32,
    sic1d2007: String,
    sic2d2007: i64,
    soc2010: i64,
    pwkstat: i32,
    #[serde(rename = "incomeH", deserialize_with = "parse_f32_or_na")]
    salary_hourly: Option<f32>,
    #[serde(rename = "incomeY", deserialize_with = "parse_f32_or_na")]
    salary_yearly: Option<f32>,

    #[serde(rename = "HEALTH_bmi", deserialize_with = "parse_f32_or_na")]
    bmi: Option<f32>,
    #[serde(rename = "HEALTH_cvd")]
    cvd: u8,
    #[serde(rename = "HEALTH_diabetes")]
    diabetes: u8,
    #[serde(rename = "HEALTH_bloodpressure")]
    bloodpressure: u8,
    #[serde(rename = "HEALTH_NMedicines")]
    number_medications: i64,
    #[serde(rename = "HEALTH_selfAssessed")]
    self_assessed_health: i32,
    #[serde(rename = "HEALTH_lifeSat")]
    life_satisfaction: i32,

    #[serde(rename = "HOUSE_nssec8")]
    hh_nssec8: i32,
    #[serde(rename = "HOUSE_type")]
    accommodation_type: i32,
    #[serde(rename = "HOUSE_typeCommunal")]
    communal_type: i32,
    #[serde(rename = "HOUSE_NRooms")]
    num_rooms: i64,
    #[serde(rename = "HOUSE_centralHeat")]
    central_heat: i64,
    #[serde(rename = "HOUSE_tenure")]
    tenure: i32,
    #[serde(rename = "HOUSE_NCars")]
    num_cars: i64,

    #[serde(rename = "ESport")]
    e_sport: f32,
    #[serde(rename = "ERugby")]
    e_rugby: f32,
    #[serde(rename = "EConcertM")]
    e_concert_m: f32,
    #[serde(rename = "EConcertF")]
    e_concert_f: f32,
    #[serde(rename = "EConcertMS")]
    e_concert_ms: f32,
    #[serde(rename = "EConcertFS")]
    e_concert_fs: f32,
    #[serde(rename = "EMuseum")]
    e_museum: f32,
}

/// Parses either a float or the string "NA".
fn parse_f32_or_na<'de, D: Deserializer<'de>>(d: D) -> Result<Option<f32>, D::Error> {
    // We have to parse it as a string first, or we lose the chance to check that it's "NA" later
    let raw = <String>::deserialize(d)?;
    if raw == "NA" {
        return Ok(None);
    }
    if let Ok(x) = raw.parse::<f32>() {
        return Ok(Some(x));
    }
    Err(serde::de::Error::custom(format!(
        "Not a f32 or \"NA\": {}",
        raw
    )))
}

fn parse_optional_neg1(x: i64) -> Result<Option<u64>> {
    if x == -1 {
        Ok(None)
    } else if x >= 0 {
        Ok(Some(x as u64))
    } else {
        bail!("Unexpected negative input {x}");
    }
}

impl RawPerson {
    fn create(self, household: VenueID, id: PersonID) -> Result<Person> {
        Ok(Person {
            id,
            household,
            workplace: None,
            location: Point::new(self.lng, self.lat),

            identifiers: pb::Identifiers {
                orig_pid: self.pid,
                id_tus_hh: self.id_tus_hh,
                id_tus_p: self.id_tus_p,
                pid_hs: self.pid_hse,
            },
            demographics: pb::Demographics {
                sex: pb::Sex::from_i32(self.sex).expect("Unknown sex").into(),
                age_years: self.age,
                ethnicity: pb::Ethnicity::from_i32(self.ethnicity)
                    .expect("Unknown ethnicity")
                    .into(),
                nssec8: pb::Nssec8::from_i32(self.nssec8).map(|x| x.into()),
            },
            employment: pb::Employment {
                sic1d2007: if self.sic1d2007 == "-1" {
                    None
                } else if self.sic1d2007.len() != 1 {
                    bail!("Unknown sic1d2007 value {}", self.sic1d2007);
                } else {
                    Some(self.sic1d2007)
                },
                sic2d2007: parse_optional_neg1(self.sic2d2007)?,
                soc2010: parse_optional_neg1(self.soc2010)?,
                pwkstat: pb::PwkStat::from_i32(self.pwkstat)
                    .expect("Unknown pwkstat")
                    .into(),
                salary_hourly: self.salary_hourly,
                salary_yearly: self.salary_yearly,
            },
            health: pb::Health {
                bmi: self.bmi,
                has_cardiovascular_disease: self.cvd > 0,
                has_diabetes: self.diabetes > 0,
                has_high_blood_pressure: self.bloodpressure > 0,
                number_medications: parse_optional_neg1(self.number_medications)?,
                self_assessed_health: pb::SelfAssessedHealth::from_i32(self.self_assessed_health)
                    .map(|x| x.into()),
                life_satisfaction: pb::LifeSatisfaction::from_i32(self.life_satisfaction)
                    .map(|x| x.into()),
            },
            events: pb::Events {
                sport: self.e_sport,
                rugby: self.e_rugby,
                concert_m: self.e_concert_m,
                concert_f: self.e_concert_f,
                concert_ms: self.e_concert_ms,
                concert_fs: self.e_concert_fs,
                museum: self.e_museum,
            },
            weekday_diaries: Vec::new(),
            weekend_diaries: Vec::new(),
        })
    }
}

#[instrument(skip(threshold, population))]
pub fn setup_venue_flows(
    activity: Activity,
    threshold: Threshold,
    population: &mut Population,
) -> Result<()> {
    info!("Reading {:?} flow data...", activity);

    population.venues_per_activity[activity] = load_venues(activity)?;
    info!(
        "{:?} has {} venues",
        activity,
        print_count(population.venues_per_activity[activity].len())
    );

    // Per MSOA, a list of venues and the probability of going from the MSOA to that venue
    for (msoa, flows) in get_flows(activity, &population.msoas, threshold)? {
        population
            .info_per_msoa
            .get_mut(&msoa)
            .unwrap()
            .flows_per_activity[activity] = flows;
    }

    Ok(())
}
