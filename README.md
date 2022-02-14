# RAMP, ported to Rust

This is a rewrite in [Rust](https://www.rust-lang.org/) of the RAMP (Rapid
Assistance in Modelling the Pandemic) model, based on the
[EcoTwins-withCommuting
branch](https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting).

## Status

The initialisation phase, which builds a snapshot per study area, works. You
can then run the Python + OpenCL model on the snapshot. Initialisation in Rust
is much faster than the Python version, but the snapshot is not identical to
the one produced by the Python version. Initial results seem equivalent, but
you absolutely need to validate this for whatever you're using RAMP for. (And
please report problems or discrepencies!)

The Python + OpenCL model is also partially ported, running as a simple
single-threaded process. It's unlikely development will continue here without a
clear motivation.

## Running the code

One-time installation of things you may be missing:

- The latest version of Rust (1.58): <https://www.rust-lang.org/tools/install>
- [Poetry](https://python-poetry.org), for running a fork of the Python model

You can then compile this project and generate a snapshot for a small study area:

```shell
git clone https://github.com/dabreegster/rampfs/
cd rampfs
# This will take a few minutes the first time you do it, to build external dependencies
cargo run --release -- init west-yorkshire-small
```

This will download some large files the first time. You'll wind up with
`processed_data/WestYorkshireSmall/` as output, as well as lots of intermediate
files in `raw_data/`. The next time you run this command (even on a different
study area), it should go much faster.

Then to run the snapshot file in the Python model:

```shell
# You shouldn't clone RAMP-UA inside the rampfs directory, just go somewhere else
cd ..
git clone https://github.com/dabreegster/RAMP-UA/
cd RAMP-UA
git checkout dcarlino_dev
poetry install
# Move the output from the Rust pipeline to the RAMP-UA directory
mv ../rampfs/processed_data/WestYorkshireSmall/ data/processed_data/Test_3/
poetry run python main_model.py -p model_parameters/default.yml
```

You can run the pipeline for other study areas; try `cargo run --release --
init --help` for a list.

### Troubleshooting

The Rust code depends on [proj](https://proj.org) to transform coordinates. You
may need to install additional dependencies to build it, like `cmake`. Please
[open an issue](https://github.com/dabreegster/rampfs/issues) if you have any
trouble!

### Some tips for working with Rust

There are two equivalent ways to rebuild and then run the code. First:

```shell
cargo run --release -- init devon
```

The `--` separates arguments to `cargo`, the Rust build tool, and arguments to
the program itself. The second way:

```shell
cargo build --release
./target/release/ramp init devon
```

You can build the code in two ways -- **debug** and **release**. There's a
simple tradeoff -- debug mode is fast to build, but slow to run. Release mode is
slow to build, but fast to run. For the RAMP codebase, since the input data is
so large and the codebase so small, I'd recommend always using `--release`. If
you want to use debug mode, just omit the flag.

If you're working on the Rust code outside of an IDE like
[VSCode](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust),
then you can check if the code compiles much faster by doing `cargo check`.
