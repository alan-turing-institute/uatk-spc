#!/usr/bin/env python3

import click
from ramp.loader import setup_sim
from ramp.inspector import Inspector


@click.command()
@click.option(
    "-p",
    "--parameters-file",
    type=click.Path(exists=True),
    help="Parameters file to use to configure the model. This must be located in the working directory.",
)
def main(parameters_file):
    simulator, snapshot, study_area = setup_sim(parameters_file)

    inspector = Inspector(
        simulator,
        snapshot,
        snapshot_folder=f"data/processed_data/{study_area}/snapshot/",
        # Number of visualized connections per person
        nlines=4,
        window_name=study_area,
        width=2560,
        height=1440,
    )
    while inspector.is_active():
        inspector.update()


if __name__ == "__main__":
    main()
