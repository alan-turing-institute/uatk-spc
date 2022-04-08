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
cargo run --release -- west-yorkshire-small
```

This will download some large files the first time. You'll wind up with
`processed_data/WestYorkshireSmall/` as output, as well as lots of intermediate
files in `raw_data/`. The next time you run this command (even on a different
study area), it should go much faster.

You can run the pipeline for other study areas; try
`cargo run --release -- --help` for a list.

## Working with protocol buffers

These instructions will be reorganized. For now, just for reference:

```shell
pip install protobuf

# Regenerate the Python bindings
protoc --python_out=protobuf_samples/ synthpop.proto

# Transform a proto to JSON
python protobuf_samples/protobuf_to_json.py data/processed_data/WestYorkshireSmall/synthpop.pb
```
