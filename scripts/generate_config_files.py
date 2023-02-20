from collections import defaultdict
import csv
import os

msoas_per_country_and_area = defaultdict(lambda: defaultdict(list))

with open("data/raw_data/referencedata/lookUp-GB.csv") as lookup:
    for row in csv.DictReader(lookup):
        msoas_per_country_and_area[row["Country"]][row["AzureRef"]].append(
            row["MSOA11CD"]
        )

for country, msoas_per_area in msoas_per_country_and_area.items():
    try:
        os.mkdir("config/" + country)
    except:
        pass

    for area, msoas in msoas_per_area.items():
        with open(f"config/{country}/{area}.txt", "w") as output:
            for msoa in msoas:
                output.write(f'"{msoa}"\n')
