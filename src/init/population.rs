use std::collections::{BTreeMap, BTreeSet};

use anyhow::Result;
use enum_map::EnumMap;
use fs_err::File;
use geo::Point;
use serde::{Deserialize, Deserializer};

use super::quant::{get_flows, load_venues, Threshold};
use crate::utilities::{memory_usage, print_count, progress_count, progress_file_with_msg};
use crate::{pb, Activity, Household, Person, PersonID, Population, VenueID, MSOA};

pub fn read_individual_time_use_and_health_data(
    population: &mut Population,
    population_files: Vec<String>,
) -> Result<()> {
    let _s = info_span!("read_individual_time_use_and_health_data").entered();

    // First read the raw CSV files and just group the raw rows by household (MSOA and hid)
    // This isn't all that memory-intensive; the Population ultimately has to hold everyone anyway.
    //
    // If there are multiple time use files, we assume this grouping won't have any overlaps --
    // MSOAs shouldn't be the same between different files.
    let mut people_per_household: BTreeMap<(MSOA, String), Vec<TuPerson>> = BTreeMap::new();
    let mut household_details: BTreeMap<(MSOA, String), pb::HouseholdDetails> = BTreeMap::new();
    let mut no_household = 0;

    // TODO Two-level progress bar. MultiProgress seems to demand two threads and calling join() :(
    //for path in population_files {
    for path in vec!["/home/dabreegster/Downloads/new_spc_data/E09000002.csv"] {
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

            let rec: TuPerson = rec?;

            // Skip people that weren't matched to a household
            /*if rec.hid == -1 {
                no_household += 1;
                continue;
            }*/

            // Only keep people in the input set of MSOAs
            if !population.msoas.contains(&rec.msoa) {
                continue;
            }

            // TODO Probably individual enum matching
            fn parse_optional_neg1(x: i64) -> Result<Option<u64>> {
                if x == -1 {
                    Ok(None)
                } else if x >= 0 {
                    Ok(Some(x as u64))
                } else {
                    bail!("Unexpected negative input {x}");
                }
            }

            // Assume the household details are equivalent for every row in the input
            if !household_details.contains_key(&(rec.msoa.clone(), rec.hid.clone())) {
                household_details.insert(
                    (rec.msoa.clone(), rec.hid.clone()),
                    pb::HouseholdDetails {
                        orig_hid: rec.hid.clone(),
                        nssec8: parse_optional_neg1(rec.hh_nssec8)?,
                        accomodation_type: parse_optional_neg1(rec.accomodation_type)?,
                        communal_type: parse_optional_neg1(rec.communal_type)?,
                        num_rooms: parse_optional_neg1(rec.num_rooms)?,
                        central_heat: match rec.central_heat {
                            0 => false,
                            1 => true,
                            x => bail!("Unexpected central_heat {x}"),
                        },
                        tenure: parse_optional_neg1(rec.tenure)?,
                        num_cars: parse_optional_neg1(rec.num_cars)?,
                    },
                );
            }

            people_per_household
                .entry((rec.msoa.clone(), rec.hid.clone()))
                .or_insert_with(Vec::new)
                .push(rec);
        }
    }

    if no_household > 0 {
        warn!(
            "{} people skipped, no household originally",
            print_count(no_household)
        );
    }

    // Now create the people and households
    let _s = info_span!("Creating households").entered();
    info!("Creating households ({})", memory_usage());
    let pb = progress_count(people_per_household.len());
    for ((msoa, orig_hid), raw_people) in people_per_household {
        pb.inc(1);
        let household_id = VenueID(population.households.len());
        let mut household = Household {
            id: household_id,
            msoa: msoa.clone(),
            members: Vec::new(),
            details: household_details.remove(&(msoa, orig_hid)).unwrap(),
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
struct TuPerson {
    #[serde(rename = "MSOA11CD")]
    msoa: MSOA,
    hid: String,
    pid: String,
    #[serde(rename = "id_TUS_p")]
    pid_tus: i64,
    #[serde(rename = "id_HS")]
    pid_hse: i64,
    lat: f32,
    lng: f32,

    sex: usize,
    age: u32,
    ethnicity: usize,
    nssec8: i64,
    #[serde(deserialize_with = "parse_u64_or_na")]
    sic1d07: Option<u64>,
    #[serde(deserialize_with = "parse_u64_or_na")]
    sic2d07: Option<u64>,
    #[serde(deserialize_with = "parse_u64_or_na")]
    soc2010: Option<u64>,
    pwkstat: String,
    #[serde(rename = "incomeH", deserialize_with = "parse_f32_or_na")]
    salary_hourly: Option<f32>,
    #[serde(rename = "incomeY", deserialize_with = "parse_f32_or_na")]
    salary_yearly: Option<f32>,

    #[serde(rename = "BMIvg6")]
    bmi: String,
    #[serde(rename = "bmiNew", deserialize_with = "parse_f32_or_na")]
    bmi_new: Option<f32>,
    cvd: u8,
    diabetes: u8,
    bloodpressure: u8,

    punknown: f64,
    pwork: f64,
    pschool: f64,
    pshop: f64,
    pservices: f64,
    pleisure: f64,
    pescort: f64,
    ptransport: f64,
    pnothome: f64,
    phome: f64,
    pworkhome: f64,
    phometot: f64,

    #[serde(rename = "HOUSE_nssec8")]
    hh_nssec8: i64,
    #[serde(rename = "HOUSE_type")]
    accomodation_type: i64,
    #[serde(rename = "HOUSE_typeCommunal")]
    communal_type: i64,
    #[serde(rename = "HOUSE_NRooms")]
    num_rooms: i64,
    #[serde(rename = "HOUSE_centralHeat")]
    central_heat: i64,
    #[serde(rename = "HOUSE_tenure")]
    tenure: i64,
    #[serde(rename = "HOUSE_NCars")]
    num_cars: i64,
}

/// Parses either an unsigned integer or the string "NA".
fn parse_u64_or_na<'de, D: Deserializer<'de>>(d: D) -> Result<Option<u64>, D::Error> {
    // We have to parse it as a string first, or we lose the chance to check that it's "NA" later
    let raw = <String>::deserialize(d)?;
    if raw == "NA" {
        return Ok(None);
    }
    if let Ok(x) = raw.parse::<u64>() {
        return Ok(Some(x));
    }
    Err(serde::de::Error::custom(format!(
        "Not a u64 or \"NA\": {}",
        raw
    )))
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

impl TuPerson {
    fn create(self, household: VenueID, id: PersonID) -> Result<Person> {
        let mut duration_per_activity: EnumMap<Activity, f64> = EnumMap::default();
        duration_per_activity[Activity::Retail] = self.pshop;
        duration_per_activity[Activity::Home] = self.phome;
        duration_per_activity[Activity::Work] = self.pwork;

        // Use pschool and age to calculate primary/secondary school
        if self.age < 11 {
            duration_per_activity[Activity::PrimarySchool] = self.pschool;
            duration_per_activity[Activity::SecondarySchool] = 0.0;
        } else if self.age < 19 {
            duration_per_activity[Activity::PrimarySchool] = 0.0;
            duration_per_activity[Activity::SecondarySchool] = self.pschool;
        } else {
            // TODO Seems like we need a University activity
            duration_per_activity[Activity::PrimarySchool] = 0.0;
            duration_per_activity[Activity::SecondarySchool] = 0.0;
        }
        pad_durations(&mut duration_per_activity)?;

        Ok(Person {
            id,
            household,
            workplace: None,
            location: Point::new(self.lng, self.lat),

            identifiers: pb::Identifiers {
                orig_pid: self.pid,
                pid_tus: self.pid_tus,
                pid_hse: self.pid_hse,
            },
            demographics: pb::Demographics {
                sex: match self.sex {
                    x if x == 0 => pb::Sex::Female,
                    x if x == 1 => pb::Sex::Male,
                    x => bail!("Unknown sex {}", x),
                }
                .into(),
                age_years: self.age,
                ethnicity: match self.ethnicity{
                    x if x == 1 => pb::Ethnicity::White,
                    x if x == 2 => pb::Ethnicity::Black,
                    x if x == 3 => pb::Ethnicity::Asian,
                    x if x == 4 => pb::Ethnicity::Mixed,
                    x if x == 5 => pb::Ethnicity::Other,
                    x => bail!("Unknown ethnicity {}", x),
                }
                .into(),
                socioeconomic_classification: self.nssec8,
                /*socioeconomic_classification: match self.nssec5 {
                    x if x == 0 => pb::Nssec5::Unemployed,
                    x if x == 1 => pb::Nssec5::Higher,
                    x if x == 2 => pb::Nssec5::Intermediate,
                    x if x == 3 => pb::Nssec5::Small,
                    x if x == 4 => pb::Nssec5::Lower,
                    x if x == 5 => pb::Nssec5::Routine,
                    x => bail!("Unknown nssec5 {}", x),
                }
                .into(),*/
            },
            employment: pb::Employment {
                sic1d07: self.sic1d07,
                sic2d07: self.sic2d07,
                soc2010: self.soc2010,
                pwkstat: match self.pwkstat.as_str() {
                    "0. N/A (age<16)" => pb::PwkStat::Na,
                    "1. Employee FT" => pb::PwkStat::EmployeeFt,
                    "2. Employee PT" => pb::PwkStat::EmployeePt,
                    "3. Employee unspec." => pb::PwkStat::EmployeeUnspec,
                    "4. Self-Employed" => pb::PwkStat::SelfEmployed,
                    "5. Unemployed" => pb::PwkStat::PwkUnemployed,
                    "6. Retired" => pb::PwkStat::Retired,
                    "7. Homemaker/Mat.Leave" => pb::PwkStat::Homemaker,
                    "8. Student FT" => pb::PwkStat::StudentFt,
                    "9. Long-term Sick/Dis" => pb::PwkStat::LongTermSick,
                    "10. Other" => pb::PwkStat::PwkOther,
                    x => bail!("Unknown pwkstat value {}", x),
                }
                .into(),
                salary_hourly: self.salary_hourly,
                salary_yearly: self.salary_yearly,
            },
            health: pb::Health {
                bmi: match self.bmi.as_str() {
                    "Not applicable" => pb::Bmi::NotApplicable,
                    "Underweight: less than 18.5" => pb::Bmi::Underweight,
                    "Normal: 18.5 to less than 25" => pb::Bmi::Normal,
                    "Overweight: 25 to less than 30" => pb::Bmi::Overweight,
                    "Obese I: 30 to less than 35" => pb::Bmi::Obese1,
                    "Obese II: 35 to less than 40" => pb::Bmi::Obese2,
                    "Obese III: 40 or more" => pb::Bmi::Obese3,
                    x => bail!("Unknown BMIvg6 value {}", x),
                }
                .into(),
                bmi_new: self.bmi_new,
                has_cardiovascular_disease: self.cvd > 0,
                has_diabetes: self.diabetes > 0,
                has_high_blood_pressure: self.bloodpressure > 0,
            },
            time_use: pb::TimeUse {
                unknown: self.punknown,
                work: self.pwork,
                school: self.pschool,
                shop: self.pshop,
                services: self.pservices,
                leisure: self.pleisure,
                escort: self.pescort,
                transport: self.ptransport,
                not_home: self.pnothome,
                home: self.phome,
                work_home: self.pworkhome,
                home_total: self.phometot,
            },

            duration_per_activity,
        })
    }
}

// If the durations don't sum to 1, pad Home
fn pad_durations(durations: &mut EnumMap<Activity, f64>) -> Result<()> {
    let total: f64 = durations.values().sum();
    // TODO Check the rounding in the Python version
    let epsilon = 0.00001;
    if total > 1.0 + epsilon {
        bail!("Someone's durations sum to {}", total);
    } else if total < 1.0 {
        durations[Activity::Home] = 1.0 - total;
    }
    Ok(())
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
