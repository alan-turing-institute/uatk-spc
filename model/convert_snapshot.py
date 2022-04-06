#!/usr/bin/env python3

import click
import numpy as np
import synthpop_pb2


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

    id_mapping = IDMapping(pop)

    print(len(pop.people))
    np.savez(output_path, npeople=len(pop.people))

    print("Got it")


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
        for (activity_name, activity_num) in synthpop_pb2.Activity.items():
            self.id_offset_per_activity[activity_name] = offset
            if activity_num == synthpop_pb2.Activity.HOME:
                num_venues = len(pop.households)
            else:
                # TODO This fails -- python and rust stringify the enum
                # differently. Just switch to ints.
                num_venues = len(pop.venues_per_activity[activity_name].venues)

            start = offset
            offset = offset + num_venues
            self.place_activities[start:offset] = activity_num
        assert offset == self.total_places, f"{offset} vs {self.total_places}"

    def to_place(self, activity, venue):
        self.id_offset_per_activity[activity] + venue


if __name__ == "__main__":
    main()
