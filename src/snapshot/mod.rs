use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::{Obesity, StudyAreaCache};

/// This is the input into the OpenCL simulation. See
/// https://github.com/Urban-Analytics/RAMP-UA/blob/master/microsim/opencl/doc/model_design.md
#[derive(Serialize, Deserialize)]
// TODO We probably want to write as an npz, not serde
pub struct Snapshot {
    people_ages: Vec<u16>,
    people_obesity: Vec<u16>,
    people_cvd: Vec<u8>,
    people_diabetes: Vec<u8>,
    people_blood_pressure: Vec<u8>,
    // area_codes
    // not_home_probs
    // people_place_ids and people_flows
    // place_activities
    // place_coordinates
}

impl Snapshot {
    pub fn generate(input: StudyAreaCache) -> Result<Snapshot> {
        let people_ages = input
            .population
            .people
            .iter()
            .map(|p| p.age_years.into())
            .collect();
        let people_obesity = input
            .population
            .people
            .iter()
            .map(|p| match p.obesity {
                Obesity::Obese3 => 4,
                Obesity::Obese2 => 3,
                Obesity::Obese1 => 2,
                Obesity::Overweight => 1,
                Obesity::Normal => 0,
            })
            .collect();
        let people_cvd = input
            .population
            .people
            .iter()
            .map(|p| p.cardiovascular_disease)
            .collect();
        let people_diabetes = input.population.people.iter().map(|p| p.diabetes).collect();
        let people_blood_pressure = input
            .population
            .people
            .iter()
            .map(|p| p.blood_pressure)
            .collect();
        Ok(Snapshot {
            people_ages,
            people_obesity,
            people_cvd,
            people_diabetes,
            people_blood_pressure,
        })
    }
}
