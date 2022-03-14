#!/usr/bin/env python3

import click
import pickle
from tqdm import tqdm
import pandas as pd
import os

from aspics.params import Params
from aspics.summary import Summary
from aspics.disease_statuses import DiseaseStatus
from aspics.loader import setup_sim


@click.command()
@click.option(
    "-p",
    "--parameters-file",
    type=click.Path(exists=True),
    help="Parameters file to use to configure the model. This must be located in the working directory.",
)
def main(parameters_file):
    simulator, snapshot, study_area = setup_sim(parameters_file)
    # TODO from params
    iterations = 100

    summary, final_state = run_headless(simulator, snapshot, iterations)
    store_summary_data(
        summary, store_detailed_counts=True, output_dir=f"data/output/{study_area}/"
    )


def run_headless(
    simulator, snapshot, iterations, quiet=False, store_detailed_counts=True
):
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


def store_summary_data(summary, store_detailed_counts, output_dir):
    print(f"output area folder {output_dir}")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # convert total_counts to dict of pandas dataseries
    total_counts_dict = {}
    for status, timeseries in enumerate(summary.total_counts):
        total_counts_dict[DiseaseStatus(status).name.lower()] = pd.Series(timeseries)

    with open(output_dir + "/total_counts.pkl", "wb") as f:
        pickle.dump(total_counts_dict, f)
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
            # This is a dictionary from each disease status to a table with 8
            # rows and a column per day.
            # TODO What's the desired CSV output?
            """age_counts_df = pd.DataFrame.from_dict(
                age_counts_dict,
                orient="index",
            )
            age_counts_df.to_csv(output_dir + "/age_counts.csv", index=False)"""

        with open(output_dir + "/area_counts.pkl", "wb") as f:
            pickle.dump(area_counts_dict, f)
            # This is a dictionary from each disease status to a table with
            # days as columns and MSOAs as rows.
            # TODO What's the desired CSV output?
            """area_counts_df = pd.DataFrame.from_dict(
                area_counts_dict, orient="index"
            )
            area_counts_df.to_csv(output_dir + "/area_counts.csv", index=False)"""


if __name__ == "__main__":
    main()
