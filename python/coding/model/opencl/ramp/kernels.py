from collections import namedtuple

# Names of each OpenCL kernel used in the simulation
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
