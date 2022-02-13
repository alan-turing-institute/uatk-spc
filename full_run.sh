#!/bin/bash

set -e
set -x

# cargo run --release -- init west-yorkshire-small --snapshot

python fix_snapshot.py processed_data/snapshot_WestYorkshireSmall.npz

rm -rf ~/RAMP-UA/data/processed_data/Test_3/
mkdir -p ~/RAMP-UA/data/processed_data/Test_3/snapshot/
cp processed_data/snapshot_WestYorkshireSmall.npz ~/RAMP-UA/data/processed_data/Test_3/snapshot/cache.npz
cp -R processed_data/python_cache_WestYorkshireSmall/* ~/RAMP-UA/data/processed_data/Test_3/
touch ~/RAMP-UA/data/processed_data/Test_3/activity_locations.csv # nothing will try to read this
