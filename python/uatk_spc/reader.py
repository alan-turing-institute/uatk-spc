import gzip
import json
import os
import shutil
import tarfile
import urllib.request
from tempfile import mkdtemp
from typing import Any, Dict, List, Tuple

import pandas as pd
import polars as pl
import uatk_spc.synthpop_pb2 as synthpop_pb2
from google.protobuf.json_format import MessageToDict
from typing_extensions import deprecated

# Type alias for a dataframe
DataFrame = pd.DataFrame | pl.DataFrame


class BackendError(Exception):
    """Reusable error for backend error."""

    def __init__(self, backend: str):
        self.message = (
            f"Backend: {backend} is not implemented. Use 'polars' or 'pandas' instead."
        )


def is_parquet(filepath: str) -> bool:
    return filepath.endswith(".tar.gz") | filepath.endswith(".tar")


def is_protobuf(filepath: str) -> bool:
    return filepath.endswith(".pb.gz") | filepath.endswith(".pb")


def download_and_unzip(url: str) -> str:
    """Downloads and unzips a gzip url to protobuf or tar."""
    response = urllib.request.urlopen(url)
    filename = url.split("/")[-1]
    tmp_dir = mkdtemp()
    filepath = os.path.join(tmp_dir, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(response, f)
    unzipped_filepath = filepath.replace(".gz", "")
    with gzip.open(filepath, "rb") as fin, open(unzipped_filepath, "wb") as fout:
        shutil.copyfileobj(fin, fout)
    return unzipped_filepath


def get_path_and_region(filepath: str) -> Tuple[str, str]:
    """Gets path and region from a given filepath (extracting if tar)."""
    filepath_split = filepath.split("/")
    path = "/".join(filepath_split[:-1])
    if filepath.endswith(".tar"):
        with tarfile.open(filepath, "r:") as tar:
            tar.extractall(path)
    region = filepath_split[-1].split(".")[0]
    return path, region


def filepath_to_path_and_region(filepath: str) -> Tuple[str, str]:
    """
    Returns path and region for a given filepath, including download
    and unzip of URL filepaths.
    """
    if filepath.startswith("http://") | filepath.startswith("https://"):
        filepath = download_and_unzip(filepath)
    return get_path_and_region(filepath)


class Reader:
    """
    A class for reading from parquet and JSON into ready to use data structures.

    Attributes:
        population (synthpop_pb2.Population | None): Deserilized protobuf population.
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        households (pd.DataFrame | pl.DataFrame): Households in tabular format.
        people (pd.DataFrame | pl.DataFrame): People in tabular format.
        time_use_diaries (pd.DataFrame | pl.DataFrame): Time use diaries in tabular
            format.
        venues_per_activity (Dict[str, Any]): Venues per activity as a Python dict.
        info_per_msoa (Dict[str, Any]): Info per MSOA as a Python dict.
        backend (str): DataFrame backend being used, must be either 'polars' or
            'pandas'.
    """

    population: synthpop_pb2.Population | None
    people: DataFrame
    households: DataFrame
    time_use_diaries: DataFrame
    venues_per_activity: DataFrame
    info_per_msoa: dict
    backend: str

    def __init__(
        self,
        path: str | None = None,
        region: str | None = None,
        filepath: str | None = None,
        input_type: str = "parquet",
        backend: str = "polars",
    ):
        self.backend = backend
        if filepath is None:
            if path is None or region is None:
                msg = (
                    "If no 'filepath' is provided, 'path' and 'region' must not be "
                    "`None`"
                )
                raise ValueError(msg)
            if input_type == "parquet" or input_type == "pq":
                self.__init_parquet(path, region, backend=backend)
            elif input_type == "protobuf" or input_type == "pb":
                self.__init_protobuf(path, region, backend=backend)
            else:
                raise ValueError(
                    f"Input type {input_type} is not implemented. Use 'parquet' ('pq') "
                    f"or 'protobuf' ('pb') instead."
                )
        else:
            if path is not None or region is not None:
                msg = "If 'filepath' is provided, 'path' and 'region' must be `None`"
                raise ValueError(msg)
            if is_parquet(filepath):
                self.__init_parquet(filepath=filepath, backend=backend)
            elif is_protobuf(filepath):
                self.__init_protobuf(filepath=filepath, backend=backend)
            else:
                raise ValueError(
                    f"Provided filepath ({filepath}) must be either 'protobuf' "
                    f"('.pb' or '.pb.gz') or 'parquet' ('.tar' or '.tar.gz')"
                )

    def __init_protobuf(
        self,
        path: str | None = None,
        region: str | None = None,
        filepath: str | None = None,
        backend: str = "polars",
    ):
        """Init from a protobuf output."""
        if filepath is not None:
            path_ = os.path.join(*filepath_to_path_and_region(filepath))
        elif path is not None and region is not None:
            path_ = os.path.join(path, region)
        else:
            msg = "A filepath or a path and region must be provided."
            raise ValueError(msg)
        self.pop = Reader.read_pop(os.path.join(path_ + ".pb"))
        pop_as_dict = MessageToDict(
            self.pop,
            preserving_proto_field_name=True,
            including_default_value_fields=True,
        )
        venues_per_activity_as_rows = [
            row
            for key in pop_as_dict["venues_per_activity"]
            for row in pop_as_dict["venues_per_activity"][key]["venues"]
        ]
        if backend == "polars":
            self.households = pl.from_records(pop_as_dict["households"])
            self.people = pl.from_records(pop_as_dict["people"])
            self.time_use_diaries = pl.from_records(pop_as_dict["time_use_diaries"])
            self.venues_per_activity = pl.from_records(venues_per_activity_as_rows)
        elif backend == "pandas":
            self.households = pd.DataFrame.from_records(pop_as_dict["households"])
            self.people = pd.DataFrame.from_records(pop_as_dict["people"])
            self.time_use_diaries = pd.DataFrame.from_records(
                pop_as_dict["time_use_diaries"]
            )
            self.venues_per_activity = pd.DataFrame.from_records(
                venues_per_activity_as_rows
            )
        else:
            raise BackendError(backend)

        self.info_per_msoa = pop_as_dict["info_per_msoa"]

    @classmethod
    def read_pop(cls, file_name: str) -> synthpop_pb2.Population:
        pop = synthpop_pb2.Population()
        with open(file_name, "rb") as f:
            pop.ParseFromString(f.read())
            f.close()
        return pop

    def __init_parquet(
        self,
        path: str | None = None,
        region: str | None = None,
        filepath: str | None = None,
        backend: str = "polars",
    ):
        if filepath is not None:
            path_ = os.path.join(*filepath_to_path_and_region(filepath))
        elif path is not None and region is not None:
            path_ = os.path.join(path, region)
        else:
            msg = "A filepath or a path and region must be provided."
            raise ValueError(msg)

        if backend == "polars":
            self.households = pl.read_parquet(path_ + "_households.parquet")
            self.people = pl.read_parquet(path_ + "_people.parquet")
            self.time_use_diaries = pl.read_parquet(path_ + "_time_use_diaries.parquet")
            self.venues_per_activity = pl.read_parquet(path_ + "_venues.parquet")
            self.backend = "polars"
        elif backend == "pandas":
            self.households = pd.read_parquet(path_ + "_households.parquet")
            self.people = pd.read_parquet(path_ + "_people.parquet")
            self.time_use_diaries = pd.read_parquet(path_ + "_time_use_diaries.parquet")
            self.venues_per_activity = pd.read_parquet(path_ + "_venues.parquet")
            self.backend = "pandas"
        else:
            raise BackendError(backend)

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

    @deprecated("Use `Builder` class instead of `Reader` for merge operations.")
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
            raise BackendError(self.backend)

    @deprecated("Use `Builder` class instead of `Reader` for merge operations.")
    def merge_people_and_time_use_diaries(
        self, people_features: Dict[str, List[str]], diary_type: str = "weekday_diaries"
    ) -> DataFrame:
        if self.backend != "polars":
            raise ValueError("Method only implemented for 'polars' backend.")
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
                .cast(people.dtypes[people.get_column_index(diary_type)])
                .to_frame(),
            ],
            how="horizontal",
        )
        return people.join(
            time_use_diaries_with_idx, left_on=diary_type, right_on="index"
        )
