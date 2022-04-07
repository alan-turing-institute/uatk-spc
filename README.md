# Synthetic Population Catalyst

- [Usage guide](docs/usage_guide.md) - build and run the project
- [Developer guide](docs/developer_guide.md)
- [Code walkthrough](docs/code_walkthrough.md)
- [Data sources](docs/data_sources.md)

The Synthetic Population Catalyst (SPC) makes it easier for researchers to work
with population data in England. It combines a variety of [data
sources](docs/data_sources.md) and outputs a single protocol buffer file
describing the population in a given study area.

## Lineage

The history of this project is as follows:

1. DyME was originally written in R, then later converted to Python and OpenCL:
   [https://github.com/Urban-Analytics/RAMP-UA](https://github.com/Urban-Analytics/RAMP-UA)
2. The "ecosystem of digital twins" branch heavily refactored the code to
   support running in different study areas and added a new seeding and commuting modelling:
   [https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting](https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting)
3. This separate repository was created to port the initialisation logic to
   Rust, following the above branch.

There are many contributors to the project through these different stages; the
version control history can be seen on Github in the other repositories.
