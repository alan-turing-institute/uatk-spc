# You may need to 'pip install' some extra dependencies, or run in a
# conda/poetry environment.

import click
import pandas as pd
import plotly.express as px
import synthpop_pb2


@click.command()
@click.option("--input_path", required=True, help="path to an SPC .pb file")
def draw_venues(input_path):
    """Draw a dot per venue, colored by activity."""
    print(f"Reading {input_path}")
    pop = synthpop_pb2.Population()
    f = open(input_path, "rb")
    pop.ParseFromString(f.read())
    f.close()

    dots = []
    for activity in pop.venues_per_activity.keys():
        for venue in pop.venues_per_activity[activity].venues:
            dots.append(
                (
                    venue.location.latitude,
                    venue.location.longitude,
                    synthpop_pb2.Activity.Name(activity),
                )
            )

    # This is some public Mapbox token I copied from somewhere. It works for me
    # now, but it might eventually expire
    px.set_mapbox_access_token(
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
    )
    df = pd.DataFrame(dots, columns=["latitude", "longitude", "activity"])
    fig = px.scatter_mapbox(df, lat="latitude", lon="longitude", color="activity")
    fig.show()


if __name__ == "__main__":
    draw_venues()
