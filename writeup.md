# RAMP rewrite write-up

I ported most of the RAMP initialisation code from Python to Rust.

## Purpose

I had two goals starting out:

1.  Understand how the model works -- there's no better way than re-creating it!
2.  Identify useful software engineering practices that may be unfamiliar to the
    team

Going forward, what should we do with this rewrite?

1.  Switch over to it. See the last section arguing why.
2.  Nothing -- keep iterating on the Python version, but apply lessons from this
    code-base

## A code review of the Python model

These're my observations from reading the
[Ecotwins-withCommuting](https://github.com/Urban-Analytics/RAMP-UA/tree/Ecotwins-withCommuting)
branch.

An underlying theme: even in "research code," it's useful to work under the
assumption that somebody else will work with your code later and have to figure
everything out. This is already true for this team -- and even if you'e working
alone, you might return to old code a year later and have the same experience of
re-learning everything!

### Simple issues

There's lots of **acronyms** without any definitions. It's fine to use these
through the code, but we should define them in the README or somewhere obvious
in the code. I've figured out `tu` is "time-use", but I still have no idea what
`CTY20` or `sic1d07` are! And with the QUANT data, what's the difference between
`PiJ`, `SiJ`, `HiJ` in the filenames?

**Consistent terminology** is also helpful. It took me a while to realize that
all of these are the same: shop, venue, retail point, location.

I had to skip past lots of **commented code**, like
[here](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L241).
Some comments were very helpful, and others were just older versions of some
code, and it's hard to distinguish. If something's experimental, keep it in a
separate git branch.

There's lots of **copied code** in
[quant_api.py](https://github.com/Urban-Analytics/RAMP-UA/blob/Ecotwins-withCommuting/coding/initialise/quant_api.py).
These methods are all the same -- `getProbablePrimarySchoolsByMSOAIZ`,
`getProbableSecondarySchoolsByMSOAIZ`, `getProbableRetailByMSOAIZ`, and
`getProbableHospitalByMSOAIZ` (which is unused). Somebody refactored them to
take input files at some point, but then never took advantage of that!

The QUANT code also appears to do extra lookup work, but then throw away the
results -- see
[here](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/quant_api.py#L77).
I have no idea what this code is meant to do. I haven't benchmarked it yet, but
these extra lookups may be causing substantial slowdown. (I'll note that the
Rust compiler warns for unused variables, which is helpful for detecting things
like this.)

### Conda

The project uses [Conda](https://docs.conda.io/en/latest/) to manage
dependencies. There are two major problems with it.

**It's slow** -- on my fast Linux laptop, initially resolving the environment
took **3 hours**! On Mac, it took about 10 minutes. This was just running the
[SAT solver](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem), not
downloading packages. I have no idea why this difference exists, but it doesn't
matter -- both of these are completely unusable from a developer experience
perspective. If it takes more than a few seconds to decide what version of
packages to use in any language, something's very wrong.

**It's not reproducible** --
[environment.yml](https://github.com/Urban-Analytics/RAMP-UA/blob/Ecotwins-withCommuting/environment.yml)
specifies [semver](https://semver.org/) constraints on packages, but depending
when you build the conda environment, you'll get **different results**, because
there's a newer version of some package. I don't think this is acceptable from a
scientific reproducibility perspective -- we should be able to pick up a project
months later, build it, and get exactly the same results. This isn't just a
philosophical point -- I've spent hours trying unsuccessfully to get
[another conda project](https://github.com/psrc/soundcast/) to run, because the
code didn't actually work with newer versions of some packages, and none of the
developers were able to share exactly the versions of packages they were using.

Luckily, there's a simple solution here -- I strongly recommend we switch to
[Poetry](https://python-poetry.org) for all Python projects. It's much easier to
use, fast to set up, and uses
[lockfiles](https://python-poetry.org/docs/basic-usage/#commit-your-poetrylock-file-to-version-control).
Recording exactly which package versions we depend on means anybody can build
the same code.

I've started switching RAMP to Poetry
[here](https://github.com/dabreegster/RAMP-UA/tree/dcarlino_ecotwins_poetry).

### Dataframes vs types

The biggest problem seems to be forcing the use of numpy and pandas.

#### Not everything is a 2D matrix

Let's take
[add_individual_flows](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L1008)
as an example. There's a lengthy comment, a fair bit of paranoia checks, and
shuffling around indices to make things line up. Compare with the
[Rust version](https://github.com/dabreegster/rampfs/blob/a401e4f68a21421e0a228fad1721a261eaeb699f/src/make_population.rs#L243).
All we need to do is go through each person, figure out which MSOA they live in
(by first looking up their household), and copying the flows for that activity
to the person. The flows are expressed as the Rust type
`EnumMap<Activity, Vec<(VenueID, f64)>>`. Breaking this down a bit, we have some
flows per activity (work, home, nightclubs, etc). The flows are a list of pairs
-- venue IDs and some floating point number -- with the numbers summing to 1.

We don't need a matrix relating all venues and all MSOAs, with a bunch of cells
set to 0. We don't need to ensure the row of one dataframe lines up with the
column of another. We can just have a small list of venue IDs in any order.

#### Just use normal Python

In many cases, using regular Python lists and dictionaries would be way simpler
and faster. An example in
[quant_api.py](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/quant_api.py#L72):

```python
zonei = int(dfPrimaryPopulation.loc[dfPrimaryPopulation['msoaiz'] == msoa_iz,'zonei'])
```

This is difficult to read and slow. Logically, it's just mapping the MSOA ID to
some `zonei` ID. But working with dataframes forces us to filter, then coerce
the result into a scalar value. Even worse, these lookups happen with the lookup
for every MSOA. We could just iterate through the CSV file and build up a
dictionary once, then just transform MSOA to zonei with normal Python.

#### The code is trying to express a schema

A common criticism of languages with static types is that declaring a schema is
too verbose. Except... data really does have a schema behind it, and effort can
be spent explaining that schema in documentation, or with a type system that a
compiler helps enforce. A codebase like RAMP spends
[lots of code](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L976)
trying to make the dataframes match up with a schema.

#### The power of explicit schemas

Let's take a step back. What're the different "nouns" we want to simulate in
RAMP? We've got households, people, and venues, to start.

A household has:

- a list of people who live there
- a geographic location
- the MSOA it belongs to
- during simulation, some changing state, like disease status

A venue has a geographic location, and all of them are grouped by the activity
they host.

A person has:

- a household
- demographic metadata, like age
- for each activity, a probability distribution for how long they spend daily on
  it
- for each activity, "flows" -- a probability distribution for which venue
  they're likely to do that activity at

We can declare all of this up-front in a schema like
[this](https://github.com/dabreegster/rampfs/blob/a401e4f68a21421e0a228fad1721a261eaeb699f/src/population.rs#L10).

It took me quite a while to piece together this view from the Python code; I
would've been totally lost
[without this comment](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L111).
When everything's a dataframe where the number of rows in one table has to match
up with the columns of another, nothing's explicit. Lengthy docstrings are
necessary. There are so many opportunities to mix things up. In the Rust
implementation, we can deal with `MSOA`s and `CTY20`s -- not strings that're
easy to mix up. We have lots of numeric IDs around -- so let's reason in terms
of `PersonID`s, `HouseholdID`s, and `VenueID`s.

#### Get rid of the original columns as soon as possible

Data from the outside world is always messy. RAMP is already nicely split into
two steps, an initialisation per study area and actually running the simulation.
So let's use the first step to clean up and validate the input data, then take
advantage of stronger assumptions during the simulation.

For example, the time-use data uses `hid` (household ID) and `pid` (person ID)
to uniquely identify people and map them to a household. A tremendous amount of
code in
[population_initialisation.py](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L386)
is spent verifying no houses have too many people, every person has a house
assigned, there are no empty houses, assigning new IDs, etc.

#### Wait though

But playing the devil's advocate, maybe the problem is that I'm really not used
to reasoning in terms of dataframes and matching up indices. So for anybody
working on this codebase, what's your experience like?

### OpenStreetMap buildings

The pipeline extracts building centroids from a Geofabrik dump of OpenStreetMap
data, then uses these for people's homes. There's a major correctness problem
here -- in many parts of the UK, OpenStreetMap doesn't have any buildings mapped
at all. See
[Nunhead, London](https://www.openstreetmap.org/#map=15/51.4611/-0.0448) for an
example where the buildings just cut off. If a MSOA has few or no buildings
within it, this could really skew our results.

Some possible solutions:

- Use Ordnance Survey [data](https://data.gov.uk/dataset/os-buildings-data). I
  haven't checked the license or coverage yet, but it's probably better.
- Procedurally generate houses along empty residential streets. I've
  [done this before](https://github.com/cyipt/actdev/issues/53#issuecomment-774732839)
  for the ActDev project.

## Results

How does the Rust pipeline work so far for different study areas? All of these
timings were taken after all the raw data was downloaded and unpacked.

NOTE: I took these measurements at the current version of the code (see git),
which doesn't have every part of the initialisation ported yet -- commuting and
assigning specific homes isn't done yet.

| Study area             | Runtime  | Peak memory usage | Output file size | People      | Households | MSOAs |
| ---------------------- | -------- | ----------------- | ---------------- | ----------- | ---------- | ----- |
| West Yorkshire (small) | 6s       | 23MB              | 16MB             | 23k         | 11k        | 3     |
| West Yorkshire (large) | 51s      | 1.45GB            | 1.2GB            | 1.9 million | 954k       | 300   |
| Devon                  | 28s      | 774MB             | 632MB            | 1 million   | 518k       | 156   |
| National               | 8m30s \* | 28GB (out of RAM) | unknown          | 42 million  | 21 million | 6.7k  |

To compare, running the Python pipeline for 3 MSOAs in West Yorkshire
(`Input_Test_3.csv`) takes 2 minutes, and Devon is over 30 minutes just reading
in QUANT flows. The Rust version is orders of magnitude faster. (I also want to
optimize the Python QUANT reader, since I think there are some basic
improvements possible there.)

### Scaling nationally

The code's already set up to run nationally -- just set the study area to
`national`. It uses all MSOAs from the lookup table, with a hardcoded 5 initial
cases per MSOA. Running on my laptop with 32GB RAM, I run out of memory when
copying nightclub flows to people. Getting to this point (reading all the
time-use files, creating the population, and handling retail QUANT flows) takes
about 9 minutes.

I have [some ideas](https://github.com/dabreegster/rampfs/issues/1) to decrease
the memory requirements, so we could comfortably run initialisation nationally
on a single machine. The biggest opportunity is not copying QUANT flows to each
person. As far as I can tell from the Python, this data varies by MSOA and
activity, and there's no variation with all of the people in each MSOA.

## Picking a language

In terms of line count, the Rust codebase is currently around 1,000 LoC, and
Python (just `coding/initialise`, no `constants.py` or `main_initialisation.py`)
at 1,400. (Measured using [tokei](https://github.com/XAMPPRocky/tokei), which
handles whitespace, comments, etc.)

In terms of runtime performance, the Rust version is orders of magnitude faster
-- 30 seconds for Devon, versus over 30 minutes.

Setting up a project like this in Rust takes a little bit more effort, but it's
well worth it for performance and improved debugging and developer experience.
We can make it impossible to hit certain types of problems, like confusing MSOA
IDs with CTY20 or having indices not match up. And I'm more than happy to pay
that up-front cost, extract reusable libraries to make the next projects easier,
and teach people these new approaches.

### The best of both worlds

I hope I've argued that writing complex pipelines and simulations in a language
like Rust is worthwhile. But one major limitation of Rust is the lack of an
interactive shell (aka REPL) or notebook environment. Python and R are great for
interactive dataviz, stats, and exploration. Can we use the right tool for the
job?

I propose something simple -- make it extremely easy to dump data from anywhere
in the Rust code to a file in some common format (CSV, JSON, GeoJSON, etc) and
load that with Python. I'm not exactly sure what this'll look like yet, but we
could maybe even add some kind of "breakpoint" debugging method that opens up a
Python REPL in one step. Exploration ongoing.
