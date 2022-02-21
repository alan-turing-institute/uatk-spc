import numpy as np
from numpy import random
import pyopencl as cl
import os
import math
from ramp.buffers import Buffers
from ramp.kernels import Kernels
from ramp.params import Params
from ramp.snapshot import Snapshot
from ramp.initial_cases import InitialCases
from ramp.constants import Constants


class Simulator:
    """
    Class to manage all OpenCL owned simulator state. Including methods to transfer data buffers to/from OpenCL devices
    and a step() method to execute the kernels to calculate one timestep of the model.
    """

    def __init__(
        self,
        snapshot,
        parameters_file,
        # selected_region_folder_full_path,
        gpu=False,
    ):
        """Initialise OpenCL context, kernels, and buffers for the simulator.

        Args:
            snapshot (Snapshot): snapshot containing data and number of places, people and slots
            gpu (bool): Whether to try to use a discrete GPU, set to false to use CPU.

        Raises:
            OSError: If a GPU was requested but none is found.
        """

        nplaces = snapshot.nplaces
        npeople = snapshot.npeople
        nslots = snapshot.nslots

        # Create an OpenCL context
        dev_type = cl.device_type.GPU if gpu else cl.device_type.CPU
        platform = None
        for plat in cl.get_platforms():
            if len(plat.get_devices(dev_type)) > 0:
                platform = plat
                break
        if platform is None:
            raise OSError("No compatible device found")
        ctx = cl.Context(
            dev_type=dev_type, properties=[(cl.context_properties.PLATFORM, platform)]
        )
        queue = cl.CommandQueue(ctx)

        # Initialise the device buffers
        buffers = Buffers(
            place_activities=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, nplaces * 4),
            place_coords=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, nplaces * 8),
            place_hazards=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, nplaces * 4),
            place_counts=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, nplaces * 4),
            people_ages=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * 2),
            people_obesity=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * 2),
            people_cvd=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople),
            people_diabetes=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople),
            people_blood_pressure=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople),
            people_statuses=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * 4),
            people_transition_times=cl.Buffer(
                ctx, cl.mem_flags.READ_WRITE, npeople * 4
            ),
            people_place_ids=cl.Buffer(
                ctx, cl.mem_flags.READ_WRITE, npeople * nslots * 4
            ),
            people_baseline_flows=cl.Buffer(
                ctx, cl.mem_flags.READ_WRITE, npeople * nslots * 4
            ),
            people_flows=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * nslots * 4),
            people_hazards=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * 4),
            people_prngs=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, npeople * 16),
            params=cl.Buffer(ctx, cl.mem_flags.READ_WRITE, Params().num_bytes()),
        )
        # kernel_dir = os.path.join(opencl_dir, "ramp/kernels/")
        kernel_dir = Constants.Paths.OPENCL_SOURCE.FOLDER_PATH_FOR_KERNEL
        # Load the OpenCL kernel programs
        with open(
            os.path.join(kernel_dir, Constants.Paths.OPENCL_SOURCE.KERNEL_FILE)
        ) as f:
            program = cl.Program(ctx, f.read())
            program.build(options=[f"-I {kernel_dir}"])

        kernels = Kernels(
            places_reset=program.places_reset,
            people_update_flows=program.people_update_flows,
            people_send_hazards=program.people_send_hazards,
            people_recv_hazards=program.people_recv_hazards,
            people_update_statuses=program.people_update_statuses,
        )

        # Pass data buffers to the kernels using set_args
        kernels.places_reset.set_args(
            nplaces, buffers.place_hazards, buffers.place_counts
        )

        kernels.people_update_flows.set_args(
            npeople,
            nslots,
            buffers.people_statuses,
            buffers.people_baseline_flows,
            buffers.people_flows,
            buffers.people_place_ids,
            buffers.place_activities,
            buffers.params,
        )

        kernels.people_send_hazards.set_args(
            npeople,
            nslots,
            buffers.people_statuses,
            buffers.people_place_ids,
            buffers.people_flows,
            buffers.people_hazards,
            buffers.place_hazards,
            buffers.place_counts,
            buffers.place_activities,
            buffers.params,
        )

        kernels.people_recv_hazards.set_args(
            npeople,
            nslots,
            buffers.people_statuses,
            buffers.people_place_ids,
            buffers.people_flows,
            buffers.people_hazards,
            buffers.place_hazards,
            buffers.params,
        )

        kernels.people_update_statuses.set_args(
            npeople,
            buffers.people_ages,
            buffers.people_obesity,
            buffers.people_cvd,
            buffers.people_diabetes,
            buffers.people_blood_pressure,
            buffers.people_hazards,
            buffers.people_statuses,
            buffers.people_transition_times,
            buffers.people_prngs,
            buffers.params,
        )

        self.nplaces = nplaces
        self.npeople = npeople
        self.nslots = nslots
        self.time = snapshot.time

        self.platform = platform
        self.ctx = ctx
        self.queue = queue

        self.start_snapshot = snapshot
        self.buffers = buffers
        self.kernels = kernels

        # data_dir = os.path.join(opencl_dir, "data/")
        self.initial_cases = InitialCases(
            snapshot.area_codes, snapshot.not_home_probs, parameters_file
        )

        self.num_seed_days = 0

    def platform_name(self):
        """The name of the OpenCL platform being used for simulation."""
        return self.platform.get_info(cl.platform_info.NAME)

    def device_name(self):
        """The name of the OpenCL device being used for simulation."""
        device = self.ctx.get_info(cl.context_info.DEVICES)[0]
        return device.get_info(cl.device_info.NAME)

    def upload(self, name, host_buffer):
        """Transfers the contents of the provided numpy array to the named OpenCL buffer."""
        if hasattr(self.buffers, name):
            cl.enqueue_copy(self.queue, getattr(self.buffers, name), host_buffer)
        else:
            raise ValueError("No buffer with name {}".format(name))

    def download(self, name, host_buffer):
        """Transfers the contents of the named OpenCL buffer to the provided numpy array."""
        if hasattr(self.buffers, name):
            cl.enqueue_copy(self.queue, host_buffer, getattr(self.buffers, name))
        else:
            raise ValueError("No buffer with name {}".format(name))

    def upload_all(self, host_buffers):
        """Upload to every device buffer, errors if host_buffers is missing a field.

        Args:
            host_buffers: A Buffers namedtuple containing numpy arrays.
        """
        for name in Buffers._fields:
            self.upload(name, getattr(host_buffers, name))

    def download_all(self, host_buffers):
        """Downloads every device buffer, errors if host_buffers is missing a field.

        Args:
            host_buffers: A dict of string names to numpy buffers.
        """
        for name in Buffers._fields:
            self.download(name, getattr(host_buffers, name))

    def step(self):
        """Choose whether to run the normal step function or the one for initial case seeding"""
        if self.time < self.num_seed_days:
            self.step_with_seeding()
        else:
            self.step_all_kernels()

    def step_all_kernels(self):
        """Runs each kernel in order and updates the time. Blocks until complete."""
        reset_event = cl.enqueue_nd_range_kernel(
            self.queue, self.kernels.places_reset, (self.nplaces,), None
        )
        update_flows_event = cl.enqueue_nd_range_kernel(
            self.queue, self.kernels.people_update_flows, (self.npeople,), None
        )
        event = cl.enqueue_nd_range_kernel(
            self.queue,
            self.kernels.people_send_hazards,
            (self.npeople,),
            None,
            wait_for=[reset_event, update_flows_event],
        )
        event = cl.enqueue_nd_range_kernel(
            self.queue,
            self.kernels.people_recv_hazards,
            (self.npeople,),
            None,
            wait_for=[event],
        )
        event = cl.enqueue_nd_range_kernel(
            self.queue,
            self.kernels.people_update_statuses,
            (self.npeople,),
            None,
            wait_for=[event],
        )
        event.wait()
        self.time += np.uint32(1)

    def step_kernel(self, name):
        """Run a single kernel specified by name. NB: this is intended only to be used for testing."""
        if hasattr(self.kernels, name):
            dims = (self.nplaces,) if name == "places_reset" else (self.npeople,)
            event = cl.enqueue_nd_range_kernel(
                self.queue, getattr(self.kernels, name), dims, None
            )
            event.wait()
        else:
            raise ValueError("No kernel with name {}".format(name))

    def step_with_seeding(self):
        """For initial case seeding: sets a number of people infected based on the initial cases data, then runs only
        the kernel which updates people statuses. LEGACY"""
        max_hazard_val = np.finfo(np.float32).max

        people_hazards = np.zeros(self.npeople, dtype=np.float32)

        initial_case_ids = self.initial_cases.get_seed_people_ids_for_day(self.time)

        # set hazard to maximum float val, so these people will have infection_prob=1
        # and will transition to exposed state
        people_hazards[initial_case_ids] = max_hazard_val

        self.upload("people_hazards", people_hazards)

        # run only the update statuses kernel so that people transition through disease states
        self.step_kernel("people_update_statuses")
        self.time += np.uint32(1)

    def seeding_base(self):
        """Different seeding: sets a number of people infected based on the MSOA cases data and decides their status
        (asymptomatic, symptomatic) according to the rules of the model."""
        initial_case_ids = self.initial_cases.get_seed_people_ids()

        people_statuses = np.zeros(self.npeople, dtype=np.float32)
        people_transition_times = np.zeros(self.npeople, dtype=np.float32)
        people_statuses[initial_case_ids] = 3

        cov_params = Params.fromarray(self.start_snapshot.buffers.params)
        people_ages = self.start_snapshot.buffers.people_ages
        people_obesity = self.start_snapshot.buffers.people_obesity

        for i in initial_case_ids:
            # define random statuses
            symptomatic_prob = cov_params.symptomatic_probs[
                min(math.floor(people_ages[i] / 10), 8)
            ]
            if people_obesity[i] > 2:
                symptomatic_prob = symptomatic_prob * cov_params.overweight_sympt_mplier
            if random.random() < symptomatic_prob:
                people_statuses[i] = 4
            # define random duration times
            people_transition_times[i] = random.lognormal(
                pow(cov_params.infection_log_scale, 2)
                + math.log(cov_params.infection_mode),
                cov_params.infection_log_scale,
            )
            people_transition_times[i] = random.choice(
                range(math.floor(people_transition_times[i]))
            )

        people_statuses = people_statuses.astype(np.uint32)
        people_transition_times = people_transition_times.astype(np.uint32)

        return [people_statuses, people_transition_times]
