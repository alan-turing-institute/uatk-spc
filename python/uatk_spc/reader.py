from typing import Any, Dict
from google.protobuf.json_format import MessageToDict
import polars as pl
import uatk_spc.synthpop_pb2 as synthpop_pb2
import json


# TODO:
# - Add flexible dataframe backend (e.g. pandas, polars)
# - Add graph data structure reading for flows (e.g. into networkx)
# - Add functionality for simplified merging of the different tables (e.g. people with time use diaries)




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
    people: pl.DataFrame
    households: pl.DataFrame
    time_use_diaries: pl.DataFrame
    venues_per_activity: Dict[str, Any]
    info_per_msoa: Dict[str, Any]

    def __init__(self, path: str):
        """Init from a path and region."""
        self.pop = SPCReaderProto.read_pop(path)
        pop_as_dict = MessageToDict(self.pop, including_default_value_fields=True)
        self.households = pl.from_records(pop_as_dict["households"])
        self.people = pl.from_records(pop_as_dict["people"])
        self.time_use_diaries = pl.from_records(pop_as_dict["timeUseDiaries"])
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
    """
    people: pl.DataFrame
    households: pl.DataFrame
    time_use_diaries: pl.DataFrame
    venues_per_activity: pl.DataFrame
    info_per_msoa: dict

    def __init__(self, path: str):
        path_ = path.split(".pb")[0]
        self.households = pl.read_parquet(path_ + "_households.pq")
        self.people = pl.read_parquet(path_ + "_people.pq")
        self.time_use_diaries = pl.read_parquet(path_ + "_time_use_diaries.pq")
        self.venues_per_activity = pl.read_parquet(path_ + "_venues.pq")
        with open(path_ + "_info_per_msoa.json", "rb") as f:
            self.info_per_msoa = json.loads(f.read())
