# A guide to data science in Rust

I'm thinking of writing up common problems/solutions that come up in data science piplines. Just notes so far.

Ideally this'll be multi-language; the same principles often apply everywhere

## Determinism

hashmaps, RNG seeds, pinning to software versions, pinning to data versions like OSM extracts

## Floating points

- sorting, rounding, serializing

## Good error messages

- Rust specific: No such file or directory, use fs-err

## ID wrapper types

## File management

- managing paths, organizing in the code
- manifests
- syncing somewhere
	- how to manage with a large team

## Offline import vs online run

## Idempotent data prep

- downloading
- extracting

## Logging

Multi-level progress bars? Flamecharts? Notes and debug output?

## Measuring memory usage

## Tools for data exploration

xsv
tad
jq
