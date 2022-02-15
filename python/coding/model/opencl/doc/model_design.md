# RAMP-UA OpenCL Design

## Simulator State

The [data-oriented design](https://en.wikipedia.org/wiki/Data-oriented_design)
of this simulator allows us to talk about the state and logic of the model
separately. Let's start with the state.

#### Dimensions

The simulator has a handful of top level parameters representing the size of the
simulation. These are:

- `nplaces`: The number of places in the sim, stored as a `uint32`.
- `npeople`: The number of people in the sim, stored as a `uint32`.
- `nslots`: The max number of places each person may visit, stored as a `uint32`.

In addition, there is a timestep:

- `time (uint32)`: The number of days since the start of the sim, starting at 0.

What follows is a description of the state of the simulator. The full state is
represented by a handful of 1 and 2 dimensional arrays of primitives (like ints,
or floats). Identifiers for places and people are simply integers, and these can
be used to index into the appropriate arrays to read the properties for that
place or person.


#### Enums

There are two enums which will be referred to below:

- `Activity`: The activity associated with a place, either Home, Retail,
  PrimarySchool, SecondarySchool, or Work.
- `DiseaseStatus`: The current disease status of a person, either Susceptible,
  Exposed, Presymptomatic, Asymptomatic, Symptomatic, Recovered, or Dead.


#### Places

Arrays representing places are prefixed with `place_`. Their first dimension is
of size `nplaces`. Place arrays are as follows:

- `activities`: The `Activity` associated with this place (i.e. Home, Retail).
- `coords`: The lat/lon of this place stored as two `float32`s.
- `hazards`: The hazard at this place today, stored as a fixed point number
  inside a `uint32`.
- `counts`: The number of different people who visited this place today, stored
  as a `uint32`.


#### People

Arrays representing people are prefixed with `people_`. Their first dimension is
of size `npeople`. People arrays are as follows:

- `ages`: The age in years of this person, stored as a `uint16`.
- `statuses`: The current `DiseaseStatus` of this person.
- `transition_times`: The number of days remaining until this person transitions
  into their next disease state (if their next transition is precomputed),
  stored as a `uint32`. Since a person can only be in one status at a time, this
  is shared across all disease statuses.
- `place_ids`: A 2D array, where each row contains `nslots` place IDs which hold
  each of the places a person regularly visits, stored as `uint32`s.
- `baseline_flows`: A 2D array, where each row contains `nslots` baseline flows
  to the corresponding places in `place_ids`, stored as `float32`s
- `flows`: The same as `baseline_flows` but adjusted for the person's sickness
  status and any active lockdown policies.
- `hazards`: The current hazard being experienced by this person if they are
  `Susceptible`, stored as a `float32`.
- `prngs`: A pseudo random number generator state for each person, stored as
  four `uint32`s per person. See Appendix A for details.

Baseline flows are computed by premultiplying the activity specific durations
and the flows for each place and its activity, or `flow *duration ` in the
original model. This was done to simplify the model, but does not change its
logic.


#### Params

In addition to the above arrays, the simulator has an array containing a single
struct with all the parameters for simulation, this is passed to each stage of
the model and is referred to as `params`. The current contents of this struct
are:

```c
typedef struct Params {
  float symptomatic_multiplier; // Increase in time at home if symptomatic
  float proportion_asymptomatic; // Proportion of cases that are asymptomatic
  float exposed_scale; // The scale of the distribution of exposed durations
  float exposed_shape; // The shape of the distribution of exposed durations
  float presymp_scale; // The scale of the distribution of presymptomatic durations
  float presymp_shape; // The shape of the distribution of presymptomatic durations
  float infection_log_scale; // The std dev of the underlying normal distribution of the lognormal infected duration distribution
  float infection_mode; // The mode of the lognormal distribution of infected durations
  float lockdown_multiplier; // Increase in time at home due to lockdown
  float place_hazard_multipliers[5]; // Hazard multipliers by activity
  float mortality_probs[9]; // mortality probabilities by age group
  float obesity_multipliers[3]; // mortality multipliers for obesity levels
  float cvd_multiplier; // mortality multipliers for cardiovascular disease
  float diabetes_multiplier; // mortality multipliers for diabetes
  float bloodpressure_multiplier; // mortality multipliers for high blood pressure
} Params;
```


#### Summary

All together, these arrays, referred to with the more general "buffers" by
OpenCL, represent the runtime state of the simulation. To initialise the
simulation, we copy numpy arrays containing these data into the OpenCL buffers,
and to read the simulation state we copy the buffers into provided numpy arrays.
This is done using the `upload` and `download` function in the `Simulator` class
in python.

The full set of buffer names is stored in `ramp/buffers.py`, here they are to
summarise:

```python
Buffers = namedtuple(
    "Buffers",
    [
        "place_activities",
        "place_coords",
        "place_hazards",
        "place_counts",

        "people_ages",
        "people_obesity",
        "people_cvd",
        "people_diabetes",
        "people_blood_pressure",
        "people_statuses",
        "people_transition_times",
        "people_place_ids",
        "people_baseline_flows",
        "people_flows",
        "people_hazards",
        "people_prngs",

        "params",
    ]
)
```


## Simulator Kernels

OpenCL's programming model is represented in terms of kernels. A kernel is a
parallel for loop that executes over a range of integer indices. In this model,
we either execute over the range of integers representing places, or people.

This parallel nature means that each iteration of the loop must have exclusive
access to its own data. This is often quite simple, for example when people
update their disease status, they are only modifying their own properties, so
the resulting code looks much the same as single threaded code.

However, concurrent memory access can happen. For example when sick people write
their hazards to the locations they visit, two people could try and increment
that place's hazard at the same time. Therefore this operation is done with an
atomic operation to ensure only one person can access each place at a time.

This presents two issues:
1. OpenCL only supports atomic operations on integers
2. Even if it supported atomic operations on floats, floating point arithmetic
   is not associative, so the ordering of writes would (slightly) change the
   result.

For these two reasons (mainly the first) we have chosen to store hazards on
places in fixed point instead of floating point. This means the simulation is
deterministic and still stores the transition probabilities with 5 decimal
places of accuracy.

The kernels we implemented are as follows. A single timestep of the model
consists of running each of these kernels in order.


#### Places Reset

Or `places_reset`. This kernel runs once for each place. It resets the hazard
and count of each place to zero.


#### People Update Flows

Or `people_update_flows`. This kernel runs once for each person. It computes
their flows for this time period, based on their baseline flows, their disease
status, and the currently active lockdown policy.

This corresponds to the two functions in the origin python code:
- `Microsim.update_behaviour_during_lockdown()`
- `Microsim.change_behaviour_with_disease()`


#### People Send Hazards

Or `people_send_hazards`. This kernel runs once for each person. If this person
is not currently infectious, it skips them. It loops through each of the places
they regularly visit, retrieves their current flow to this place, and then uses
that to increment the hazard and count at that place.

This kernel is where activity specific hazard multipliers are applied. Applying
those multipliers at this stage ensures that the fixed point hazard stored in
the place remains roughly between 0 and 1, and so does not overflow the integer.
This is different from the original implementation, but because these
multipliers are all linear, does not change the model.


#### People Receive Hazards

Or `people_recv_hazards`. This kernel runs once for each person. If this person
is not currently susceptible, it skips then. It loops through each of the places
they regularly visit reads the fixed point hazard at that place, converts it to
floating point, multiplies it by their flow to that place, and adds it to their
total hazard.

This kernel concurrently accesses data from different threads, but because these
accesses are all reads, they do not need to be synchronised.

This and the previous kernel correspond to the following function in the
original python code:
- `Microsim.update_venue_danger_and_risks()
`

#### People Update Statuses

Or `people_update_statuses`. This kernel runs once for each person. If this
person is susceptible, it will randomly infect them based on their current
hazard. It applies a shaping function to bound hazards between 0 and 1. For the
remaining state transitions, it checks if the current transition counter has
decreased below zero. If so it will transition this person to their next state
(possibly randomly) and update their status and next transition time
accordingly.

This kernel contains the functionality for calculating people's mortality risk 
based on factors such as age and obesity level. 

Finally, each person's transition time counter will be decremented. 

This kernel corresponds to the logic in the R disease model in the original
implementation.


#### Summary

Each of these kernels is individually unit tested by making assertions on the
contents of any modified arrays/buffers before and after the kernel is run. See
`tests/` for details.

The full set of kernel names is stored in `ramp/kernels.py` here they are to
summarise:

```python
Kernels = namedtuple(
    "Kernels",
    [
        "places_reset",
        "people_update_flows",
        "people_send_hazards",
        "people_recv_hazards",
        "people_update_statuses"
    ]
)
```

## Appendix A: Random Number Generation

Parallel programming presents a challenge for random number generation, which
typically relies on a single global random number generator. A typical solution
is to have one random number generator per core. This has two problems:

- Different numbers of cores means different numbers of RNGs and therefore
  results that vary across machines.
- Dynamic work assignment to cores means different people get different RNGs
  each run, and therefore we get results that vary within a machine.

Therefore we need a way to ensure that the same person will get the same random
number generator in the same state in every run. This turns out to have a very
simple solution: Give everyone their own RNG.

Typically this would be too expensive in terms of memory usage, so we turned to
a highly robust, low memory footprint random number generator: Xoshiro128++.
Full details on this RNG can be found [here](http://prng.di.unimi.it/).

Finally, for generating normal and exponential random numbers, the ziggurat
method is typically employed. However in the interest of development speed and
trouble finding lookup tables for 32 bit ziggurat, we turned to the Box-Muller
method for normal sampling, and the Inversion Transform method for exponential
sampling. These are accurate enough for our uses, but more expensive than
ziggurat.


## Appendix B: Memory Usage

Please make use of the following python snippet to compute the total memory
usage of this model. This can be useful for planning hardware requirements or
choosing a device (CPU or GPU).

```python
npeople = 66000000 # number of people
nplaces = 33000000 # number of places
nslots = 32        # possible places per person

total_bytes = 0
total_bytes += nplaces * 4          # place_activities
total_bytes += nplaces * 8          # place_coords
total_bytes += nplaces * 4          # place_hazards
total_bytes += nplaces * 4          # place_counts
total_bytes += npeople * 2          # people_ages
total_bytes += npeople * 2          # people_obesity
total_bytes += npeople              # people_cvd
total_bytes += npeople              # people_diabetes
total_bytes += npeople              # people_blood_pressure
total_bytes += npeople * 4          # people_statuses
total_bytes += npeople * 4          # people_transition_times
total_bytes += npeople * nslots * 4 # people_place_ids
total_bytes += npeople * nslots * 4 # people_baseline_probs
total_bytes += npeople * nslots * 4 # people_probs
total_bytes += npeople * 4          # people_hazards
total_bytes += npeople * 16         # people_prngs

assert(total_bytes == 28314000000)  # 28GB
```

It is possible to run all of Great Britain on a top end GPU, such as a GV100,
or an A100, which both have more than 28GB memory. Alternatively, it could be
run on a high memory system with a high core count chip like an AMD Epyc or
Threadripper. However, if we only need to simulate large regions, such as
Greater London, or South West England, we could fit those on cheaper consumer
GPUs with 8GB or so of operating memory


## Appendix C: OpenCL Features

If you go to the website of OpenCL, you may notice lots of fancy features we
aren't using, such as the C++ kernel language, or work queues. Different vendors
support different versions of OpenCL, but if we use features from a newer OpenCL
version like `2.2`, it won't run on Nvidia cards, which only support `1.2`.

This was recently acknowledged, and in OpenCL `3.0`, released earlier this year,
the "core" was reverted to `1.2` with all additional features marked as optional
extensions. So strictly speaking we're targeting the newest version of OpenCL,
but in its maximum compatibility mode.

To avoid confusion, I recommend referring to the [reference
sheet](https://www.khronos.org/files/opencl-1-2-quick-reference-card.pdf) for
version `1.2`, which will make it easy to check if a feature you are planning on
using will be widely supported.
