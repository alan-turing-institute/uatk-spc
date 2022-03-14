# Agent-based Simulation of ePIdemics at Country Scale (ASPICS) v0.1

[![DOI](https://zenodo.org/badge/440815189.svg)](https://zenodo.org/badge/latestdoi/440815189)

<img src="docs/logo.png" align="left" width="130"/>


- [Usage guide](docs/usage_guide.md) - build and run the project
- [Developer guide](docs/developer_guide.md) - extend the project ([Code walkthrough](docs/code_walkthrough.md))


The Agent-based Simulation of ePIdemics at Country Scale (ASPICS) models the spread of an epidemic within any area of England. It is an extension to the national level of an earlier model called [DyME](https://www.sciencedirect.com/science/article/pii/S0277953621007930) (Dynamic Microsimulation for epidemics), with improvements to some elements of the modelling and much faster runtimes. It is currently pre-calibrated to run a simulation of the COVID-19 virus.

## Status

We aim for this repository to provide an easy-to-use code base for building
similar research, but this is still in progress. File an
[issue](https://github.com/dabreegster/rampfs/issues) if you're interested in
building off this work.

- [x] initialisation produces a snapshot for any study area
- [x] basic simulation with the snapshot
- [x] home-to-work commuting
- [ ] large-scale events
- [ ] calibration / validation

## Lineage

The history of this project is as follows:

1. DyME was originally written in R, then later converted to Python and OpenCL:
   [https://github.com/Urban-Analytics/RAMP-UA](https://github.com/Urban-Analytics/RAMP-UA)
2. The "ecosystem of digital twins" branch heavily refactored the code to
   support running in different study areas and added a new seeding and commuting modelling:
   [https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting](https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting)
3. This separate repository was created to port the initialisation logic to
   Rust, following the above branch. The Python and OpenCL code for running the model (after initialisation) was
   copied into this repository from
   [https://github.com/dabreegster/RAMP-UA/commits/dcarlino_dev](https://github.com/dabreegster/RAMP-UA/commits/dcarlino_dev)
   and further cleaned up

There are many contributors to the project through these different stages; the
version control history can be seen on Github in the other repositories.
