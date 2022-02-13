use std::io::Write;

use anyhow::Result;
use enum_map::EnumMap;
use fs_err::File;
use ndarray::{arr0, Array, Array1};
use ndarray_npy::NpzWriter;
use ndarray_rand::rand_distr::Uniform;
use ndarray_rand::RandomExt;
use ordered_float::NotNan;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;

use crate::model::Params;
use crate::utilities::progress_count;
use crate::{Activity, Obesity, Population, VenueID};

// A slot is a place somebody could visit
const SLOTS: usize = 100;

/// This is the input into the OpenCL simulation. See
/// https://github.com/Urban-Analytics/RAMP-UA/blob/master/microsim/opencl/doc/model_design.md
pub struct Snapshot;

/// Unlike VenueID, these aren't scoped to an activity -- they represent every possible place in
/// the model.
//#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize, Deserialize)]
struct GlobalPlaceID(u32);

/// Maps an Activity and VenueID to a GlobalPlaceID
struct IDMapping {
    id_offset_per_activity: EnumMap<Activity, u32>,
    total_places: u32,
    place_activities: Array1<u32>,
}

impl IDMapping {
    /// This'll fail if we overflow u32
    fn new(pop: &Population) -> Option<IDMapping> {
        let total_places = pop
            .venues_per_activity
            .values()
            .map(|list| list.len())
            .sum::<usize>()
            + pop.households.len();
        // Per place, the activity associated with it
        let mut place_activities = Array1::<u32>::zeros(total_places);

        let mut id_offset_per_activity = EnumMap::default();
        let mut offset: u32 = 0;
        for activity in Activity::all() {
            let num_venues: u32 = if activity == Activity::Home {
                pop.households.len().try_into().ok()?
            } else {
                pop.venues_per_activity[activity].len().try_into().ok()?
            };
            id_offset_per_activity[activity] = offset;
            let start = offset;
            offset = offset.checked_add(num_venues)?;

            // TODO Make sure the order matches Python -- they use the order of
            // activity_locations.keys()
            let activity_idx = activity as u32;
            // TODO Figure out slicing
            for i in (start as usize)..(offset as usize) {
                place_activities[i] = activity_idx;
            }
        }
        assert_eq!(total_places, offset as usize);
        Some(IDMapping {
            id_offset_per_activity,
            total_places: total_places.try_into().ok()?,
            place_activities,
        })
    }

    fn to_place(&self, activity: Activity, venue: &VenueID) -> GlobalPlaceID {
        GlobalPlaceID(self.id_offset_per_activity[activity] + venue.0 as u32)
    }
}

