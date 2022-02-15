#!/bin/bash

set -e
set -x

#cargo run --release -- init west-yorkshire-small
mkdir -p python/data/processed_data/Test_3/
rm -rf python/data/processed_data/Test_3/
cp -Rv data/processed_data/WestYorkshireSmall python/data/processed_data/Test_3

cd python
poetry run python main_model.py -p model_parameters/default.yml
