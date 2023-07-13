#!/bin/bash

set -e

# Get data paths from positional args
STEP1_PATH=$1
SPENSER_ENRICHED_OUTPUT_PATH=$2
SPENSER_ENRICHED_TO_AZURE_PATH=$3

# Exit if any paths missing
if [ "$STEP1_PATH" == "" ]; then
    echo "Missing path for step 1 data."
    exit 1
fi
if [ "$SPENSER_ENRICHED_OUTPUT_PATH" == "" ]; then
    echo "Missing path for enriched SPENSER data."
    exit 1
fi
if [ "$SPENSER_ENRICHED_TO_AZURE_PATH" == "" ]; then
    echo "Missing path for county-level data to upload to Azure."
    exit 1
fi

# List of years to run
years=(
    2012
    2020
    2022
    2032
    2039
)

for year in "${years[@]}"; do
    pueue add -- Rscript toAzure_complete.R \
        $year \
        $STEP1_PATH \
        $SPENSER_ENRICHED_OUTPUT_PATH \
        $SPENSER_ENRICHED_TO_AZURE_PATH