use anyhow::Result;
use enum_map::EnumMap;
use fs_err::File;
use ndarray::{Array, Array1};
use ndarray_npy::NpzWriter;
use ordered_float::NotNan;

use crate::utilities::progress_count;
use crate::{Activity, Obesity, Population, StudyAreaCache, VenueID};

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
    people_place_ids: Array1<u32>,
    people_baseline_flows: Array1<f32>,
    // place_activities
    // place_coordinates
}

/// Unlike VenueID, these aren't scoped to an activity -- they represent every possible place in
/// the model.
//#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
struct GlobalPlaceID(u32);

/// Maps an Activity and VenueID to a GlobalPlaceID
struct IDMapping {
    id_offset_per_activity: EnumMap<Activity, u32>,
}

impl IDMapping {
    /// This'll fail if we overflow u32
    fn new(pop: &Population) -> Option<IDMapping> {
        let mut id_offset_per_activity = EnumMap::default();
        let mut offset: u32 = 0;
        for activity in Activity::all() {
            let num_venues: u32 = if activity == Activity::Home {
                pop.households.len().try_into().ok()?
            } else {
                pop.venues_per_activity[activity].len().try_into().ok()?
            };
            id_offset_per_activity[activity] = offset;
            offset = offset.checked_add(num_venues)?;
        }
        Some(IDMapping {
            id_offset_per_activity,
        })
    }

    fn to_place(&self, activity: Activity, venue: &VenueID) -> GlobalPlaceID {
        GlobalPlaceID(self.id_offset_per_activity[activity] + venue.0 as u32)
    }
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
        let (people_place_ids, people_baseline_flows) = get_baseline_flows(&input.population)?;
        Ok(Snapshot {
            people_ages,
            people_obesity,
            people_cvd,
            people_diabetes,
            people_blood_pressure,
            people_place_ids,
            people_baseline_flows,
        })
    }

    pub fn write_npz(self, path: String) -> Result<()> {
        let mut npz = NpzWriter::new(File::create(path)?);
        npz.add_array("people_ages", &self.people_ages)?;
        npz.add_array("people_obesity", &self.people_obesity)?;
        npz.add_array("people_cvd", &self.people_cvd)?;
        npz.add_array("people_diabetes", &self.people_diabetes)?;
        npz.add_array("people_blood_pressure", &self.people_blood_pressure)?;
        npz.add_array("people_place_ids", &self.people_place_ids)?;
        npz.add_array("people_baseline_flows", &self.people_baseline_flows)?;
        npz.finish()?;
        Ok(())
    }
}

fn get_baseline_flows(pop: &Population) -> Result<(Array1<u32>, Array1<f32>)> {
    let id_mapping = IDMapping::new(pop).ok_or_else(|| anyhow!("More than 2**32 place IDs"))?;

    // Not sure why these aren't the same
    let max_places_per_person = 100;
    let places_to_keep_per_person = 16;

    // We ultimately want a 1D array for flows and place IDs. It's a flattened list, with
    // max_places_per_person entries per person.
    //
    // A helpful reference:
    // https://docs.rs/ndarray/latest/ndarray/doc/ndarray_for_numpy_users/index.html
    let mut people_place_ids = Array::from_elem(pop.people.len() * max_places_per_person, u32::MAX);
    let mut people_baseline_flows = Array::zeros(pop.people.len() * max_places_per_person);

    info!("Merging flows for all activities");
    let pq = progress_count(pop.people.len());
    for person in &pop.people {
        pq.inc(1);
        // Per person, flatten all the flows, regardless of activity
        let mut flows: Vec<(GlobalPlaceID, f64)> = Vec::new();
        for activity in Activity::all() {
            let duration = person.duration_per_activity[activity];
            for (venue, flow) in &person.flows_per_activity[activity] {
                let place = id_mapping.to_place(activity, venue);
                // Weight the flows by duration
                flows.push((place, flow * duration));
            }
        }

        // Sort by flows, descending
        flows.sort_by_key(|pair| NotNan::new(pair.1).unwrap());
        flows.reverse();
        // Only keep the top few
        flows.truncate(places_to_keep_per_person);

        // Fill out the final arrays, flattened to the range [start_idx, end_idx)
        let start_idx = person.id.0 * max_places_per_person;
        // TODO Figure out how to do the slicing
        //let end_idx = (person.id.0 + 1 ) * max_places_per_person;
        //let slice = Slice::from(start_idx..end_idx);
        for (idx, (place, flow)) in flows.into_iter().enumerate() {
            people_place_ids[start_idx + idx] = place.0;
            // TODO I think we can just handle f32's in the entire pipeline
            people_baseline_flows[start_idx + idx] = flow as f32;
        }
    }

    Ok((people_place_ids, people_baseline_flows))
}
