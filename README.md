# ASPICS – RAMP-UA/EcoTwins + Rust


<a href="url"><img src="/ASPICS_Logo_V2.png" align="left" width="130" ></a> 

This is an implementation of a [microsimulation model for epidimics](https://www.sciencedirect.com/science/article/pii/S0277953621007930) called ASPICS (Agent-based Simulation of ePIdemics at Country Scale).

The project is split into two stages:

1.  Initialisation: combine various data sources to produce a snapshot capturing
    some study area. This is implemented in [Rust](https://www.rust-lang.org/),
    and most code is in the `src/` directory.
2.  Simulation: Run a COVID transmission model in that study area. This is
    implemented in Python and OpenCL, with a dashboard using OpenGL and ImGui.
    Most code is in the `ramp/` directory.

## Status

- [x] initialisation produces a snapshot for different study areas
- [x] basic simulation with the snapshot
- [ ] commuting (partially ported from Python)
- [ ] events (partly started)
- [ ] calibration / validation

There's a preliminary attempt to port the simulation logic from Python and
OpenCL to Rust in `src/model/`, but there's no intention to continue its
development.

## Running the code

One-time installation of things you may be missing:

- The latest version of Rust (1.58): <https://www.rust-lang.org/tools/install>
- [Poetry](https://python-poetry.org), for running a fork of the Python model
- The instructions assume you'e running in a shell on Linux or Mac, and have
  standard commands like `unzip` and `python3` available

You can then compile this project and generate a snapshot for a small study
area:

```shell
git clone https://github.com/dabreegster/rampfs/
cd rampfs
# This will take a few minutes the first time you do it, to build external dependencies
cargo run --release -- init west-yorkshire-small
```

This will download some large files the first time. You'll wind up with
`processed_data/WestYorkshireSmall/` as output, as well as lots of intermediate
files in `raw_data/`. The next time you run this command (even on a different
study area), it should go much faster. You can run the pipeline for other study
areas; try `cargo run --release -- init --help` for a list.

Then to run the snapshot file in the Python model:

```shell
# You only have to run this the first time, to install Python dependencies
poetry install
poetry run python gui.py -p model_parameters/default.yml
```

This should launch an interactive dashboard. Or you can run the simulation in
"headless" mode and instead write summary output data:

```shell
poetry run python headless.py -p model_parameters/default.yml
```

### Troubleshooting

The Rust code depends on [proj](https://proj.org) to transform coordinates. You
may need to install additional dependencies to build it, like `cmake`. Please
[open an issue](https://github.com/dabreegster/rampfs/issues) if you have any
trouble!

## Developer tips

### Code hygiene

We use automated tools to format the code.

```shell
# Format all Python code
poetry run black ramp *.py
# Format all Rust code
cargo fmt
```

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

## Lineage

The history of this project is slightly convoluted:

1.  RAMP was originally written in R, then later converted to Python and OpenCL:
    <https://github.com/Urban-Analytics/RAMP-UA>
2.  The "ecosystem of digital twins" branch heavily refactored the code to
    support running in different study areas and added support for commuting:
    <https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting>
3.  This separate repository was created to port the initialisation logic to
    Rust, following the above branch
4.  The Python and OpenCL code for running the model (after initialisation) was
    copied into this repository from
    <https://github.com/dabreegster/RAMP-UA/commits/dcarlino_dev> and further
    cleaned up

There are many contributors to the project through these different stages; the
version control history can be seen on Github in the other repositories.
