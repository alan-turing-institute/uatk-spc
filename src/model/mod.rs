mod params;

use enum_map::EnumMap;
use ordered_float::NotNan;

use crate::{Activity, Person, Population, VenueID};
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
    transition_time: Option<usize>,
    // TODO rng
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
    pub fn new(pop: Population) -> Model {
        let people_state = pop
            .people
            .iter()
            .map(|person| {
                let flows = get_baseline_flows(person);
                PersonState {
                    status: DiseaseStatus::Susceptible { hazard: 0.0 },
                    transition_time: None,
                    baseline_flows: flows.clone(),
                    flows,
                }
            })
            .collect();
        let mut model = Model {
            day: 0,
            params: Params::new(),

            people_state,
            places_per_activity: EnumMap::default(),

            pop,
        };
        // Not really necessary; we do this at the beginning of every timestep anyway
        model.reset_place_state();
        model
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

    fn update_status(&mut self) {}
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
