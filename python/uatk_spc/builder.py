from typing import Dict, List, Self

import pandas as pd
import polars as pl
from uatk_spc.reader import DataFrame, SPCReader, backend_error


class Builder(SPCReader):
    """
    A class for building a flat dataset starting from peeopl per row and combining
    additional population fields.

    Attributes:
        data (DataFrame | None): DataFrame that is being built.
    """

    data: DataFrame | None

    def __init__(
        self,
        path: str,
        region: str,
        input_type: str = "parquet",
        backend: str = "polars",
    ):
        super().__init__(path, region, input_type, backend)
        self.data = self.people

    def add_households(self) -> Self:
        if self.backend == "polars":
            self.data = self.data.unnest("identifiers").join(
                self.households, left_on="household", right_on="id", how="left"
            )
            return self
        elif self.backend == "pandas":
            # TODO: handle duplicate column names ("id")
            self.data = (
                self.data.drop(columns=["identifiers"])
                .join(pd.json_normalize(self.people["identifiers"]))
                .merge(self.households, left_on="household", right_on="id", how="left")
            )
            return self
        else:
            raise backend_error(self.backend)

    def add_time_use_diaries(
        self, features: Dict[str, List[str]], diary_type: str = "weekday_diaries"
    ) -> Self:
        people = (
            self.data.unnest(features.keys())
            .select(
                ["id", "household"]
                + [el for (_, features) in features.items() for el in features]
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
        self.data = people.join(
            time_use_diaries_with_idx, left_on=diary_type, right_on="index"
        )
        return self

    def unnest(self, features: List[str]) -> Self:
        # TODO: unnest object/struct columns
        pass

    def select(self, features: List[str]) -> Self:
        """Select column subset of features from people."""
        # TODO: select columns
        pass

    def build(self) -> DataFrame:
        """Returns the final built DataFrame."""
        return self.data
