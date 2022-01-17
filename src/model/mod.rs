mod params;

use anyhow::Result;
use enum_map::EnumMap;
use ordered_float::NotNan;
use rand::rngs::{StdRng, ThreadRng};
use rand::{Rng, SeedableRng};

use crate::{Activity, Obesity, Person, Population, VenueID};
pub use params::Params;
use params::SymptomStatus;

pub struct Model {
    // Number of days elapsed
    day: usize,
    params: Params,

    // PersonID indexes this
    people_state: Vec<PersonState>,
    // VenueID indexes this
    places_per_activity: EnumMap<Activity, Vec<PlaceState>>,

    // Nest this here, but nothing in here changes
    pop: Population,
}

#[derive(Clone)]
enum DiseaseStatus {
    // TODO The hazard is 0 at the beginning of the day, and gets changed in receive_hazards, and
    // immediately used. We don't really need to keep it as state.
    Susceptible { hazard: f32 },
    Exposed,
    Presymptomatic,
    Asymptomatic,
    Symptomatic,
    Recovered,
    Dead,
}

impl DiseaseStatus {
    fn to_symptom_status(&self) -> Option<SymptomStatus> {
        match self {
            DiseaseStatus::Presymptomatic => Some(SymptomStatus::Presymptomatic),
            DiseaseStatus::Asymptomatic => Some(SymptomStatus::Asymptomatic),
            DiseaseStatus::Symptomatic => Some(SymptomStatus::Symptomatic),
            _ => None,
        }
    }
}

#[derive(Clone)]
struct PersonState {
    status: DiseaseStatus,
    // How many days left until somebody transitions to their next disease status
    transition_time: usize,
    rng: StdRng,
    // Don't assume any sorting for the lists of flows
    flows: Vec<Flow>,
    // These never change
    baseline_flows: Vec<Flow>,
}

#[derive(Clone)]
struct Flow {
    activity: Activity,
    venue: VenueID,
    weight: f32,
}

#[derive(Clone)]
struct PlaceState {
    hazards: f32,
    // How many different people visited here today?
    counts: usize,
}

impl Model {
    // Everybody starts Susceptible; seeding happens later
    pub fn new(pop: Population, mut rng: ThreadRng) -> Result<Model> {
        let mut people_state = Vec::new();
        for person in &pop.people {
            let flows = get_baseline_flows(person);
            people_state.push(PersonState {
                status: DiseaseStatus::Susceptible { hazard: 0.0 },
                transition_time: 0,
                rng: StdRng::from_rng(&mut rng)?,
                baseline_flows: flows.clone(),
                flows,
            });
        }
        let mut model = Model {
            day: 0,
            params: Params::new(),

            people_state,
            places_per_activity: EnumMap::default(),

            pop,
        };
        // Not really necessary; we do this at the beginning of every timestep anyway
        model.reset_place_state();
        Ok(model)
    }

    // TODO Decide where/how to do the initial seeding

    pub fn run(&mut self) {
        let total_days = 100; // TODO

        for day in 0..total_days {
            self.simulate_day(day);
        }
    }

    fn simulate_day(&mut self, day: usize) {
        assert_eq!(day, self.day);

        // Update lockdown multipliers

        // Reset hazards and counts for each place
        self.reset_place_state();

        // Update people's flows for today, based on baseline flows, disease status, and lockdown
        self.update_people_flows();

        // Send hazards. For infectious people, use their flows to update hazard and count
        // everywhere they go
        self.send_hazards();

        // Receive hazards. For susceptible people, sum total hazard of places they go, weighting
        // by their own flow there.
        self.receive_hazards();

        // Update disease statuses. This might just set transition_time and wait.
        self.update_status();

        self.day += 1;
    }

    fn reset_place_state(&mut self) {
        let mut places_per_activity = EnumMap::default();
        for activity in Activity::all() {
            let num_places = if activity == Activity::Home {
                self.pop.households.len()
            } else {
                self.pop.venues_per_activity[activity].len()
            };
            places_per_activity[activity] = std::iter::repeat(PlaceState {
                hazards: 0.0,
                counts: 0,
            })
            .take(num_places)
            .collect();
        }
        self.places_per_activity = places_per_activity;
    }

    fn update_people_flows(&mut self) {
        for person in &mut self.people_state {
            let non_home_multiplier = if matches!(person.status, DiseaseStatus::Susceptible { .. })
            {
                self.params.symptomatic_multiplier
            } else {
                self.params.lockdown_multiplier
            };

            let mut total_non_home = 0.0;
            let mut new_flows = Vec::new();
            let mut home_idx = None;
            // Calculate from the baseline flows; the previous day's decisions are irrelevant /
            // redundant
            for mut flow in person.baseline_flows.clone() {
                if flow.activity == Activity::Home {
                    // TODO We could always put Home as the first flow
                    home_idx = Some(new_flows.len());
                } else {
                    flow.weight *= non_home_multiplier;
                    total_non_home += flow.weight;
                }
                new_flows.push(flow);
            }
            new_flows[home_idx.unwrap()].weight = 1.0 - total_non_home;
            person.flows = new_flows;
        }
    }

