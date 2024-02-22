from typing import Dict, List

import pandas as pd
import polars as pl
from typing_extensions import Self
from uatk_spc.reader import DataFrame, Reader, backend_error


def unnest(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Unnests a list of columns in a pandas dataframe."""
    for column in columns:
        df = df.drop(columns=column).join(
            pd.json_normalize(df[column]).set_index(df.index)
        )
    return df


class Builder(Reader):
    """
    A class for building a flat dataset starting from peeopl per row and combining
    additional population fields.

    Attributes:
        data (DataFrame | None): DataFrame that is being built.
        backend (str): DataFrame backend being used, must be either 'polars' or
            'pandas'.
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
        self.backend = backend

    def add_households(self) -> Self:
        """Joins households to the dataframe being built."""
        if self.backend == "polars":
            self.data = self.data.unnest("identifiers").join(
                self.households,
                left_on="household",
                right_on="id",
                how="left",
            )
            return self
        elif self.backend == "pandas":
            self.data = (
                unnest(self.data, ["identifiers"])
                .merge(
                    self.households,
                    left_on="household",
                    right_on="id",
                    how="left",
                    suffixes=("", "_right"),
                )
                .drop(columns=["id_right"])
            )

            return self
        else:
            raise backend_error(self.backend)

    def add_time_use_diaries(
        self, features: Dict[str, List[str]], diary_type: str = "weekday_diaries"
    ) -> Self:
        """
        Joins time use diaries to the dataframe being built, exploding rows to a
        persons's activities on a given day .

        Args:
            features (Dict[str, List[str]]): dictionary of columns with nested
                features to retain.
            diary_type (str): Either 'weekday_diaries' or 'weekend_diaries'.

        """
        # TODO: refactor so select and unnest are distinct build calls.
        # Get a list of all columns
        all_columns = [el for (_, features) in features.items() for el in features]
        if self.backend == "polars":
            people = (
                self.data.unnest(features.keys())
                .select(["id", "household"] + all_columns + [diary_type])
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
            # Drop columns present already
            duplicate_feature_columns = [
                col for col in time_use_diaries_with_idx.columns if col in all_columns
            ]
            time_use_diaries_with_idx = time_use_diaries_with_idx.drop(
                duplicate_feature_columns
            )

            self.data = people.join(
                time_use_diaries_with_idx, left_on=diary_type, right_on="index"
            )
        elif self.backend == "pandas":
            people = (
                unnest(self.data, features.keys())
                .loc[
                    :,
                    ["id", "household"] + all_columns + [diary_type],
                ]
                .explode(diary_type)
            )
            # Drop columns present already
            duplicate_feature_columns = [
                col for col in self.time_use_diaries.columns if col in all_columns
            ]
            self.data = (
                people.merge(
                    self.time_use_diaries.drop(columns=duplicate_feature_columns),
                    left_on=diary_type,
                    right_index=True,
                )
                .sort_values("id")
                .reset_index(drop=True)
            )
        return self

    def unnest(self, columns: List[str]) -> Self:
        """Unnests the given columns."""
        if self.backend == "polars":
            self.data = self.data.unnest(columns)
        elif self.backend == "pandas":
            self.data = unnest(self.data, columns)
        else:
            backend_error(self.backend)
        return self

    def select(self, columns: List[str]) -> Self:
        """Select subset of columns."""
        if self.backend == "polars":
            self.data = self.data.select(columns)
        elif self.backend == "pandas":
            self.data = self.data.loc[:, columns]
        else:
            backend_error(self.backend)
        return self

    def build(self) -> DataFrame:
        """Returns the final built DataFrame."""
        return self.data
