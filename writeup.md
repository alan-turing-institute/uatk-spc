# RAMP rewrite write-up

## Purpose

I had two goals starting out:

1.  Understand how the model works -- there's no better way than re-creating it!
2.  Identify useful software engineering practices that may be unfamiliar to the
    team

Going forward, what should we do with this rewrite?

1.  Switch over to it. See the section below arguing why.
2.  Just replace the initialisation step, but keep the existing Python/OpenCL
    model for part 2
3.  Nothing -- keep iterating on the Python version, but apply lessons from this
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
through the code, but we should define them in a `dev.md` document or somewhere
obvious in the code. I've figured out `tu` is "time-use", but I still have no
idea what `CTY20` or `sic1d07` are! And with the QUANT data, what's the
difference between `PiJ`, `SiJ`, `HiJ`?

**Consistent terminology** is also helpful. It took me a while to realize that
all of these are the same: shop, venue, retail point, location.

I had to skip past lots of **commented code**, like
[here](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/population_initialisation.py#L241).
Some comments were very helpful, and others were just older versions of some
code, and it's hard to distinguish. If something's experimental, keep it in a
separate branch.

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
took **3 hours**! On Mac, it took about 10 minutes. I have no idea why this
difference exists, but it doesn't matter -- both of these are completely
unusable from a developer experience perspective. If it takes more than a few
seconds to decide what version of packages to use in any language, something's
very wrong.

**It's not reproducible** --
[environment.yml](https://github.com/Urban-Analytics/RAMP-UA/blob/Ecotwins-withCommuting/environment.yml)
specifies [semver](https://semver.org/) constraints on packages, but depending
when you build the conda environment, you'll get **different results**, because
there's a newer version of some package. I don't think this is acceptable from a
scientific reproducibility perspective -- we should be able to pick up a project
years later, build it, and get exactly the same results. This isn't just a
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

examples

#### Just use normal Python

In many cases, using regular Python lists and dictionaries would be way simpler
and faster. An example in
[quant_api.py](https://github.com/Urban-Analytics/RAMP-UA/blob/3cf45d225501ef64ad6439c9e4c330f052708853/coding/initialise/quant_api.py#L72):

```python
zonei = int(dfPrimaryPopulation.loc[dfPrimaryPopulation['msoaiz'] == msoa_iz,'zonei'])
```

This is difficult to read and slow. Logically, it's just mapping the MSOA ID to
some `zonei` ID. But working with dataframes forces us to extract a scalar
result. Even worse, these lookups happen with the lookup for every MSOA. We
could just iterate through the CSV file and build up a dictionary once, then
just transform MSOA to zonei with normal Python.

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

| Study area     | Runtime  | Peak memory usage | Output file size | People      | Households   | MSOAs |
| -------------- | -------- | ----------------- | ---------------- | ----------- | ------------ | ----- |
| West Yorkshire | 51s      | 1.45GB            | 1.2GB            | 1.9 million | 954 thousand | 300   |
| Devon          | 28s      | 774MB             | 632MB            | 1 million   | 518 thousand | 156   |
| National       | 8m30s \* | 28GB (out of RAM) | unknown          | 42 million  | 21 million   | 6.7k  |

(Currently we have a small and large version of West Yorkshire --
`Input_Test_3.csv` and `Input_WestYorkshire.csv` -- but they're equivalent,
except for the number of MSOAs initially seeded with cases.)

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
at 1,400.

In terms of runtime performance, I think the Rust version is a clear winner, but
I need to run the Python pipeline again.

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
