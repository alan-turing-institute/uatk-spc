# Usage guide

Note these instructions currently fail for Mac M1 due to a mix of OpenCL,
pandas, and OpenGL issues. We're working on it, and will update this page once
resolved.

## One-time installation

- The latest version of Rust (1.58):
  [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- [Poetry](https://python-poetry.org), for running a fork of the Python model
  - If you have trouble installing Python dependencies -- especially on Mac M1
    -- you can instead use
    [conda](https://docs.conda.io/projects/conda/en/latest/index.html)
- The instructions assume you'e running in a shell on Linux or Mac, and have
  standard commands like `unzip` and `python3` available

```shell
git clone https://github.com/dabreegster/rampfs/
cd rampfs
# You only have to run this the first time, to install Python dependencies
cd model
poetry install
# This will take a few minutes the first time you do it, to build external dependencies
cd ../init
cargo build --release
```

### Troubleshooting

The Rust code depends on [proj](https://proj.org) to transform coordinates. You
may need to install additional dependencies to build it, like `cmake`. Please
[open an issue](https://github.com/dabreegster/rampfs/issues) if you have any
trouble!

On Mac, you can do:

```shell
brew install pkg-config cmake proj
```

## Generating a snapshot for a study area

```
cd init
cargo run --release -- init west-yorkshire-small
```

This will download some large files the first time. You'll wind up with
`processed_data/WestYorkshireSmall/` as output, as well as lots of intermediate
files in `raw_data/`. The next time you run this command (even on a different
study area), it should go much faster.

You can run the pipeline for other study areas; try
`cargo run --release -- init --help` for a list.

## Running the simulation

Then to run the snapshot file in the Python model:

```shell
cd ../model
poetry run python gui.py -p ../config/WestYorkshireSmall.yml
```

This should launch an interactive dashboard. Or you can run the simulation in
"headless" mode and instead write summary output data:

```shell
poetry run python headless.py -p ../config/WestYorkshireSmall.yml
```

## Conda alternative

If `poetry` doesn't work, we also have a Conda environment. You can use it like
this:

```shell
conda env create -f environment.yml
conda activate aspics
python3.7 gui.py -p ../config/WestYorkshireSmall.yml
```

Note inside the Conda environment, just `python` may not work; specify
`python3.7`.

If you get
`CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.`
and the provided instructions don't help, on Linux you can try doing
`source ~/anaconda3/etc/profile.d/conda.sh`.
