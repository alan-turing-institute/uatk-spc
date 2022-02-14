#!/bin/bash

set -e
set -x

# cargo run --release -- init west-yorkshire-small --snapshot

rm -rf ~/RAMP-UA/data/processed_data/Test_3/
mkdir -p ~/RAMP-UA/data/processed_data/Test_3/snapshot/
cp processed_data/snapshot_WestYorkshireSmall.npz ~/RAMP-UA/data/processed_data/Test_3/snapshot/cache.npz

# TODO Temporary, until the Python code only reads the snapshot
touch ~/RAMP-UA/data/processed_data/Test_3/lockdown.csv
touch ~/RAMP-UA/data/processed_data/Test_3/activity_locations.csv

echo 'poetry run python main_model.py -p model_parameters/default.yml'
