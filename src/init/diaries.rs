use std::collections::{BTreeMap, HashMap};
use std::io::BufReader;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::json_seq::iter_json_array;
use crate::pb::TimeUseDiary;
use crate::utilities::print_count;
use crate::{DiaryID, Population};

#[instrument(skip_all)]
pub fn load_time_use_diaries(population: &mut Population) -> Result<()> {
    info!("Loading TimeUseDiaries");
    let mut map = BTreeMap::new();

    // TODO real files
    let path = "/home/dabreegster/Downloads/new_spc_data/diariesRef.csv";
    for rec in csv::Reader::from_reader(File::open(path)?).deserialize() {
        let rec: HashMap<String, String> = rec?;
        let uid = DiaryID(rec["uniqueID"].clone());

        // TODO We could be more paranoid here
        map.insert(
            uid.clone(),
            TimeUseDiary {
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
            },
        );
    }

    population.time_use_diaries = map;

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

    // TODO Real file
    let reader = BufReader::new(File::open(
        "/home/dabreegster/Downloads/new_spc_data/E09000002_Diaries.json",
    )?);

    // Turn into a map by pid
    let mut map: HashMap<String, (Vec<DiaryID>, Vec<DiaryID>)> = HashMap::new();
    for row in iter_json_array(reader) {
        let row: Row = row?;
        map.insert(row.pid, (row.weekday, row.weekend));
    }

    for person in &mut population.people {
        if let Some((weekday, weekend)) = map.remove(&person.identifiers.orig_pid) {
            person.weekday_diaries = weekday;
            person.weekend_diaries = weekend;

            for diary in person
                .weekday_diaries
                .iter()
                .chain(person.weekend_diaries.iter())
            {
                if !population.time_use_diaries.contains_key(diary) {
                    warn!(
                        "Person {} has missing diary {:?}",
                        person.identifiers.orig_pid, diary
                    );
                }
            }
        } else {
            warn!(
                "Person {} has no diaries defined",
                person.identifiers.orig_pid
            );
        }
    }

    Ok(())
}

#[derive(Deserialize)]
struct Row {
    pid: String,
    #[serde(rename = "diaryWD")]
    weekday: Vec<DiaryID>,
    #[serde(rename = "diaryWE")]
    weekend: Vec<DiaryID>,
}
