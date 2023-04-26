#!/bin/bash

# Use given region
REGION=$1

# Run 1
cargo run --release -- config/England/$REGION.txt --rng-seed 0
cp data/output/England/2020/$REGION.pb test1.pb

# Run 2
cargo run --release -- config/England/$REGION.txt --rng-seed 0
cp data/output/England/2020/$REGION.pb test2.pb

# Get checksums
checksum1=`shasum test1.pb | cut -f 1 -d " "`
checksum2=`shasum test2.pb | cut -f 1 -d " "`

# Compare checksums
if [ "$checksum1" == "$checksum2" ]; then
    printf "OK\n"
else
    printf "Error: protobuf outputs differ.\n"

    # Convert to JSON
    python python/protobuf_to_json.py test1.pb > test1.json
    python python/protobuf_to_json.py test2.pb > test2.json

    # Sort JSON and get diff
    diff <(jq --sort-keys . test1.json) <(jq --sort-keys . test2.json)
fi
