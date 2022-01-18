use std::collections::BTreeMap;
use std::io::Write;

use anyhow::Result;
use fs_err::File;
use geo::Point;
use serde::Serialize;

use crate::{Person, Population, MSOA};

impl Population {
    /// Dump the population as 4 files matching the Python pipeline's InitialisationCache.
    pub fn write_python_cache(&self, output_dir: String) -> Result<()> {
        fs_err::create_dir_all(&output_dir)?;
        self.write_lockdown(format!("{}/lockdown.csv", output_dir))?;
        self.write_buildings(format!("{}/msoa_building_coordinates.json", output_dir))?;
        self.write_individuals(format!("{}/individuals.csv", output_dir))?;
        // TODO activity locations
        Ok(())
    }

    fn write_lockdown(&self, path: String) -> Result<()> {
        let mut f = File::create(path)?;
        // Just directly match the Python format; the first column is unnamed, but means day
        writeln!(f, ",change")?;
        for (idx, change) in self.lockdown_per_day.iter().enumerate() {
            writeln!(f, "{},{}", idx, change)?;
        }
        Ok(())
    }

    fn write_buildings(&self, path: String) -> Result<()> {
        let data: BTreeMap<&MSOA, &Vec<Point<f64>>> = self
            .info_per_msoa
            .iter()
            .map(|(msoa, info)| (msoa, &info.buildings))
            .collect();
        let mut file = File::create(path)?;
        // TODO Oh hey, the order of coordinates is reversed
        write!(file, "{}", serde_json::to_string(&data)?)?;
        Ok(())
    }

    fn write_individuals(&self, path: String) -> Result<()> {
        // Python expects this as a pickled pandas DataFrame. I can't find a way to easily
        // serialize that format. So let's just write a regular CSV and convert that to a DataFrame
        // in Python.
        let mut writer = csv::Writer::from_writer(File::create(path)?);
        for person in &self.people {
            writer.serialize(convert_person(self, person))?;
        }
        writer.flush()?;
        Ok(())
    }
}

// There are 84 columns, but which are actually used by later code?
#[derive(Serialize)]
struct Individual {
    #[serde(rename = "ID")]
    id: usize,
    #[serde(rename = "MSOA11CD")]
    msoa: String,
    age: u8,
    sic1d07: Option<usize>,
    cvd: u8,
    diabetes: u8,
    bloodpressure: u8,
    // TODO BMI back as a string
    lng: f64,
    lat: f64,
    #[serde(rename = "House_ID")]
    house: usize,
}

fn convert_person(pop: &Population, person: &Person) -> Individual {
    Individual {
        id: person.id.0,
        msoa: pop.households[person.household].msoa.0.clone(),
        age: person.age_years,
        sic1d07: person.sic1d07,
        cvd: person.cardiovascular_disease,
        diabetes: person.diabetes,
        bloodpressure: person.blood_pressure,
        lng: person.location.lng(),
        lat: person.location.lat(),
        house: person.household.0,
    }
}
