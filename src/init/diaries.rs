use std::collections::BTreeMap;

use anyhow::Result;
use fs_err::File;
use serde::Deserialize;

use crate::pb::TimeUseDiary;
use crate::DiaryID;

pub fn load_time_use_diaries() -> Result<BTreeMap<DiaryID, TimeUseDiary>> {
    let mut map = BTreeMap::new();

    // TODO real files
    let path = "/home/dabreegster/Downloads/new_spc_data/diariesRef.csv";
    /*for rec in csv::Reader::from_reader(File::open(path)?).deserialize() {
        let rec: Row = rec?;
    }*/
    Ok(map)
}
