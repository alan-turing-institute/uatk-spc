# SPC toolkit

A Python package providing a toolkit facilitating use of SPC output.

## Requirements
- [SPC installation](https://alan-turing-institute.github.io/uatk-spc/using_installation.html)
- [Python](https://www.python.org/)
- [Poetry (optional)](https://python-poetry.org/)

## Quickstart
### Generating outputs
From the repo root, run SPC on a region with `--output-formats` (e.g. Rutland is shown below with output to both `protobuf` and `parquet` formats):
```bash
cargo run --release -- config/England/rutland.txt --rng-seed 0 --output-formats protobuf,parquet
```

### Install
The package can be installed with `pip` from git with:
```bash
pip install 'git+https://github.com/alan-turing-institute/uatk-spc.git#subdirectory=python'
```
or with Poetry:
```bash
poetry add 'git+https://github.com/alan-turing-institute/uatk-spc.git#subdirectory=python'
```

#### Extras
To include extra dependencies `dev` and `examples` for running [tests](./tests/) and [examples](./examples/):
```
pip install 'uatk-spc[dev,examples] @ git+https://github.com/alan-turing-institute/uatk-spc.git#subdirectory=python'
```
or with Poetry:
```bash
poetry add 'git+https://github.com/alan-turing-institute/uatk-spc.git#subdirectory=python'
```

### Install (developer)
From `python/`, install the SPC toolkit package `uatk-spc` with `dev` and `examples` extras:
```
poetry install --extras "dev examples"
```

## Examples
### Convert protobuf to JSON
If installed with Poetry, convert a protobuf to JSON:
```
poetry run spc_to_json --input-path ../data/output/England/2020/rutland.pb
```

### Reader: load synthetic population into Python
Read outputs with `Reader` class providing population fields as individual dataframes:
```python
# Import package
from uatk_spc import Reader

# Pick a region with SPC output saved
(region, path) = "rutland", "../../data/output/England/2020/"

# Read from parquet and JSON
population = Reader(path, region, backend="polars")

# Or directly from a filepath
population = Reader(
    filepath="https://ramp0storage.blob.core.windows.net/test-spc-output/test_region.tar.gz",
    backend="polars"
)

# Print people
print(population.people.head())

# Print households
print(population.households.head())

# Output to csv
population.people.to_pandas().to_csv("people.csv", index=None)
```

### Builder: combine people, households and time use diaries
Build single dataframe combining people, households and time use diaries with `Builder` class:
```python
from uatk_spc.builder import Builder

# Pick a region with SPC output saved
(region, path) = ("rutland", "../../data/output/England/2020")

# Combine people and households
people_and_households: pd.DataFrame = (
    Builder(path, region, backend="pandas", input_type="protobuf")
    .add_households()
    .unnest(["health", "details"])
    .build()
)

# Features to include in final dataframe
features = {
    "health": ["bmi"],
    "demographics": ["age_years", "sex", "nssec8"],
    "employment": ["pwkstat", "salary_yearly"],
}
# Combine people and time use diaries
people_and_time_use_diaries: pd.DataFrame = (
    Builder(path, region, backend="pandas", input_type="protobuf")
    .add_households()
    .add_time_use_diaries(features, diary_type="weekday_diaries")
    .build()
)
```

### Further examples
Additional notebooks can be found in [examples](./examples/).
