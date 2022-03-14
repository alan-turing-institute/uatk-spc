import numpy as np

from math import cos, pi


def latlon_to_km(locations, lat, lon):
    """Reprojects a numpy array of lat/lon locations to km offset from lat and lon.

    This is a local approximation around the provided center point, so should only be
    used over relatively small latitude ranges.

    Args:
        locations: A numpy array of 2 * nplaces float32 lat/lons.
        lat: The latitude to transform the coordinates around.
        lon: The longitude to transform the coordinates around.
    """
    # https://en.wikipedia.org/wiki/Latitude#Length_of_a_degree_of_latitude
    dlat = 110.574  # Approximate length in km of a degree of latitude
    # https://en.wikipedia.org/wiki/Longitude#Length_of_a_degree_of_longitude
    dlon = 111.320 * cos(
        lat * pi / 180.0
    )  # Approximate length of a degree of longitude
    reproj_locs = np.empty_like(locations)
    reproj_locs[0::2] = (locations[1::2] - lon) * dlon
    reproj_locs[1::2] = (locations[0::2] - lat) * dlat
    return reproj_locs