    fn send_hazards(&mut self) {
        for person in &self.people_state {
            if let Some(symptom_status) = person.status.to_symptom_status() {
                let individual_multiplier =
                    self.params.individual_hazard_multipliers[symptom_status];
                for flow in &person.flows {
                    let place_multiplier = self.params.location_hazard_multipliers[flow.activity];
                    let place = self.places_per_activity[flow.activity]
                        .get_mut(flow.venue.0)
                        .unwrap();
                    place.counts += 1;
                    place.hazards += flow.weight * place_multiplier * individual_multiplier;
                }
            }
        }
    }

    fn receive_hazards(&mut self) {
        for person in &mut self.people_state {
            if !matches!(person.status, DiseaseStatus::Susceptible { .. }) {
                continue;
            }
            let mut hazard = 0.0;
            for flow in &person.flows {
                hazard += self.places_per_activity[flow.activity][flow.venue.0].hazards;
            }
            person.status = DiseaseStatus::Susceptible { hazard };
        }
    }

    fn update_status(&mut self) {
        for (idx, person) in self.people_state.iter_mut().enumerate() {
            if person.transition_time > 0 {
                person.transition_time -= 1;
                continue;
            }

            // TODO Better names
            let person_info = &self.pop.people[idx];

            match person.status {
                DiseaseStatus::Susceptible { hazard } => {
                    let infection_prob = 1.0 - (-hazard).exp();
                    if person.rng.gen_bool(infection_prob.into()) {
                        person.status = DiseaseStatus::Exposed;
                        // TODO sample_exposed_duration
                        // rand_weibull(rng, params->exposed_scale, params->exposed_shape)
                        // Use https://docs.rs/rand_distr/0.4.2/rand_distr/struct.Weibull.html
                        person.transition_time = 3;
                    }

                    // TODO Then immediately do the Exposed logic, which seems to clobber
                    // transition_time?
                }
                DiseaseStatus::Exposed => {
                    let mut symptomatic_prob =
                        get_symptomatic_prob_for_age(&self.params, person_info.age_years);
                    // TODO >= 2, double check values
                    if matches!(person_info.obesity, Obesity::Obese3 | Obesity::Obese2) {
                        symptomatic_prob *= self.params.overweight_sympt_mplier;
                        symptomatic_prob = symptomatic_prob.clamp(0.0, 1.0);
                    }

                    if person.rng.gen_bool(symptomatic_prob.into()) {
                        person.status = DiseaseStatus::Presymptomatic;
                        // TODO sample_presymptomatic_duration
                        person.transition_time = 3;
                    } else {
                        person.status = DiseaseStatus::Asymptomatic;
                        // TODO sample_infection_duration
                        person.transition_time = 3;
                    };
                }
                DiseaseStatus::Presymptomatic => {
                    // TODO Immediately?
                    person.status = DiseaseStatus::Symptomatic;
                    // TODO sample_infection_duration
                    person.transition_time = 3;
                }
                DiseaseStatus::Asymptomatic => {
                    person.status = DiseaseStatus::Recovered;
                }
                DiseaseStatus::Symptomatic => {
                    let mut mortality_prob =
                        get_mortality_prob_for_age(&self.params, person_info.age_years);
                    // TODO >= 2, double check values
                    if matches!(person_info.obesity, Obesity::Obese3 | Obesity::Obese2) {
                        // TODO Multiply by get_obesity_multiplier. But in the params I'm seeing,
                        // it's always just 1
                    }

                    // TODO All of these values just look like booleans. Seriously...
                    if person_info.cardiovascular_disease > 0 {
                        mortality_prob *= self.params.cvd_multiplier;
                    }
                    if person_info.diabetes > 0 {
                        mortality_prob *= self.params.diabetes_multiplier;
                    }
                    if person_info.blood_pressure > 0 {
                        mortality_prob *= self.params.bloodpressure_multiplier;
                    }

                    if person.rng.gen_bool(mortality_prob.into()) {
                        person.status = DiseaseStatus::Dead;
                    } else {
                        person.status = DiseaseStatus::Recovered;
                    }
                }
                DiseaseStatus::Recovered | DiseaseStatus::Dead => {}
            }
        }
    }
}

// Per person, flatten all the flows, regardless of activity
// TODO The biggest simplification we could make is encoding Activity into VenueID directly. The
// "global place ID" concept does this, but in a more complicated way.
fn get_baseline_flows(person: &Person) -> Vec<Flow> {
    let places_to_keep_per_person = 16;

    let mut flows = Vec::new();
    for activity in Activity::all() {
        let duration = person.duration_per_activity[activity];
        for (venue, flow) in &person.flows_per_activity[activity] {
            // Weight the flows by duration
            flows.push(Flow {
                activity,
                venue: *venue,
                weight: (flow * duration) as f32,
            });
        }
    }

    // Sort by flows, descending
    flows.sort_by_key(|flow| NotNan::new(flow.weight).unwrap());
    flows.reverse();
    // Only keep the top few
    flows.truncate(places_to_keep_per_person);

    flows
}

fn get_symptomatic_prob_for_age(params: &Params, age_years: u8) -> f32 {
    // Years per bin
    let bin_size = 10;
    // Largest bin covers 80+
    let max_bin_idx = 8;
    let idx = (age_years / bin_size).min(max_bin_idx);
    params.symptomatic_probs[idx as usize]
}

fn get_mortality_prob_for_age(params: &Params, age_years: u8) -> f32 {
    // Years per bin
    let bin_size = 5;
    // Largest bin covers 80+
    let max_bin_idx = 18;
    let idx = (age_years / bin_size).min(max_bin_idx);
    params.mortality_probs[idx as usize]
}
