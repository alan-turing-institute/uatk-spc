# Developer guide

## Code hygiene

We use automated tools to format the code.

```shell
# Format all Python code
cd model
poetry run black ramp *.py

# Format all Rust code
cd ../init
cargo fmt

# Format Markdown docs
cd ../docs
prettier --write *.md
```

Install [prettier](https://prettier.io) for Markdown.

## Some tips for working with Rust

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
