use anyhow::Result;
use fs_err::File;
use ndarray::{Array, Array1, Array2};
use ndarray_npy::NpzWriter;

use crate::{Activity, Obesity, Population, StudyAreaCache};

/// This is the input into the OpenCL simulation. See
/// https://github.com/Urban-Analytics/RAMP-UA/blob/master/microsim/opencl/doc/model_design.md
pub struct Snapshot {
    people_ages: Array1<u16>,
    people_obesity: Array1<u16>,
    people_cvd: Array1<u8>,
    people_diabetes: Array1<u8>,
    people_blood_pressure: Array1<u8>,
    // area_codes
    // not_home_probs
    people_place_ids: Array2<u32>,
    people_flows: Array2<f32>,
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
        let (people_place_ids, people_flows) = get_baseline_flows(&input.population)?;
        Ok(Snapshot {
            people_ages,
            people_obesity,
            people_cvd,
            people_diabetes,
            people_blood_pressure,
            people_place_ids,
            people_flows,
        })
    }

    pub fn write_npz(self, path: String) -> Result<()> {
        let mut npz = NpzWriter::new(File::create(path)?);
        npz.add_array("people_ages", &self.people_ages)?;
        npz.add_array("people_obesity", &self.people_obesity)?;
        npz.add_array("people_cvd", &self.people_cvd)?;
        npz.add_array("people_diabetes", &self.people_diabetes)?;
        npz.add_array("people_blood_pressure", &self.people_blood_pressure)?;
        // TODO These get flattened somehow
        npz.add_array("people_place_ids", &self.people_place_ids)?;
        npz.add_array("people_flows", &self.people_flows)?;
        npz.finish()?;
        Ok(())
    }
}

#[allow(unused)] // TODO
fn get_baseline_flows(pop: &Population) -> Result<(Array2<u32>, Array2<f32>)> {
    // Not sure why these aren't the same
    let max_places_per_person = 100;
    let places_to_keep_per_person = 16;

    let sentinel_value = u32::MAX;

    // Since we need to wind up with numpy arrays for the output anyway, port the Python code
    // pretty directly. A helpful reference:
    // https://docs.rs/ndarray/latest/ndarray/doc/ndarray_for_numpy_users/index.html

    // people_place_ids: 2D array. Rows are people, columns are sorted venue IDs. The venues cover
    // all activities, so the IDs are mapped into a global venue ID space
    let mut people_place_ids =
        Array::from_elem((pop.people.len(), max_places_per_person), sentinel_value);

    // people_flows: similar, but with the flows, further weighted by activity duration
    let mut people_flows = Array::zeros((pop.people.len(), max_places_per_person));

    for activity in Activity::all() {}

    Ok((people_place_ids, people_flows))
}
