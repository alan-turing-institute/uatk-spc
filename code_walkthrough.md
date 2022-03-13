# Code walkthrough

The project is split into two stages:

1. Initialisation: combine various data sources to produce a snapshot capturing
   some study area. This is implemented in [Rust](https://www.rust-lang.org/),
   and most code is in the `src/` directory.
2. Simulation: Run a COVID transmission model in that study area. This is
   implemented in Python and OpenCL, with a dashboard using OpenGL and ImGui.
   Most code is in the `ramp/` directory.

There's a preliminary attempt to port the simulation logic from Python and
OpenCL to Rust in `src/model/`, but there's no intention to continue its
development.
