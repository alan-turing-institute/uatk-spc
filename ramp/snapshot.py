import numpy as np

from ramp.buffers import Buffers
from ramp.params import Params


class Snapshot:
    """
    Thin wrapper around the .npz file format for saving/loading snapshots.
    This enables loading existing snapshots from file, or generating new snapshots full of random data or zeros.
    It also has a function for seeding initial infections in the population.
    Each snapshot consists of the data buffers used by OpenCL, as well as additional static data about the population
    which is not used in the runtime simulation but may be used for seeding infections at the snapshot stage.
    """

    def __init__(
        self,
        nplaces,
        npeople,
        nslots,
        time,
        area_codes,
        not_home_probs,
        lockdown_multipliers,
        buffers,
        name="cache",
    ):
        self.name = name
        self.nplaces = nplaces
        self.npeople = npeople
        self.nslots = nslots
        self.time = time
        self.area_codes = area_codes
        self.not_home_probs = not_home_probs
        self.lockdown_multipliers = lockdown_multipliers
        self.buffers = buffers

    @classmethod
    def zeros(cls, nplaces, npeople, nslots):
        """Creates a snapshot with correctly sized but zeroed arrays."""
        nplaces = np.uint32(nplaces)
        npeople = np.uint32(npeople)
        nslots = np.uint32(nslots)
        time = np.uint32(0)
        area_codes = np.full(npeople, "E00000000")  # "E02002371") # "E02004129")
        not_home_probs = np.zeros(npeople).astype(np.float32)

        lockdown_multipliers = np.ones(
            2000
        )  # Random high number that should be higher than the length of the lockdown file

        buffers = Buffers(
            place_activities=np.zeros(nplaces, dtype=np.uint32),
            place_coords=np.zeros(nplaces * 2, dtype=np.float32),
            place_hazards=np.zeros(nplaces, dtype=np.uint32),
            place_counts=np.zeros(nplaces, dtype=np.uint32),
            people_ages=np.zeros(npeople, dtype=np.uint16),
            people_obesity=np.zeros(npeople, dtype=np.uint16),
            people_cvd=np.zeros(npeople, dtype=np.uint8),
            people_diabetes=np.zeros(npeople, dtype=np.uint8),
            people_blood_pressure=np.zeros(npeople, dtype=np.uint8),
            people_statuses=np.zeros(npeople, dtype=np.uint32),
            people_transition_times=np.zeros(npeople, dtype=np.uint32),
            people_place_ids=np.zeros(npeople * nslots, dtype=np.uint32),
            people_baseline_flows=np.zeros(npeople * nslots, dtype=np.float32),
            people_flows=np.zeros(npeople * nslots, dtype=np.float32),
            people_hazards=np.zeros(npeople, dtype=np.float32),
            people_prngs=np.zeros(npeople * 4, dtype=np.uint32),
            params=Params().asarray(),
        )

        return cls(
            nplaces,
            npeople,
            nslots,
            time,
            area_codes,
            not_home_probs,
            lockdown_multipliers,
            buffers,
        )

    @classmethod
    # def random(cls, nplaces, npeople, nslots, lat=50.7, lon=-3.5):
    def random(cls, nplaces, npeople, nslots, lat=53.735983, lon=-1.678567):
        """Generates a random snapshot for testing in a 1 degree square around lat/lon."""
        nplaces = np.uint32(nplaces)
        npeople = np.uint32(npeople)
        nslots = np.uint32(nslots)
        time = np.uint32(0)
        area_codes = np.full(npeople, "E02002371")  # "E02004129")
        not_home_probs = np.random.rand(npeople).astype(np.float32)

        lockdown_multipliers = np.ones(2000)

        buffers = Buffers(
            place_activities=np.random.randint(6, size=nplaces, dtype=np.uint32),
            place_coords=np.random.randn(nplaces * 2).astype(np.float32),
            place_hazards=np.zeros(nplaces, dtype=np.uint32),
            place_counts=np.zeros(nplaces, dtype=np.uint32),
            people_ages=np.random.randint(100, size=npeople, dtype=np.uint16),
            people_obesity=np.zeros(npeople, dtype=np.uint16),
            people_cvd=np.zeros(npeople, dtype=np.uint8),
            people_diabetes=np.zeros(npeople, dtype=np.uint8),
            people_blood_pressure=np.zeros(npeople, dtype=np.uint8),
            people_statuses=np.random.binomial(1, 0.001, npeople).astype(np.uint32),
            people_transition_times=np.ones(npeople, dtype=np.uint32),
            people_place_ids=np.random.randint(
                nplaces, size=npeople * nslots, dtype=np.uint32
            ),
            people_baseline_flows=np.random.rand(npeople * nslots).astype(np.float32),
            people_flows=np.zeros(npeople * nslots, dtype=np.float32),
            people_hazards=np.zeros(npeople, dtype=np.float32),
            people_prngs=np.random.randint(
                np.uint32((1 << 32) - 1), size=npeople * 4, dtype=np.uint32
            ),
            params=Params().asarray(),
        )

        ids = np.reshape(np.tile(np.arange(nslots), npeople), (npeople, nslots))
        ids += np.reshape(np.arange(npeople), (npeople, 1))
        buffers.people_place_ids[:] = (
            np.clip(ids, 0, nplaces).flatten().astype(np.uint32)
        )

        buffers.place_coords[0::2] = np.mod(
            np.arange(nplaces), np.sqrt(nplaces)
        ) / np.sqrt(nplaces)
        buffers.place_coords[1::2] = np.arange(nplaces) / nplaces
        buffers.place_coords[0::2] += lat - 0.5
        buffers.place_coords[1::2] += lon - 0.5
        buffers.place_coords[:] += np.random.randn(2 * nplaces) / 100.0

        return cls(
            nplaces,
            npeople,
            nslots,
            time,
            area_codes,
            not_home_probs,
            lockdown_multipliers,
            buffers,
        )

    @classmethod
    def from_arrays(
        cls,
        people_ages,
        people_obesity,
        people_cvd,
        people_diabetes,
        people_blood_pressure,
        people_place_ids,
        people_baseline_flows,
        area_codes,
        not_home_probs,
        place_activities,
        place_coords,
        lockdown_multipliers,
    ):
        nplaces = place_activities.shape[0]
        npeople = people_place_ids.shape[0]
        nslots = people_baseline_flows.shape[1]

        # Reshape 2D arrays to 1D
        people_place_ids = people_place_ids.flatten()
        people_baseline_flows = people_baseline_flows.flatten()
        place_coords = place_coords.flatten()

        nplaces = np.uint32(nplaces)
        npeople = np.uint32(npeople)
        nslots = np.uint32(nslots)
        time = np.uint32(0)

        buffers = Buffers(
            place_activities=place_activities,
            place_coords=place_coords,
            place_hazards=np.zeros(nplaces, dtype=np.uint32),
            place_counts=np.zeros(nplaces, dtype=np.uint32),
            people_ages=people_ages,
            people_obesity=people_obesity,
            people_cvd=people_cvd,
            people_diabetes=people_diabetes,
            people_blood_pressure=people_blood_pressure,
            people_statuses=np.zeros(npeople, dtype=np.uint32),
            people_transition_times=np.zeros(npeople, dtype=np.uint32),
            people_place_ids=people_place_ids,
            people_baseline_flows=people_baseline_flows,
            people_flows=people_baseline_flows,
            people_hazards=np.zeros(npeople, dtype=np.float32),
            people_prngs=np.random.randint(
                np.uint32((1 << 32) - 1), size=npeople * 4, dtype=np.uint32
            ),
            params=Params().asarray(),
        )

        return cls(
            nplaces,
            npeople,
            nslots,
            time,
            area_codes,
            not_home_probs,
            lockdown_multipliers,
            buffers,
        )

    def update_params(self, new_params):
        try:
            self.buffers.params[:] = new_params.asarray()
        except ValueError as e:
            print(
                f"Snapshot.py caused an exception '{str(e)}'. This can happen if the parameters in the model "
                f"have changed after a snapshot has been created. Try deleting the snapshot file "
                f"'microsim/opencl/snapshots/{self.name}.npz' and re-running the model."
            )
            raise e

    def seed_prngs(self, seed):
        """
        Recomputes the random states of the PRNGs passed to the kernels.
        The simulator runs deterministically for the same snapshot state, so calling this function gives new
        PRNG values to get enable stochastic results for different runs.
        """
        np.random.seed(seed)
        self.buffers.people_prngs[:] = np.random.randint(
            np.uint32((1 << 32) - 1), size=self.npeople * 4, dtype=np.uint32
        )

    def switch_to_healthier_population(self):
        """
        Updates to a healthier population by reducing obesity. Any individuals that are overweight or obese are moved
        to the level of obesity below their current one, by subtracting 1.
        """
        people_obesity = self.buffers.people_obesity
        # only change people with obesity 2 and above, 2 corresponds to "Obese I"
        people_obesity[people_obesity >= 2] -= 1
        self.buffers.people_obesity[:] = people_obesity

    @classmethod
    def load_full_snapshot(cls, path):
        """Creates a snapshot by reading the .npz file from the provided path."""
        with np.load(path, allow_pickle=True) as file_data:
            nplaces = file_data["nplaces"]
            npeople = file_data["npeople"]
            nslots = file_data["nslots"]
            time = file_data["time"]
            area_codes = file_data["area_codes"]
            not_home_probs = file_data["not_home_probs"]
            lockdown_multipliers = file_data["lockdown_multipliers"]

            buffers = Buffers(**{name: file_data[name] for name in Buffers._fields})
            return cls(
                nplaces,
                npeople,
                nslots,
                time,
                area_codes,
                not_home_probs,
                lockdown_multipliers,
                buffers,
            )

    def save(self, path):
        """Saves this snapshot to the provided path as a .npz file."""
        np.savez(
            path,
            nplaces=self.nplaces,
            npeople=self.npeople,
            nslots=self.nslots,
            time=self.time,
            area_codes=self.area_codes,
            not_home_probs=self.not_home_probs,
            lockdown_multipliers=self.lockdown_multipliers,
            **self.buffers._asdict(),
        )

    def num_bytes(self):
        """Returns size in bytes of this snapshot."""
        total = 0
        for name in self.buffers._fields:
            total += getattr(self.buffers, name).nbytes
        return total

    def sanitize_coords(self):
        """Sets all zero coordinate to nan so they can be discarded by the renderer."""
        self.buffers.place_coords[:] = np.where(
            self.buffers.place_coords == 0.0, np.nan, self.buffers.place_coords
        )
