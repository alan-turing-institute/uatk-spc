# You may need to 'pip install' some extra dependencies, or run in a
# conda/poetry environment.

import click
import pandas as pd
import synthpop_pb2


@click.command()
@click.option("--input_path", required=True, help="path to an SPC .pb file")
def convert_to_csv(input_path):
    """Export some per-person attributes to CSV."""

    # Parse the .pb file
    print(f"Reading {input_path}")
    pop = synthpop_pb2.Population()
    f = open(input_path, "rb")
    pop.ParseFromString(f.read())
    f.close()

    # Based on the per-person information you're interested in, you can extract
    # and fill out different columns
    people = []
    for person in pop.people:
        # The Person message doesn't directly store MSOA. Look up from their household.
        msoa11cd = pop.households[person.household].msoa11cd

        record = {
            "person_id": person.id,
            "household_id": person.household,
            "msoa11cd": msoa11cd,
            "age_years": person.demographics.age_years,
            # Protobuf enum types show up as numbers; this converts to a string
            "pwkstat": synthpop_pb2.PwkStat.Name(person.employment.pwkstat),
            "diabetes": person.health.has_diabetes,
        }

        # Add a column for the duration the person spends doing each activity
        for pair in person.activity_durations:
            key = synthpop_pb2.Activity.Name(pair.activity) + "_duration"
            record[key] = pair.duration

        people.append(record)

    df = pd.DataFrame.from_records(people)
    print(df)
    df.to_csv("people.csv")
    print("Wrote people.csv")


if __name__ == "__main__":
    df = convert_to_csv()
