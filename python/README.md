# SPC toolkit

A Python package providing a toolkit facilitating use of SPC output.

## Requirements
- [SPC installation](https://alan-turing-institute.github.io/uatk-spc/using_installation.html)
- [Python](https://www.python.org/)
- [Poetry](https://python-poetry.org/)

## Quickstart

- Run SPC on a region with `--flat-output`:
```
cargo run --release -- --rng-seed 0 --flat-output ../config/England/rutland.txt
```
- Install the SPC toolkit package `uatk-spc`:
```
poetry install
```
- Convert protobuf to JSON:
```
poetry run spc_to_json --input_path ../data/output/England/2020/rutland.pb
```
- Read outputs with `SPCReaderParquet`:
```python
# Import package
from uatk_spc.reader import SPCReaderParquet as SPC

# Pick a region with SPC output saved
(region, path) = "rutland", "../data/output/England/2020/"

# Read from parquet and JSON
spc = SPC(path, region, backend="polars")

# Print people
print(spc.people)

# Merge people and households
people_and_households = spc.merge_people_and_households()

# Output to csv
people_and_households.to_pandas().to_csv("people_and_households.csv", index=None)
```

## Further detail
Additional notebooks can be found in [examples](./examples/).
