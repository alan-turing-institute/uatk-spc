# Usage guide

## One-time installation

- The latest version of Rust (1.60):
  [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- The instructions assume you'e running in a shell on Linux or Mac, and have
  standard commands like `unzip` and `python3` available

```shell
git clone https://github.com/dabreegster/spc/
cd spc
# This will take a few minutes the first time you do it, to build external dependencies
cargo build --release
```

### Proj dependencies

The Rust code depends on [proj](https://proj.org) to transform coordinates. You
may need to install additional dependencies to build it. Please [open an
issue](https://github.com/dabreegster/rampfs/issues) if you have any trouble!

On Ubuntu, you can do:

```shell
apt-get install cmake sqlite3 libclang-dev
```

On Mac, you can do:

```shell
brew install pkg-config cmake proj
```

### Python dependencies

Although SPC is written in Rust, one step of the pipeline needs to run
`fix_quant_data.py`, a small Python script. This requires `numpy`. `python3
fix_quant_data.py` will be called, and the `python3` in your path must have
`numpy` installed. In Ubuntu, `apt-get install python3-numpy` works. You can
also `pip install numpy`. It's not ideal to rely on system-wide dependencies
like this. We're working to remove this step entirely and avoid needing Python.

## Generating output for a study area

```
cargo run --release -- config/west_yorkshire_small.csv
```

This will download some large files the first time. You'll wind up with
`data/output/west_yorkshire_small.pb` as output, as well as lots of
intermediate files in `data/raw_data/`. The next time you run this command
(even on a different study area), it should go much faster.

## Working with protocol buffers

These instructions will be reorganized. For now, just for reference:

```shell
pip install protobuf

# Regenerate the Python bindings
protoc --python_out=protobuf_samples/ synthpop.proto

# Transform a proto to JSON
python protobuf_samples/protobuf_to_json.py data/output/west_yorkshire_small.pb
```

## Adding a new study area

A study area requires a list of MSOAs to include. Create a new file
`config/your_region.csv` with this list, following the format of the other
files in there. (The first line must set the column name as `"MSOA11CD"`.)

You can use the `scripts/select_msoas.py` script to generate this list based on
an ONS geography code. The script looks for every MSOA where the `CTY20NM` is
Bristol.  Refer to `data/raw_data/referencedata/lookUp.csv` for all
geographies.

After you write a new file, you simply run the pipeline with that as input:

```
cargo run --release -- config/your_region.csv
```

## Docker

If you're having trouble building, you can run in Docker. Assuming you have Docker setup:

```shell
git clone https://github.com/dabreegster/spc/
cd spc
# Build the Docker image initially. Once we publish to Docker Hub, this step
# won't be necessary.
docker build -t spc .
# Run SPC in Docker
docker run --mount type=bind,source="$(pwd)"/data,target=/spc/data -t spc /spc/target/release/spc config/west_yorkshire_small.csv
```

This will make the `data` directory in your directory available to the Docker
image, where it'll download the large input files and produce the final output.
