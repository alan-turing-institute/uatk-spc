mod params;

use enum_map::EnumMap;

use crate::{Activity, Population};
pub use params::Params;

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
    Susceptible { hazard: f32 },
    Exposed,
    Presymptomatic,
    Asymptomatic,
    Symptomatic,
    Recovered,
    Dead,
}

#[derive(Clone)]
struct PersonState {
    status: DiseaseStatus,
    // How many days left until somebody transitions to their next disease status
    transition_time: Option<usize>,
    // rng
    // flows/slots
}

#[derive(Clone)]
struct PlaceState {
    hazards: u32,
    // How many different people visited here today?
    counts: usize,
}

impl Model {
    // Everybody starts Susceptible; seeding happens later
    pub fn new(pop: Population) -> Model {
        let people_state = std::iter::repeat(PersonState {
            status: DiseaseStatus::Susceptible { hazard: 0.0 },
            transition_time: None,
        })
        .take(pop.people.len())
        .collect();
        let mut places_per_activity = EnumMap::default();
        for activity in Activity::all() {
            let num_places = if activity == Activity::Home {
                pop.households.len()
            } else {
                pop.venues_per_activity[activity].len()
            };
            places_per_activity[activity] = std::iter::repeat(PlaceState {
                hazards: 0,
                counts: 0,
            })
            .take(num_places)
            .collect();
        }

        Model {
            day: 0,
            params: Params::new(),

            people_state,
            places_per_activity,

            pop,
        }
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

        // Update people's flows for today, based on baseline flows, disease status, and lockdown

        // Send hazards. For infectious people, use their flows to update hazard and count
        // everywhere they go

        // Receive hazards. For susceptible people, sum total hazard of places they go, weighting
        // by their own flow there.

        // Update disease statuses. This might just set transition_time and wait.

        self.day += 1;
    }
}
