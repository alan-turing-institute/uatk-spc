#!/bin/bash

set -e

# Get data paths from positional args
STEP1_PATH=$1
SPENSER_INPUT_PATH=$2
SPENSER_ENRICHED_OUTPUT_PATH=$3

# Exit if any paths missing
if [ "$STEP1_PATH" == "" ]; then
    echo "Missing path for step 1 data."
    exit 1
fi
if [ "$SPENSER_INPUT_PATH" == "" ]; then
    echo "Missing path for SPENSER pipeline input data."
    exit 1
fi
if [ "$SPENSER_ENRICHED_OUTPUT_PATH" == "" ]; then
    echo "Missing path for enriched SPENSER output data."
    exit 1
fi

# Read list of all LADs for GB
while read lad_cd lad_nm; do 
   lad_cds+=($lad_cd)
   lad_nms+=($lad_nm)
done < <(tail -n +2 "2020_lad_list.csv" | sed 's/,/\t/g')

# List of years to run
years=(
    2012
    2020
    2022
    2032
    2039
)
for lad_cd in "${lad_cds[@]}"; do
    for year in "${years[@]}"; do
        pueue add Rscript SPC_single_region.R \
            $lad_cd \
            $year \
            $STEP1_PATH \
            $SPENSER_INPUT_PATH \ 
            $SPENSER_ENRICHED_OUTPUT_PATH
    done
done