impl Snapshot {
    pub fn convert_to_npz(input: Population, path: String, rng: &mut StdRng) -> Result<()> {
        let id_mapping =
            IDMapping::new(&input).ok_or_else(|| anyhow!("More than 2**32 place IDs"))?;
        let people = &input.people;
        let num_people = people.len();
        let num_places = id_mapping.total_places as usize;

        let mut npz = NpzWriter::new(File::create(&path)?);

        npz.add_array("nplaces", &arr0(id_mapping.total_places))?;
        npz.add_array("npeople", &arr0(num_people as u32))?;
        npz.add_array("nslots", &arr0(SLOTS as u32))?;
        npz.add_array("time", &arr0(0))?;
        npz.add_array(
            "not_home_probs",
            &people
                .iter()
                .map(|p| p.pr_not_home)
                .collect::<Array1<f32>>(),
        )?;
        npz.add_array(
            "lockdown_multipliers",
            &input
                .lockdown_per_day
                .iter()
                .map(|x| *x as f32)
                .collect::<Array1<f32>>(),
        )?;

        npz.add_array("place_activities", &id_mapping.place_activities)?;
        npz.add_array(
            "place_coords",
            &get_place_coordinates(&input, &id_mapping, rng)?,
        )?;
        npz.add_array("place_hazards", &Array1::<u32>::zeros(num_places))?;
        npz.add_array("place_counts", &Array1::<u32>::zeros(num_places))?;

        npz.add_array(
            "people_ages",
            &people
                .iter()
                .map(|p| p.age_years.into())
                .collect::<Array1<u16>>(),
        )?;
        npz.add_array(
            "people_obesity",
            &people
                .iter()
                .map(|p| match p.obesity {
                    Obesity::Obese3 => 4,
                    Obesity::Obese2 => 3,
                    Obesity::Obese1 => 2,
                    Obesity::Overweight => 1,
                    Obesity::Normal => 0,
                })
                .collect::<Array1<u16>>(),
        )?;
        npz.add_array(
            "people_cvd",
            &people
                .iter()
                .map(|p| p.cardiovascular_disease)
                .collect::<Array1<u8>>(),
        )?;
        npz.add_array(
            "people_diabetes",
            &people.iter().map(|p| p.diabetes).collect::<Array1<u8>>(),
        )?;
        npz.add_array(
            "people_blood_pressure",
            &people
                .iter()
                .map(|p| p.blood_pressure)
                .collect::<Array1<u8>>(),
        )?;
        npz.add_array("people_statuses", &Array1::<u32>::zeros(num_people))?;
        npz.add_array("people_transition_times", &Array1::<u32>::zeros(num_people))?;

        let (people_place_ids, people_baseline_flows) = get_baseline_flows(&input, &id_mapping)?;
        npz.add_array("people_place_ids", &people_place_ids)?;
        npz.add_array("people_baseline_flows", &people_baseline_flows)?;
        npz.add_array("people_flows", &people_baseline_flows)?;
        npz.add_array("people_hazards", &Array1::<f32>::zeros(num_people))?;
        npz.add_array(
            "people_prngs",
            &Array1::<u32>::random(4 * num_people, Uniform::new(0, u32::MAX)),
        )?;

        npz.add_array("params", &Params::new().get_flattened_array())?;

        npz.finish()?;

        // TODO We need to write the string area_codes as pickled objects, but ndarray_npy doesn't
        // support arbitrary objects yet. Instead write a separate JSON file, and use a Python
        // script to add the array.
        let area_codes = people
            .iter()
            .map(|p| &input.households[p.household].msoa.0)
            .collect::<Vec<_>>();
        let mut file = File::create(format!("{}_area_codes.json", path))?;
        write!(file, "{}", serde_json::to_string_pretty(&area_codes)?)?;

        Ok(())
    }
}

fn get_baseline_flows(
    pop: &Population,
    id_mapping: &IDMapping,
) -> Result<(Array1<u32>, Array1<f32>)> {
    let places_to_keep_per_person = 16;
    let max_places_per_person = SLOTS;

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
        // TODO Dedupe with get_baseline_flows in the Model
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

fn get_place_coordinates(
    input: &Population,
    id_mapping: &IDMapping,
    rng: &mut StdRng,
) -> Result<Array1<f32>> {
    let mut result = Array1::<f32>::zeros(id_mapping.total_places as usize * 2);

    for activity in Activity::all() {
        // Not stored as venues
        if activity == Activity::Home {
            continue;
        }

        for venue in &input.venues_per_activity[activity] {
            let place = id_mapping.to_place(activity, &venue.id);
            if place.0 == 0 {
                panic!("venue at {:?}", venue.location);
            }
            result[place.0 as usize * 2 + 0] = venue.location.lat();
            result[place.0 as usize * 2 + 1] = venue.location.lng();
        }
    }

    // For homes, we just pick a random building in the MSOA area. This is just used for
    // visualization, so lack of buildings mapped in some areas isn't critical.
    for household in &input.households {
        let place = id_mapping.to_place(Activity::Home, &household.id);
        match input.info_per_msoa[&household.msoa].buildings.choose(rng) {
            Some(pt) => {
                result[place.0 as usize * 2 + 0] = pt.lat();
                result[place.0 as usize * 2 + 1] = pt.lng();
            }
            None => {
                // TODO Should we fail, or just pick a random point in the shape?
                bail!("MSOA {:?} has no buildings", household.msoa);
            }
        }
    }

    Ok(result)
}
