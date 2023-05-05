#!/bin/bash

# Run this script from the repo root with e.g.:
#
#   ./scripts/check_determinism.sh rutland
#
# passing the region to be checked as the first positional arg.
#
# If files differ, the protobuf are converted to sorted JSON to get diff.

# Exit upon error
set -e

# Use given region
REGION=$1

# Run 1
cargo run --release -- config/England/$REGION.txt --rng-seed 0
cp data/output/England/2020/$REGION.pb test1.pb

# Run 2
cargo run --release -- config/England/$REGION.txt --rng-seed 0
cp data/output/England/2020/$REGION.pb test2.pb

# Get checksums
hash1=`shasum -a 256 test1.pb | cut -f 1 -d " "`
hash2=`shasum -a 256 test2.pb | cut -f 1 -d " "`

printf "SHA256 hash, run 1: ${hash1}\n"
printf "SHA256 hash, run 2: ${hash2}\n"

# Compare checksums
if [ $hash1 == $hash2 ]; then
    printf "OK\n"

    # Remove temporary outputs
    rm test1.pb test2.pb
else
    # Do not exit within this block upon error
    set +e
    printf "Error: protobuf outputs differ.\n"

    # Convert to JSON and sort for diff
    python python/protobuf_to_json.py test1.pb | jq --sort-keys . > "output_${REGION}_1.json"
    python python/protobuf_to_json.py test2.pb | jq --sort-keys . > "output_${REGION}_2.json"

    # Remove temporary outputs
    rm test1.pb test2.pb

    # Get diff with 4 lines of unified context
    diff -U 4 "output_${REGION}_1.json" "output_${REGION}_2.json" > "diff_${REGION}.txt"

    printf "\nWrote JSON and diff outputs:\n"
    printf "  output_${REGION}_1.json\n"
    printf "  output_${REGION}_2.json\n"
    printf "  diff_${REGION}.txt\n"
fi