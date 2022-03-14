mod events;
mod params;

use anyhow::Result;
use enum_map::EnumMap;
use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::{Rng, SeedableRng};
use rand_distr::{Distribution, LogNormal, Weibull};
use typed_index_collections::TiVec;

use crate::utilities::print_count;
use crate::{Activity, Flow, Obesity, PersonID, Population, VenueID};
pub use params::Params;
use params::SymptomStatus;

pub struct Model {
    // Number of days elapsed
    day: usize,
    params: Params,

    people: TiVec<PersonID, PersonState>,
    places_per_activity: EnumMap<Activity, TiVec<VenueID, PlaceState>>,

    // Nest this here, but nothing in here changes
    pop: Population,

    rng: StdRng,
}

#[derive(Clone, PartialEq)]
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
struct PlaceState {
    hazards: f32,
    // How many different people visited here today?
    counts: usize,
}

impl Model {
    // Everybody starts Susceptible; seeding happens later
    pub fn new(pop: Population, mut rng: StdRng) -> Result<Model> {
        let mut people = TiVec::new();
        for person in &pop.people {
            let flows = person.get_baseline_flows(16);
            people.push(PersonState {
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

            people,
            places_per_activity: EnumMap::default(),

            pop,

            rng,
        };
        model.seed_with_initial_cases()?;
        Ok(model)
    }

    fn seed_with_initial_cases(&mut self) -> Result<()> {
        let mut initially_infected: Vec<PersonID> = Vec::new();
        for (msoa, num_cases) in &self.pop.input.initial_cases_per_msoa {
            let high_risk: Vec<PersonID> = self
                .pop
                .people
                .iter()
                .filter_map(|person| {
                    if person.pr_not_home > 0.3
                        && &self.pop.households[person.household].msoa == msoa
                    {
                        Some(person.id)
                    } else {
                        None
                    }
                })
                .collect();
            if high_risk.len() < *num_cases {
                warn!("{msoa:?} has {num_cases} initial cases, but we only found {} high-risk people there", high_risk.len());
            }
            initially_infected.extend(high_risk.choose_multiple(&mut self.rng, *num_cases));
        }

        // Change peoples' initial status
        for id in initially_infected {
            let person = self.people.get_mut(id).unwrap();
            let person_info = &self.pop.people[id];
            person.status = DiseaseStatus::Asymptomatic;
            // TODO Duplicates some of the transition code
            let mut symptomatic_prob =
                get_symptomatic_prob_for_age(&self.params, person_info.age_years);
            // TODO Python code uses > 2, transiton function does >= 2
            if matches!(person_info.obesity, Obesity::Obese3 | Obesity::Obese2) {
                symptomatic_prob *= self.params.overweight_sympt_mplier;
                symptomatic_prob = symptomatic_prob.clamp(0.0, 1.0);
            }
            if person.rng.gen_bool(symptomatic_prob.into()) {
                person.status = DiseaseStatus::Symptomatic;
            }
            let transition_time = LogNormal::new(
                self.params.infection_log_scale.powi(2) + self.params.infection_mode.ln(),
                self.params.infection_log_scale,
            )?
            .sample(&mut person.rng);
            person.transition_time = person.rng.gen_range(0..transition_time.floor() as usize);
        }
        Ok(())
    }

    pub fn run(&mut self) -> Result<()> {
        let total_days = 100; // TODO

        for day in 0..total_days {
            println!("Day {}", day);
            self.simulate_day(day)?;
            if self.print_stats() {
                println!("Stopping early -- everyone's recovered or dead");
                break;
            }
        }

        Ok(())
    }

    /// If true, nothing's going to change -- everyone's in a terminal state
    fn print_stats(&self) -> bool {
        // Count people by status
        // TODO EnumMap would be way better
        let mut s = 0;
        let mut e = 0;
        let mut i_p = 0;
        let mut i_a = 0;
        let mut i_s = 0;
        let mut r = 0;
        let mut d = 0;
        for person in &self.people {
            match person.status {
                DiseaseStatus::Susceptible { .. } => {
                    s += 1;
                }
                DiseaseStatus::Exposed => {
                    e += 1;
                }
                DiseaseStatus::Presymptomatic => {
                    i_p += 1;
                }
                DiseaseStatus::Asymptomatic => {
                    i_a += 1;
                }
                DiseaseStatus::Symptomatic => {
                    i_s += 1;
                }
                DiseaseStatus::Recovered => {
                    r += 1;
                }
                DiseaseStatus::Dead => {
                    d += 1;
                }
            }
        }
        println!("  {} susceptible, {} exposed, {} presymptomatic, {} asymptomatic, {} symptomatic, {} recovered, {} dead", print_count(s), print_count(e), print_count(i_p), print_count(i_a), print_count(i_s), print_count(r), print_count(d));
        // If everyone's recovered or dead, we're done
        s + e + i_p + i_a + i_s == 0
    }

    fn simulate_day(&mut self, day: usize) -> Result<()> {
        assert_eq!(day, self.day);

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

        for id in self.get_newly_infected_from_events() {
            // TODO Transition them. Use the same math?
            info!("{} was infected from an event", id);
        }

        // Update disease statuses. This might just set transition_time and wait.
        self.update_status()?;

        self.day += 1;

        Ok(())
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
        // If we're simulating more days than we have lockdown values, just keep repeating the last
        // lockdown value -- which is presumably low
        let lockdown_multiplier = *self
            .pop
            .lockdown_per_day
            .get(self.day)
            .unwrap_or_else(|| self.pop.lockdown_per_day.last().unwrap());

        for person in &mut self.people {
            let non_home_multiplier = if person.status == DiseaseStatus::Symptomatic {
                self.params.symptomatic_multiplier
            } else {
                lockdown_multiplier
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
            if let Some(idx) = home_idx {
                new_flows[idx].weight = 1.0 - total_non_home;
            } else {
                // It's not in their top 16?
                /*warn!(
                    "Someone doesn't go home! Baseline flows {:?}",
                    person.baseline_flows
                );*/
            }
            person.flows = new_flows;
        }
    }

    fn send_hazards(&mut self) {
        for person in &self.people {
            if let Some(symptom_status) = person.status.to_symptom_status() {
                let individual_multiplier =
                    self.params.individual_hazard_multipliers[symptom_status];
                for flow in &person.flows {
                    let place_multiplier = self.params.location_hazard_multipliers[flow.activity];
                    let place = self.places_per_activity[flow.activity]
                        .get_mut(flow.venue)
                        .unwrap();
                    place.counts += 1;
                    place.hazards += flow.weight * place_multiplier * individual_multiplier;
                }
            }
        }
    }

    fn receive_hazards(&mut self) {
        for person in &mut self.people {
            if !matches!(person.status, DiseaseStatus::Susceptible { .. }) {
                continue;
            }
            let mut hazard = 0.0;
            for flow in &person.flows {
                hazard += self.places_per_activity[flow.activity][flow.venue].hazards;
            }
            person.status = DiseaseStatus::Susceptible { hazard };
        }
    }

    fn update_status(&mut self) -> Result<()> {
        for (person, person_info) in self.people.iter_mut().zip(self.pop.people.iter()) {
            if person.transition_time > 0 {
                person.transition_time -= 1;
                continue;
            }

            match person.status {
                DiseaseStatus::Susceptible { hazard } => {
                    let infection_prob = 1.0 - (-hazard).exp();
                    if person.rng.gen_bool(infection_prob.into()) {
                        person.status = DiseaseStatus::Exposed;
                        person.transition_time =
                            Weibull::new(self.params.exposed_scale, self.params.exposed_shape)?
                                .sample(&mut person.rng) as usize;
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
                        person.transition_time = Weibull::new(
                            self.params.presymptomatic_scale,
                            self.params.presymptomatic_shape,
                        )?
                        .sample(&mut person.rng)
                            as usize;
                    } else {
                        person.status = DiseaseStatus::Asymptomatic;
                        person.transition_time =
                            sample_infection_duration(&self.params, &mut person.rng)?;
                    };
                }
                DiseaseStatus::Presymptomatic => {
                    person.status = DiseaseStatus::Symptomatic;
                    person.transition_time =
                        sample_infection_duration(&self.params, &mut person.rng)?;
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
        Ok(())
    }
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

fn sample_infection_duration(params: &Params, rng: &mut StdRng) -> Result<usize> {
    let mode = params.infection_mode;
    let std_dev = params.infection_log_scale;
    let mean_log = std_dev.powi(2) + mode.ln();
    Ok(LogNormal::new(mean_log, std_dev)?.sample(rng) as usize)
}
