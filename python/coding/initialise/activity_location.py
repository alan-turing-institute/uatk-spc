from typing import List

import pandas as pd

from coding.constants import ColumnNames


class ActivityLocation():
    """Class to represent information about activity locations, e.g. retail destinations, workpaces, etc."""
    def __init__(self, name: str, locations: pd.DataFrame, flows: pd.DataFrame,
                 individuals: pd.DataFrame, duration_col: str):
        """
        Initialise an ActivityLocation.

        IMPORTANT: the locations dataframe must be in the same order as columns in the flow matrix. For example,
        the first (e.g.) shop in the locations dataframe must have its flows stored in the first column in the
        matrix.

        :param name: A name to use to refer to this activity. Column names in the big DataFrame of individuals
        will be named according to this
        :param locations: A dataframe containing information about each location.
        :param flows: A dataframe containing the flows.
        :param individuals: The dataframe containing the individual population. This is needed because a new
        '*_DURATION' column will be added to that table to show how much time each individual spends doing
        this activity. The new column is added in place
        :param duration_col: The column in the 'individuals' dataframe that gives the proportion of time
        spend doing this activity. This needs to be renamed according to a standard format, e.g. for retail
        the column needs to be called 'RETAIL_DURATION'.
        """
        self._name = name
        # Check that the dataframe has all the standard columns needed
        if ColumnNames.LOCATION_ID not in locations.columns or \
            ColumnNames.LOCATION_DANGER not in locations.columns or \
            ColumnNames.LOCATION_NAME not in locations.columns:
            raise Exception(f"Activity '{name}' dataframe needs columns called 'ID' and 'Danger' and 'Location_Name'."
                            f"It only has: {locations.columns}")
        # Check that the DataFrame's ID column is also an index, this is to ensure that the IDs always
        # refer to the same thing. NO LONGER DOING THIS, INDEX AND ID CAN BE DIFFERENT        #
        #if locations.index.name != ColumnNames.LOCATION_ID or False in (locations.index == locations[ColumnNames.LOCATION_ID]):
        #                    f"that is equal to the 'ID' columns.")
        self._locations = locations
        self._flows = flows

        # Check that the duration column exists and create a new column showing the duration of this activity
        if duration_col not in individuals.columns:
            raise Exception(f"The duration column '{duration_col}' is not one of the columns in the individuals"
                            f"data frame: {individuals.columns}")
        self.duration_column = self._name + ColumnNames.ACTIVITY_DURATION
        individuals[self.duration_column] = individuals[duration_col]

    def __repr__(self):
        return f"<{self._name} ActivityLocation>"

    def get_dangers(self) -> List[float]:
        """Get the danger associated with each location as a list. These will be in the same order as the
        location IDs returned by `get_ids()`"""
        return list(self._locations[ColumnNames.LOCATION_DANGER])

    def get_name(self) -> str:
        """Get the name of this activity. This is used to label columns in the file of individuals"""
        return self._name

    def get_indices(self) -> List[int]:
        """Return the index (row number) of each destination
        Shouldn't need to know these. Use get_dangers or update_dangers instead
        """
        return list(self._locations.index)

    def get_dataframe_copy(self) -> pd.DataFrame:
        """
        Get a copy of the dataframe that underpins this ActivityLocation
        :return:
        """
        return self._locations.copy()

    def get_ids(self) -> List[int]:
        """Return the IDs of each destination.
        Shouldn't need to know these. Use get_dangers or update_dangers instead"""
        return list(self._locations[ColumnNames.LOCATION_ID])

    #def get_location(self, id: int) -> pd.DataFrame:
    #    """Get the location with the given id"""
    #    loc = self._locations.loc[self._locations[ColumnNames.LOCATION_ID] == id, :]
    #    if len(loc) != 1:
    #        raise Exception(f"Location with ID {id} does not return exactly one row: {loc}")
    #    return loc


    def update_dangers(self, dangers: List[float]):
        """
        Update the danger associated with each location
        :param dangers: A list of dangers for each location. Must be in the same order as the locations as
        returned by `get_ids`.
        """
        if len(dangers) != len(self._locations):
            raise Exception(f"The number of danger scores ({len(dangers)}) is not the same as the number of"
                            f"activity locations ({len(self._locations)}).")
        self._locations[ColumnNames.LOCATION_DANGER] = dangers