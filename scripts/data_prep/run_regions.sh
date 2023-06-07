#!/bin/bash

set -e

# Get data paths from positional args
OTHER_DATA=$1
SPENSER_INPUT=$2
OUTPUT=$3

# TODO: add list of remaining incomplete regions
regions=(
    "E06000058"
)

# TODO: add full list of years to run
years=(
    2012
)
for region in "${regions[@]}"; do
    for year in "${years[@]}"; do
        pueue add Rscript SPC_single_region.R $region $year $OTHER_DATA $SPENSER_INPUT $OUTPUT
    done
done
