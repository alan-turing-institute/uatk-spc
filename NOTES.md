# Notes

## Purpose

- a learning exercise for me; rewriting something forces me to understand it
- rapidly prototype different ideas for scaling the model in a dev env I'm more familiar with
- identify common SWE practices that may be to useful to share

## Dataframes vs types

```
msoas_list_file = pd.read_csv(list_of_msoas)
msoas_list = msoas_list_file[ColumnNames.MSOAsID]
```

vs

```
initial_cases_per_msoa: HashMap<MSOA, usize>,
```

### Repeatedly transforming a dataframe vs explicitly making a pass over it and doing some transformation

population_initialisation.py the main example

Don't want to keep around a bunch of old columns:
- perf
- some of them we use/transform/validate and then get rid of (the hid, pid index)
- data from the outside world is messy. deal with that once, then work in your cleaned up representation
- keep around original IDs to debug if needed

### CSV files

tus_hse_west-yorkshire.csv

What do all the column names mean? Explicit format allows for documentation

https://github.com/BurntSushi/xsv useful

### IDs matching up

add_individual_flows doc is perfect example -- I need two coffees to understand this. Why not just reason about (VenueID, probability) tuples? Forcing everything into a 2D array with zeroed out values and indices having to match up is easy to get wrong.

## Comparisons

- LoC
- build env setup, portability
- what kind of mistakes are impossible to make? (msoa IDs)

- I'm not used to reasoning with dataframes; how comfortable are people working on the current codebase?

## Individual files vs consolidated

- have to maintain paths
- forced to load everything, even if not needed

## Direct code vs refactoring

How many places do I need to look to actually figure out the URL that it downloads?

vs

How many places in the code do I need to update when something changes? (If it's one file, is search/replace painful?)

```
RawDataHandler.download_data(remote_folder="referencedata", # name of the folder online in Azure
			 local_folder=Constants.Paths.REFERENCE_DATA.FULL_PATH_FOLDER,
			 file=Constants.Paths.LUT.FILE)
```

## serde

tus_hse_west-yorkshire.csv is 800MB, we should consider binary formats

What tooling do people use to explore gigantic CSV files now? Make sure the worlflow is compatible with any other format

## Treating everything as a table

What if the same hid has different lat/lng? Lots of paranoia checks everywhere, or just make it impossible to represent this situation in the first place

## Code smells

- why is getProbablePrimarySchoolsByMSOAIZ, getProbableSecondarySchoolsByMSOAIZ, etc copied?! makes the code look scarier than it is
	- and why the unused variables there? (having the compiler complain is useful here)

## Cookbook / tricks

multi language, potentially

- determinism (hashmaps, RNG seeds, pinning to software versions, pinning to data versions like OSM extracts)
- f64 headaches: sorting, rounding, serializing
- No such file or directory (bad errors by default)
