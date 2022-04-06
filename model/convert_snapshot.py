#!/usr/bin/env python3

import click
import numpy as np
import synthpop_pb2
from collections import namedtuple


@click.command()
@click.option(
    "-i",
    "--input_path",
    type=click.Path(exists=True),
    help="Convert this SPC protobuf file",
)
@click.option(
    "-o", "--output_path", type=click.Path(), help="Write the snapshot file here"
)
def main(input_path, output_path):
    print(f"Reading {input_path}")
    pop = synthpop_pb2.Population()
    f = open(input_path, "rb")
    pop.ParseFromString(f.read())
    f.close()

    convert_to_npz(pop, output_path)


# A slot is a place somebody could visit
SLOTS = 16


class IDMapping:
    """
    Maps an activity and venue ID to a global place ID, which represent every
    possible place in the model.
    """

    def __init__(self, pop):
        self.total_places = sum(
            [len(venues.venues) for venues in pop.venues_per_activity.values()]
        ) + len(pop.households)
        # Per place, the activity associated with it
        self.place_activities = np.zeros(self.total_places, dtype=np.uint32)
        self.id_offset_per_activity = dict()

        offset = 0
        for activity in synthpop_pb2.Activity.values():
            self.id_offset_per_activity[activity] = offset
            if activity == synthpop_pb2.Activity.HOME:
                num_venues = len(pop.households)
            else:
                # TODO This fails -- python and rust stringify the enum
                # differently. Just switch to ints.
                num_venues = len(pop.venues_per_activity[activity].venues)

            start = offset
            offset = offset + num_venues
            self.place_activities[start:offset] = activity
        assert offset == self.total_places, f"{offset} vs {self.total_places}"

    def to_place(self, activity, venue):
        return self.id_offset_per_activity[activity] + venue


def convert_to_npz(pop, output_path):
    id_mapping = IDMapping(pop)
    num_people = len(pop.people)
    num_places = id_mapping.total_places

    people_place_ids, people_baseline_flows = get_baseline_flows(pop, id_mapping)

    np.savez(
        output_path,
        nplaces=num_places,
        npeople=num_people,
        nslots=SLOTS,
        time=0,
        # TODO Do we need to plumb this along, or can we just calculate it?
        # not_home_probs=np.array([p.pr_not_home for p in pop.people]),
        # TODO Plumb along
        lockdown_per_day=np.zeros(100, dtype=np.float32),
        place_activities=id_mapping.place_activities,
        # place_coords=get_place_coordinates(pop, id_mapping),
        place_hazards=np.zeros(num_places, dtype=np.uint32),
        place_counts=np.zeros(num_places, dtype=np.uint32),
        people_ages=np.array([p.age_years for p in pop.people]),
        # TODO Invert the order in the proto! obese3=4, normal=0
        people_obesity=np.array(
            [p.health.obesity for p in pop.people], dtype=np.uint16
        ),
        people_cvd=np.array(
            [p.health.cardiovascular_disease for p in pop.people], dtype=np.uint16
        ),
        people_diabetes=np.array(
            [p.health.diabetes for p in pop.people], dtype=np.uint8
        ),
        people_blood_pressure=np.array(
            [p.health.blood_pressure for p in pop.people], dtype=np.uint8
        ),
        people_statuses=np.zeros(num_people, dtype=np.uint32),
        people_transition_times=np.zeros(num_people, dtype=np.uint32),
        people_place_ids=people_place_ids,
        people_baseline_flows=people_baseline_flows,
        people_flows=people_baseline_flows,
        people_hazards=np.zeros(num_people, dtype=np.uint32),
        people_prngs=np.random.randint(
            np.uint32((1 << 32) - 1), size=num_people * 4, dtype=np.uint32
        ),
        area_codes=np.array([pop.households[p.household].msoa for p in pop.people]),
        params=Params().asarray(),
    )
    print(f"Wrote {output_path}")


def get_baseline_flows(pop, id_mapping):
    # We ultimately want a 1D array for flows and place IDs. It's a flattened list, with
    # places_to_keep_per_person entries per person.
    places_to_keep_per_person = SLOTS

    sentinel_value = (1 << 31) - 1
    people_place_ids = np.full(
        len(pop.people) * places_to_keep_per_person, sentinel_value, dtype=np.uint32
    )
    people_baseline_flows = np.zeros(len(pop.people) * places_to_keep_per_person)

    for person in pop.people:
        idx = person.id * places_to_keep_per_person
        # Per person, flatten all the flows, regardless of activity
        for (activity, venue, weight) in get_baseline_flows_per_person(
            person, places_to_keep_per_person
        ):
            people_place_ids[idx] = id_mapping.to_place(activity, venue)
            people_baseline_flows[idx] = weight
            idx += 1

    return (people_place_ids, people_baseline_flows)


