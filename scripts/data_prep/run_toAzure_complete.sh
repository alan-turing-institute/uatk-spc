#!/bin/bash

set -e

# Get data paths from positional args
STEP1_PATH=$1
SPENSER_ENRICHED_OUTPUT_PATH=$2
SPENSER_ENRICHED_TO_AZURE_PATH=$3


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