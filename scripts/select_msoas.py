# This script helps you define new study areas.
#
# You must run this in a Python environment with
# https://pypi.org/project/click/ installed.

import csv
import click
import os
import urllib.request


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
    filename = f"config/{region_name}.txt"
    nonempty = False
    
    with open(filename, "w") as output:
        url = 'https://ramp0storage.blob.core.windows.net/referencedata/lookUp.csv'
        response = urllib.request.urlopen(url)
        lines = [l.decode('utf-8') for l in response.readlines()]
        cr = csv.DictReader(lines)
        for row in cr:
            if row["LAD20NM"] == lad:
                output.write('"{}"\n'.format(row["MSOA11CD"]))
                nonempty = True
    if nonempty:
        print(f"Wrote {filename}")
    else:
        os.remove(filename)
        print(
            f"No matches for LAD20NM = {lad} in the lookUp.csv table, try the inital letter in upper case"
        )
if __name__ == "__main__":
    area()
            
"""     with open(filename, "w") as output: 
        with open("data/raw_data/referencedata/lookUp.csv") as lookup:
            for row in csv.DictReader(lookup):
                if row["LAD20NM"] == lad:
                    output.write('"{}"\n'.format(row["MSOA11CD"]))
                    nonempty = True """

