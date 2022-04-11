# This script helps you define new study areas. You can write the output to a
# new file, config/some_region.csv .

import csv

print('"MSOA11CD"')
# You must run the SPC pipeline to download this file
with open('data/raw_data/referencedata/lookUp.csv') as f:
    for row in csv.DictReader(f):
        # Modify these to select MSOAs based on different geographies
        if row['CTY20NM'] == 'Bristol':
            print('"{}"'.format(row['MSOA11CD']))
