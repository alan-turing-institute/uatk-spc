import json
import os
from typing import Any, Dict, List

import pandas as pd
import polars as pl
import uatk_spc.synthpop_pb2 as synthpop_pb2
from google.protobuf.json_format import MessageToDict

# TODO:
# - Add graph data structure reading for flows (e.g. into networkx)


# Type alias for a dataframe
DataFrame = pd.DataFrame | pl.DataFrame


def backend_error(backend: str) -> ValueError:
    ValueError(
        f"Backend: {backend} is not implemented. Use 'polars' or 'pandas' instead."
    )


# TODO: refactor with single class handling either proto or parquet
class SPCReaderProto:
    """
    A class for reading from protobuf into ready to use data structures.

    Attributes:
        pop (Population): Deserialized protobuf population.
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        households (pd.DataFrame | pl.DataFrame): Households in tabular format.
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        time_use_diaries (pd.DataFrame | pl.DataFrame): Time use diaries in tabular
            format.
        venues_per_activity (Dict[str, Any]): Venues per activity as a Python dict.
        info_per_msoa (Dict[str, Any]): Info per MSOA as a Python dict.
    """

    pop: synthpop_pb2.Population()
    people: DataFrame
    households: DataFrame
    time_use_diaries: DataFrame
    venues_per_activity: Dict[str, Any]
    info_per_msoa: Dict[str, Any]

    def __init__(self, path: str, region: str, backend="polars"):
        """Init from a path and region."""
        self.pop = SPCReaderProto.read_pop(os.path.join(path, region + ".pb"))
        pop_as_dict = MessageToDict(self.pop, including_default_value_fields=True)
        if backend == "polars":
            self.households = pl.from_records(pop_as_dict["households"])
            self.people = pl.from_records(pop_as_dict["people"])
            self.time_use_diaries = pl.from_records(pop_as_dict["timeUseDiaries"])
        elif backend == "pandas":
            self.households = pd.DataFrame.from_records(pop_as_dict["households"])
            self.people = pd.DataFrame.from_records(pop_as_dict["people"])
            self.time_use_diaries = pd.DataFrame.from_records(
                pop_as_dict["timeUseDiaries"]
            )
        else:
            raise backend_error(backend)

        self.venues_per_activity = pop_as_dict["venuesPerActivity"]
        self.info_per_msoa = pop_as_dict["infoPerMsoa"]

    @classmethod
    def read_pop(cls, file_name: str) -> synthpop_pb2.Population():
        pop = synthpop_pb2.Population()
        with open(file_name, "rb") as f:
            pop.ParseFromString(f.read())
            f.close()
        return pop


class SPCReaderParquet:
    """
    A class for reading from parquet and JSON into ready to use data structures.

    Attributes:
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        households (pd.DataFrame | pl.DataFrame): Households in tabular format.
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        time_use_diaries (pd.DataFrame | pl.DataFrame): Time use diaries in tabular
            format.
        venues_per_activity (Dict[str, Any]): Venues per activity as a Python dict.
        info_per_msoa (Dict[str, Any]): Info per MSOA as a Python dict.
        backend (str): DataFrame backend being used, must be either 'polars' or
            'pandas'
    """

    people: DataFrame
    households: DataFrame
    time_use_diaries: DataFrame
    venues_per_activity: DataFrame
    info_per_msoa: dict
    backend: str

    def __init__(self, path: str, region: str, backend="polars"):
        path_ = os.path.join(path, region)
        if backend == "polars":
            self.households = pl.read_parquet(path_ + "_households.pq")
            self.people = pl.read_parquet(path_ + "_people.pq")
            self.time_use_diaries = pl.read_parquet(path_ + "_time_use_diaries.pq")
            self.venues_per_activity = pl.read_parquet(path_ + "_venues.pq")
            self.backend = "polars"
        elif backend == "pandas":
            self.households = pd.read_parquet(path_ + "_households.pq")
            self.people = pd.read_parquet(path_ + "_people.pq")
            self.time_use_diaries = pd.read_parquet(path_ + "_time_use_diaries.pq")
            self.venues_per_activity = pd.read_parquet(path_ + "_venues.pq")
            self.backend = "pandas"
        else:
            raise backend_error(backend)

        with open(path_ + "_info_per_msoa.json", "rb") as f:
            self.info_per_msoa = json.loads(f.read())

    def __summary(self, df: DataFrame) -> Dict[str, List[Any]]:
        return dict(zip(df.columns, df.dtypes))

    def summary(self, field: str) -> Dict[str, List[Any]] | None:
        """Provides a summary of the given SPC field.

        Args:
            field (str): The name of the field to provide a summary of.

        Returns:
            If applicable, a dictionary of column names and the associated dtype of the
            column.

        """
        if field == "people":
            print(f"Shape: {self.people.shape}")
            return self.__summary(self.people)
        elif field == "households":
            print(f"Shape: {self.households.shape}")
            return self.__summary(self.households)
        elif field == "venues_per_activity":
            print(f"Shape: {self.venues_per_activity.shape}")
            return self.__summary(self.venues_per_activity)
        elif field == "time_use_diaries":
            print(f"Shape: {self.time_use_diaries.shape}")
            return self.__summary(self.time_use_diaries)
        elif field == "info_per_msoa":
            print(json.dumps(self.info_per_msoa, indent=2, sort_keys=True))
            return
        else:
            raise (
                ValueError(
                    f"'{field}' field does not exist. Choose one of: ['people', "
                    f"'households', 'time_use_diaries', 'venues_per_activity', "
                    f"'info_per_msoa']"
                )
            )

    def merge(self, left: str, right: str, **kwargs) -> DataFrame:
        """Merges a left and right fields from SPC."""
        # TODO: add implementation for any pair of fields
        pass

    def merge_people_and_households(self) -> DataFrame:
        if self.backend == "polars":
            return self.people.unnest("identifiers").join(
                self.households, left_on="household", right_on="id", how="left"
            )
        elif self.backend == "pandas":
            # TODO: handle duplicate column names ("id")
            return (
                self.people.drop(columns=["identifiers"])
                .join(pd.json_normalize(self.people["identifiers"]))
                .merge(self.households, left_on="household", right_on="id", how="left")
            )
        else:
            raise backend_error(self.backend)

    def merge_people_and_time_use_diaries(
        self, people_features: Dict[str, List[str]], diary_type: str = "weekday_diaries"
    ) -> DataFrame:
        people = (
            self.people.unnest(people_features.keys())
            .select(
                ["id", "household"]
                + [el for (_, features) in people_features.items() for el in features]
                + [diary_type]
            )
            .explode(diary_type)
        )
        time_use_diaries_with_idx = pl.concat(
            [
                self.time_use_diaries,
                pl.int_range(0, self.time_use_diaries.shape[0], eager=True)
                .rename("index")
                .cast(pl.UInt64)
                .to_frame(),
            ],
            how="horizontal",
        )
        return people.join(
            time_use_diaries_with_idx, left_on=diary_type, right_on="index"
        )
