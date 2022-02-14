#!/bin/bash

set -e
set -x

# cargo run --release -- init west-yorkshire-small

rm -rf ~/RAMP-UA/data/processed_data/Test_3/
cp -Rv processed_data/WestYorkshireSmall ~/RAMP-UA/data/processed_data/Test_3

echo 'poetry run python main_model.py -p model_parameters/default.yml'
