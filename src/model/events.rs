use std::collections::BTreeSet;

use geo::prelude::HaversineDistance;
use rand::seq::SliceRandom;

use super::DiseaseStatus;
use crate::{Event, Model, PersonID};

impl Model {
    /// Simulate people attending one-time events, and determine new infections accordingly
    pub fn get_newly_infected_from_events(&mut self) -> BTreeSet<PersonID> {
        let mut all_newly_infected = BTreeSet::new();

        for event in &self.pop.events {
            // TODO Need to transform the dates into simulation days
            /*if event.date != self.day {
                continue;
            }*/

            let attendees: Vec<PersonID> = if event.family {
                // TODO Haven't deciphered the index magic yet
                todo!()
            } else {
                // Find all the people interested in this event type, and how far they are to the
                // event
                let candidates: Vec<(PersonID, f32)> = self
                    .pop
                    .people
                    .iter()
                    .filter_map(|person| {
                        if self.people[person.id].status == DiseaseStatus::Dead {
                            None
                        } else {
                            // TODO need to scrape their event interest
                            let dist = person.location.haversine_distance(&event.location);
                            Some((person.id, 1.0 / dist.powi(2)))
                        }
                    })
                    .collect();
                candidates
                    .choose_multiple_weighted(&mut self.rng, event.number_attendees, |pair| pair.1)
                    .unwrap()
                    .map(|pair| pair.0)
                    .collect()
            };

            // Group by status (TODO I swear there's a partition method)
            let mut susceptible = Vec::new();
            let mut num_infected = 0;
            for id in attendees {
                // TODO Not Presymptomatic?
                if matches!(
                    self.people[id].status,
                    DiseaseStatus::Asymptomatic | DiseaseStatus::Symptomatic
                ) {
                    num_infected += 1;
                } else {
                    // TODO Even if Recovered?
                    susceptible.push(id);
                }
            }

            let num_newly_infected =
                num_newly_infected_tupper(event, susceptible.len() + num_infected, num_infected);
            all_newly_infected
                .extend(susceptible.choose_multiple(&mut self.rng, num_newly_infected));
        }

        all_newly_infected
    }
}

// TODO The number of initially infected doesn't matter at all?!
fn num_newly_infected_tupper(event: &Event, num_attendees: usize, _num_infected: usize) -> usize {
    // Each contact cycle contributes to the total number of infected
    let mut newly_infected = 0;
    for cycle in &event.contact_cycles {
        // TODO Scale by attendance -- based on the max size of the event. Or can't we just calculate
        // the actual size earlier?
        let ratio =
            (num_attendees * cycle.contacts & cycle.duration) as f64 / cycle.typical_time as f64;
        let scale = 1.0 - (-cycle.risk * cycle.typical_time as f64).exp();
        newly_infected += (scale * ratio) as usize;
    }
    newly_infected
}
