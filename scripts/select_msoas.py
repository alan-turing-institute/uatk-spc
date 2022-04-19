# This script helps you define new study areas.
#
# You must run this in a Python environment with
# https://pypi.org/project/click/ installed.

import csv
import click
import os


@click.command()
@click.option(
    "--lad",
    default="Liverpool",
    prompt="Name of Local Authority District",
    help="Enter the name of the Local Authority District of your preference, to get the MSOA codes for that area",
)
def area(lad):
    # By convention, use snake case (west_yorkshire_small)
    region_name = lad.lower().replace(" ", "_")
    filename = f"config/{region_name}.csv"
    nonempty = False

    with open(filename, "w") as output:
        output.write('"MSOA11CD"\n')
        # You must run the SPC pipeline to download this file
        with open("data/raw_data/referencedata/lookUp.csv") as lookup:
            for row in csv.DictReader(lookup):
                if row["LAD20NM"] == lad:
                    output.write('"{}"\n'.format(row["MSOA11CD"]))
                    nonempty = True

    if nonempty:
        print(f"Wrote {filename}")
    else:
        os.remove(filename)
        print(
            f"No matches for LAD20NM = {lad} in data/raw_data/referencedata/lookUp.csv"
        )


if __name__ == "__main__":
    area()
