import numpy as np
import numpy as np
from collections import namedtuple

LocationHazardMultipliers = namedtuple(
    "LocationHazardMultipliers",
    ["retail", "nightclubs", "primary_school", "secondary_school", "home", "work"],
)

IndividualHazardMultipliers = namedtuple(
    "IndividualHazardMultipliers", ["presymptomatic", "asymptomatic", "symptomatic"]
)


class Params:
    """Convenience class for setting simulator parameters. Also holds the default values."""

    def __init__(
        self,
        location_hazard_multipliers=LocationHazardMultipliers(
            retail=0.0165,
            nightclubs=0.0165,
            primary_school=0.0165,
            secondary_school=0.0165,
            home=0.0165,
            work=0.0,
        ),
        individual_hazard_multipliers=IndividualHazardMultipliers(
            presymptomatic=1.0, asymptomatic=0.75, symptomatic=1.0
        ),
        obesity_multipliers=[1, 1, 1, 1],
        cvd_multiplier=1,
        diabetes_multiplier=1,
        bloodpressure_multiplier=1,
        overweight_sympt_mplier=1.46,
    ):
        """Create a simulator with the default parameters."""
        if obesity_multipliers is None:
            obesity_multipliers = [1, 1, 1, 1]
        self.symptomatic_multiplier = 0.5
        self.exposed_scale = 2.82
        self.exposed_shape = 3.99
        self.presymptomatic_scale = 2.45
        self.presymptomatic_shape = 7.79
        self.infection_log_scale = 0.35
        self.infection_mode = 7.0
        self.lockdown_multiplier = 1.0
        self.place_hazard_multipliers = np.array(
            [
                location_hazard_multipliers.retail,
                location_hazard_multipliers.nightclubs,
                location_hazard_multipliers.primary_school,
                location_hazard_multipliers.secondary_school,
                location_hazard_multipliers.home,
                location_hazard_multipliers.work,
            ],
            dtype=np.float32,
        )

        self.individual_hazard_multipliers = np.array(
            [
                individual_hazard_multipliers.presymptomatic,
                individual_hazard_multipliers.asymptomatic,
                individual_hazard_multipliers.symptomatic,
            ],
            dtype=np.float32,
        )

        self.mortality_probs = np.array(
            [
                0.00,
                0.0001,
                0.0001,
                0.0002,
                0.0003,
                0.0004,
                0.0006,
                0.0010,
                0.0016,
                0.0024,
                0.0038,
                0.0060,
                0.0094,
                0.0147,
                0.0231,
                0.0361,
                0.0566,
                0.0886,
                0.1737,
            ],
            dtype=np.float32,
        )
        self.obesity_multipliers = np.array(obesity_multipliers, dtype=np.float32)
        self.symptomatic_probs = np.array(
            [0.21, 0.21, 0.45, 0.45, 0.45, 0.45, 0.45, 0.69, 0.69], dtype=np.float32
        )
        self.cvd_multiplier = cvd_multiplier
        self.diabetes_multiplier = diabetes_multiplier
        self.bloodpressure_multiplier = bloodpressure_multiplier
        self.overweight_sympt_mplier = overweight_sympt_mplier

    def asarray(self):
        """Pack the parameters into a flat array for uploading."""
        return np.concatenate(
            [
                np.array(
                    [
                        self.symptomatic_multiplier,
                        self.exposed_scale,
                        self.exposed_shape,
                        self.presymptomatic_scale,
                        self.presymptomatic_shape,
                        self.infection_log_scale,
                        self.infection_mode,
                        self.lockdown_multiplier,
                    ],
                    dtype=np.float32,
                ),
                self.place_hazard_multipliers,
                self.individual_hazard_multipliers,
                self.mortality_probs,
                self.obesity_multipliers,
                self.symptomatic_probs,
                np.array(
                    [
                        self.cvd_multiplier,
                        self.diabetes_multiplier,
                        self.bloodpressure_multiplier,
                        self.overweight_sympt_mplier,
                    ],
                    dtype=np.float32,
                ),
            ]
        )

    @classmethod
    def fromarray(cls, params_array):
        location_hazard_multipliers = LocationHazardMultipliers(
            retail=params_array[8],
            nightclubs=params_array[9],
            primary_school=params_array[10],
            secondary_school=params_array[11],
            home=params_array[12],
            work=params_array[13],
        )
        individual_hazard_multipliers = IndividualHazardMultipliers(
            presymptomatic=params_array[14],
            asymptomatic=params_array[15],
            symptomatic=params_array[16],
        )
        p = cls(location_hazard_multipliers, individual_hazard_multipliers)
        p.symptomatic_multiplier = params_array[0]
        p.exposed_scale = params_array[1]
        p.exposed_shape = params_array[2]
        p.presymptomatic_scale = params_array[3]
        p.presymptomatic_shape = params_array[4]
        p.infection_log_scale = params_array[5]
        p.infection_mode = params_array[6]
        p.lockdown_multiplier = params_array[7]
        p.mortality_probs = params_array[17:36]
        p.obesity_multipliers = params_array[36:40]
        p.symptomatic_probs = params_array[40:49]
        p.cvd_multiplier = params_array[40]
        p.diabetes_multiplier = params_array[50]
        p.bloodpressure_multiplier = params_array[51]
        p.overweight_sympt_mplier = params_array[52]
        return p

    def set_lockdown_multiplier(self, lockdown_multipliers, timestep):
        """Update the lockdown multiplier based on the current time."""
        self.lockdown_multiplier = lockdown_multipliers[
            np.minimum(lockdown_multipliers.shape[0] - 1, timestep)
        ]

    def num_bytes(self):
        return 4 * self.asarray().size
