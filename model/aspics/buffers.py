from collections import namedtuple

# Names of each of the buffers holding the runtime simulation state, which are passed to OpenCL kernels.
# For more information on what these buffers represent see doc/model_design.md
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
    ],
)
