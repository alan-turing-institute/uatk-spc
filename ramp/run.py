import pickle
from tqdm import tqdm
import pandas as pd
import os
import csv
import numpy as np


from ramp.inspector import Inspector
from ramp.params import Params
from ramp.simulator import Simulator
from ramp.summary import Summary
from ramp.disease_statuses import DiseaseStatus
from ramp.constants import Constants


def run_opencl(
    snapshot,
    study_area,
    parameters_file,
    iterations=100,
    use_gui=True,
    use_gpu=False,
    quiet=False,
):
    """
    Entry point for running the OpenCL simulation either with the UI or in headless mode.
    NB: in order to write output data for the OpenCL dashboard you must run in headless mode.
    """
    study_area_folder_in_processed_data = os.path.join(
        Constants.Paths.PROCESSED_DATA.FULL_PATH_FOLDER, study_area
    )
    study_area_folder_in_output = os.path.join(
        Constants.Paths.OUTPUT_FOLDER.FULL_PATH_FOLDER, study_area
    )
    if not quiet:
        print(f"Snapshot is {int(snapshot.num_bytes() / 1000000)} MB")

    # Create a simulator and upload the snapshot data to the OpenCL device
    simulator = Simulator(snapshot, parameters_file, gpu=use_gpu)
    # simulator.upload_all(snapshot.buffers)

    [people_statuses, people_transition_times] = simulator.seeding_base()

    simulator.upload_all(snapshot.buffers)

    simulator.upload("people_statuses", people_statuses)
    simulator.upload("people_transition_times", people_transition_times)

    if not quiet:
        print(
            f"OpenCL platform = {simulator.platform_name()}, device = {simulator.device_name()}"
        )

    if use_gui:
        run_with_gui(
            simulator, snapshot, study_area_folder_in_processed_data, study_area
        )
    else:
        summary, final_state = run_headless(simulator, snapshot, iterations, quiet)
        store_summary_data(
            summary, store_detailed_counts=True, data_dir=study_area_folder_in_output
        )


def run_with_gui(simulator, snapshot, study_area_folder_in_processed_data, study_area):
    width = 2560  # Initial window width in pixels
    height = 1440  # Initial window height in pixels
    nlines = 4  # Number of visualised connections per person

    # Create an inspector and upload static data
    inspector = Inspector(
        simulator,
        snapshot,
        study_area_folder_in_processed_data,
        nlines,
        study_area,  # "Ramp UA",
        width,
        height,
    )

    # Main UI loop
    while inspector.is_active():
        inspector.update()


def run_headless(simulator, snapshot, iterations, quiet, store_detailed_counts=True):
    """
    Run the simulation in headless mode and store summary data.
    NB: running in this mode is required in order to view output data in the dashboard. Also store_detailed_counts must
    be set to True to output the required data for the dashboard, however the model runs faster with this set to False.
    """
    params = Params.fromarray(snapshot.buffers.params)
    summary = Summary(
        snapshot, store_detailed_counts=store_detailed_counts, max_time=iterations
    )

    # only show progress bar in quiet mode
    timestep_iterator = (
        range(iterations)
        if quiet
        else tqdm(range(iterations), desc="Running simulation")
    )

    for time in timestep_iterator:
        # Update parameters based on lockdown
        params.set_lockdown_multiplier(snapshot.lockdown_multipliers, time)
        simulator.upload("params", params.asarray())

        # Step the simulator
        simulator.step()

        # Update the statuses
        simulator.download("people_statuses", snapshot.buffers.people_statuses)
        summary.update(time, snapshot.buffers.people_statuses)

    if not quiet:
        for i in range(iterations):
            print(f"\nDay {i}")
            summary.print_counts(i)

    if not quiet:
        print("\nFinished")

    # Download the snapshot from OpenCL to host memory
    final_state = simulator.download_all(snapshot.buffers)

    return summary, final_state


def store_summary_data(summary, store_detailed_counts, data_dir):
    # convert total_counts to dict of pandas dataseries
    total_counts_dict = {}
    for status, timeseries in enumerate(summary.total_counts):
        total_counts_dict[DiseaseStatus(status).name.lower()] = pd.Series(timeseries)

    output_dir = data_dir
    print(f"output area folder {output_dir}")
    # output_dir = data_dir + "/output/OpenCL/"
    # create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(output_dir + "/total_counts.pkl", "wb") as f:
        pickle.dump(total_counts_dict, f)
        # w = csv.DictWriter(f, total_counts_dict.keys())
        # w.writeheader()
        # w.writerow(total_counts_dict)
        total_counts_df = pd.DataFrame.from_dict(
            total_counts_dict
        )  # transform to df so we can export to csv
        total_counts_df.to_csv(output_dir + "/total_counts.csv", index=False)

    if store_detailed_counts:
        # turn 2D arrays into dataframes for ages and areas
        age_counts_dict = summary.get_age_dataframes()
        area_counts_dict = summary.get_area_dataframes()

        # Store pickled summary objects
        with open(output_dir + "/age_counts.pkl", "wb") as f:
            pickle.dump(age_counts_dict, f)
            age_counts_df = pd.DataFrame.from_dict(
                age_counts_dict,  # transform to df so we can export to csv
                orient="index",
            )
            age_counts_df.to_csv(output_dir + "/age_counts.csv", index=False)

        with open(output_dir + "/area_counts.pkl", "wb") as f:
            pickle.dump(area_counts_dict, f)
            area_counts_df = pd.DataFrame.from_dict(
                area_counts_dict, orient="index"
            )  # transform to df so we can export to csv
            area_counts_df.to_csv(output_dir + "/area_counts.csv", index=False)