def get_baseline_flows_per_person(person, places_to_keep_per_person):
    result = []
    for flows in person.flows_per_activity:
        for flow in flows.flows:
            # Weight the per-activity flow by duration
            weight = flows.activity_duration * flow.weight
            result.append((flows.activity, flow.venue_id, weight))

    # Sort by flows, descending
    result.sort(reverse=True, key=lambda pair: pair[2])
    # Only keep the top few
    del result[places_to_keep_per_person:]
    return result


"""
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
            // TODO To match Python, we should filter venues belonging to our input MSOAs earlier.
            // This is a slower way to get equivalent results.
            if input
                .info_per_msoa
                .values()
                .any(|info| info.shape.contains(&venue.location))
            {
                let place = id_mapping.to_place(activity, venue.id);
                result[place.0 as usize * 2 + 0] = venue.location.lat();
                result[place.0 as usize * 2 + 1] = venue.location.lng();
            }
        }
    }

    // For homes, we just pick a random building in the MSOA area. This is just used for
    // visualization, so lack of buildings mapped in some areas isn't critical.
    for household in &input.households {
        let place = id_mapping.to_place(Activity::Home, household.id);
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
"""


LocationHazardMultipliers = namedtuple(
    "LocationHazardMultipliers",
    ["retail", "nightclubs", "primary_school", "secondary_school", "home", "work"],
)

IndividualHazardMultipliers = namedtuple(
    "IndividualHazardMultipliers", ["presymptomatic", "asymptomatic", "symptomatic"]
)


class Params:
    def __init__(
        self,
        location_hazard_multipliers=LocationHazardMultipliers(
            retail=0.0165,
            nightclubs=0.0165,
            primary_school=0.0165,
            secondary_school=0.0165,
            home=0.0165,
            work=0.0,
        ),
        individual_hazard_multipliers=IndividualHazardMultipliers(
            presymptomatic=1.0, asymptomatic=0.75, symptomatic=1.0
        ),
        obesity_multipliers=[1, 1, 1, 1],
        cvd_multiplier=1,
        diabetes_multiplier=1,
        bloodpressure_multiplier=1,
        overweight_sympt_mplier=1.46,
    ):
        if obesity_multipliers is None:
            obesity_multipliers = [1, 1, 1, 1]
        self.symptomatic_multiplier = 0.5
        self.exposed_scale = 2.82
        self.exposed_shape = 3.99
        self.presymptomatic_scale = 2.45
        self.presymptomatic_shape = 7.79
        self.infection_log_scale = 0.35
        self.infection_mode = 7.0
        self.lockdown_multiplier = 1.0
        self.place_hazard_multipliers = np.array(
            [
                location_hazard_multipliers.retail,
                location_hazard_multipliers.nightclubs,
                location_hazard_multipliers.primary_school,
                location_hazard_multipliers.secondary_school,
                location_hazard_multipliers.home,
                location_hazard_multipliers.work,
            ],
            dtype=np.float32,
        )

        self.individual_hazard_multipliers = np.array(
            [
                individual_hazard_multipliers.presymptomatic,
                individual_hazard_multipliers.asymptomatic,
                individual_hazard_multipliers.symptomatic,
            ],
            dtype=np.float32,
        )

        self.mortality_probs = np.array(
            [
                0.00,
                0.0001,
                0.0001,
                0.0002,
                0.0003,
                0.0004,
                0.0006,
                0.0010,
                0.0016,
                0.0024,
                0.0038,
                0.0060,
                0.0094,
                0.0147,
                0.0231,
                0.0361,
                0.0566,
                0.0886,
                0.1737,
            ],
            dtype=np.float32,
        )
        self.obesity_multipliers = np.array(obesity_multipliers, dtype=np.float32)
        self.symptomatic_probs = np.array(
            [0.21, 0.21, 0.45, 0.45, 0.45, 0.45, 0.45, 0.69, 0.69], dtype=np.float32
        )
        self.cvd_multiplier = cvd_multiplier
        self.diabetes_multiplier = diabetes_multiplier
        self.bloodpressure_multiplier = bloodpressure_multiplier
        self.overweight_sympt_mplier = overweight_sympt_mplier

    def asarray(self):
        """Pack the parameters into a flat array for uploading."""
        return np.concatenate(
            [
                np.array(
                    [
                        self.symptomatic_multiplier,
                        self.exposed_scale,
                        self.exposed_shape,
                        self.presymptomatic_scale,
                        self.presymptomatic_shape,
                        self.infection_log_scale,
                        self.infection_mode,
                        self.lockdown_multiplier,
                    ],
                    dtype=np.float32,
                ),
                self.place_hazard_multipliers,
                self.individual_hazard_multipliers,
                self.mortality_probs,
                self.obesity_multipliers,
                self.symptomatic_probs,
                np.array(
                    [
                        self.cvd_multiplier,
                        self.diabetes_multiplier,
                        self.bloodpressure_multiplier,
                        self.overweight_sympt_mplier,
                    ],
                    dtype=np.float32,
                ),
            ]
        )


if __name__ == "__main__":
    main()
