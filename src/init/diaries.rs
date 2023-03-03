use std::collections::HashMap;

use anyhow::Result;
use fs_err::File;

use crate::pb::{Nssec8, PwkStat, Sex, TimeUseDiary};
use crate::utilities::print_count;
use crate::{DiaryID, Population};

#[instrument(skip_all)]
pub fn load_time_use_diaries(population: &mut Population) -> Result<()> {
    info!("Loading TimeUseDiaries");

    let path = "data/raw_data/nationaldata-v2/diariesRef.csv";
    for rec in csv::Reader::from_reader(File::open(path)?).deserialize() {
        let rec: HashMap<String, String> = rec?;

        // TODO We could be more paranoid here
        population.time_use_diaries.push(TimeUseDiary {
            uid: rec["uniqueID"].clone(),
            weekday: rec["weekday"] == "1",
            day_type: rec["dayType"].parse()?,
            month: rec["month"].parse()?,
            pworkhome: rec["pworkhome"].parse()?,
            phomeother: rec["phomeother"].parse()?,
            pwork: rec["pwork"].parse()?,
            pschool: rec["pschool"].parse()?,
            pshop: rec["pshop"].parse()?,
            pservices: rec["pservices"].parse()?,
            pleisure: rec["pleisure"].parse()?,
            pescort: rec["pescort"].parse()?,
            ptransport: rec["ptransport"].parse()?,
            phome_total: rec["phomeTOT"].parse()?,
            pnothome_total: rec["pnothomeTOT"].parse()?,
            punknown_total: rec["punknownTOT"].parse()?,
            pmwalk: rec["pmwalk"].parse()?,
            pmcycle: rec["pmcycle"].parse()?,
            pmpublic: rec["pmpublic"].parse()?,
            pmprivate: rec["pmprivate"].parse()?,
            pmunknown: rec["pmunknown"].parse()?,
            sex: Sex::from_i32(rec["sex"].parse()?)
                .expect("Unknown sex")
                .into(),
            age35g: rec["age35g"].parse()?,
            // TODO If the numeric values don't match, just gives up. Should we check for -1
            // explicitly?
            nssec8: Nssec8::from_i32(rec["nssec8"].parse()?).map(|x| x.into()),
            pwkstat: PwkStat::from_i32(rec["pwkstat"].parse()?)
                .expect("Unknown pwkstat")
                .into(),
        });
    }

    if population.time_use_diaries.len() >= 2_usize.pow(32) {
        bail!("There are too many diaries; uint32 in the output proto schema won't work");
    }

    info!(
        "{} diaries for {} people",
        print_count(population.time_use_diaries.len()),
        print_count(population.people.len())
    );

    Ok(())
}

#[instrument(skip_all)]
pub fn load_diaries_per_person(population: &mut Population) -> Result<()> {
    info!("Matching people to weekday and weekend diaries");

    // TODO prost throws away type safety on enums!
    let mut all_nssec8: Vec<Option<i32>> = (0..=8).map(Some).collect();
    all_nssec8.push(None);
    let all_pwkstat: Vec<i32> = (0..=10).collect();

    // Group diaries by (is weekday, age35g, sex, nssec8, pwkstat)
    let mut diaries: HashMap<(bool, u32, i32, Option<i32>, i32), Vec<DiaryID>> = HashMap::new();
    for (id, diary) in population.time_use_diaries.iter_enumerated() {
        let key = (
            diary.weekday,
            diary.age35g,
            diary.sex,
            diary.nssec8,
            diary.pwkstat,
        );
        diaries.entry(key).or_insert_with(Vec::new).push(id);
    }

    // Assign weekday and weekend diaries to each person
    for person in &mut population.people {
        let mut age_group = bucket_age(person.demographics.age_years);
        if age_group == 1 || age_group == 2 {
            // TODO Baby special case. How do we want to encode this?
            continue;
        }
        // Pretend group 3 is group 4; there were no time-use surveys filled out for group age 5,
        // 6, 7
        if age_group == 3 {
            age_group = 4;
        }

        for weekday in [true, false] {
            let mut ids: Vec<DiaryID> = Vec::new();
            // Ideally use everything to match
            if let Some(matches) = diaries.get(&(
                weekday,
                age_group,
                person.demographics.sex,
                person.demographics.nssec8,
                person.employment.pwkstat,
            )) {
                ids.extend(matches.clone());
            } else {
                // Give up on matching nssec8 and pwkstat
                for nssec8 in &all_nssec8 {
                    for pwkstat in &all_pwkstat {
                        ids.extend(
                            diaries
                                .get(&(
                                    weekday,
                                    age_group,
                                    person.demographics.sex,
                                    *nssec8,
                                    *pwkstat,
                                ))
                                .cloned()
                                .unwrap_or_else(Vec::new),
                        );
                    }
                }
            }
            if ids.is_empty() {
                warn!("No diary entries for {}", person.id);
            }
            if weekday {
                person.weekday_diaries = ids;
            } else {
                person.weekend_diaries = ids;
            }
        }
    }

    Ok(())
}

// Based on ONS-defined groups
fn bucket_age(a: u32) -> u32 {
    if a == 0 || a == 1 {
        1
    } else if a < 11 {
        2 + (a - 2) / 3
    } else if a == 11 || a == 12 {
        5
    } else if a < 16 {
        6
    } else if a <= 19 {
        7
    } else if a > 99 {
        23
    } else if a > 19 {
        8 + (a - 20) / 5
    } else {
        unreachable!()
    }
}
