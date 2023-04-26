#!/bin/bash

cargo run --release -- config/England/rutland.txt --rng-seed 0
cp data/output/England/2020/rutland.pb test1.pb
cargo run --release -- config/England/rutland.txt --rng-seed 0
cp data/output/England/2020/rutland.pb test2.pb
diff test1.pb test2.pb

python python/protobuf_to_json.py test1.pb > test1.json
python python/protobuf_to_json.py test2.pb > test2.json

diff <(jq --sort-keys . test1.json) <(jq --sort-keys . test2.json)
