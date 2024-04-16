import itertools

import pytest
from test_utils import TEST_PATH, TEST_REGION
from uatk_spc.builder import Builder, unnest_pandas, unnest_polars
from uatk_spc.reader import Reader

BACKENDS = ["pandas", "polars"]
INPUT_TYPES = ["protobuf", "parquet"]
PRODUCT = itertools.product(*[INPUT_TYPES, BACKENDS])

EXPECTED_COLUMNS = [
    "id",
    "msoa11cd",
    "oa11cd",
    "members",
    "hid",
    "nssec8",
    "accommodation_type",
    "communal_type",
    "num_rooms",
    "central_heat",
    "tenure",
    "num_cars",
]


@pytest.mark.parametrize("input_type", INPUT_TYPES)
def test_unnest_pandas_data(input_type):
    spc = Reader(TEST_PATH, TEST_REGION, input_type, backend="pandas")
    spc_unnested = unnest_pandas(spc.households, ["details"])
    assert sorted(spc_unnested.columns.to_list()) == sorted(EXPECTED_COLUMNS)


@pytest.mark.parametrize("input_type", INPUT_TYPES)
def test_unnest_polars_data(input_type):
    spc = Reader(TEST_PATH, TEST_REGION, input_type, backend="polars")
    spc_unnested = unnest_polars(spc.households, ["details"])
    assert sorted(spc_unnested.columns) == sorted(EXPECTED_COLUMNS)


@pytest.mark.parametrize("input_type", INPUT_TYPES)
def test_add_households(input_type):
    df_pandas = (
        Builder(TEST_PATH, TEST_REGION, input_type, backend="pandas")
        .add_households()
        .unnest(["details"])
        .build()
    )
    df_polars = (
        Builder(TEST_PATH, TEST_REGION, input_type, backend="polars")
        .add_households()
        .unnest(["details"])
        .build()
    )
    # Check no duplicate columns
    assert len(set(df_pandas.columns.to_list())) == len(df_pandas.columns.to_list())
    assert len(set(df_polars.columns)) == len(df_polars.columns)
    # Order is not guaranteed but the same set of columns is expected
    assert set(df_pandas.columns.to_list()) == set(df_polars.columns)


@pytest.mark.parametrize(("input_type", "backend"), PRODUCT)
def test_column_overlap(input_type, backend):
    # Exception: ovelapping 'nssec8' without `rsuffix`
    with pytest.raises(Exception):
        df = (
            Builder(TEST_PATH, TEST_REGION, input_type, backend)
            .add_households()
            .unnest(["demographics", "details"])
            .build()
        )
    # Ok: ovelapping 'nssec8' with `rsuffix` specified
    df = (
        Builder(TEST_PATH, TEST_REGION, input_type, backend)
        .add_households()
        .unnest(["demographics", "details"], rsuffix="_household")
        .build()
    )
    assert all([col in df.columns for col in ["nssec8", "nssec8_household"]])


@pytest.mark.parametrize("input_type", INPUT_TYPES)
def test_time_use_diaries_pandas(input_type):
    features = {
        "health": [
            "bmi",
            "has_cardiovascular_disease",
            "has_diabetes",
            "has_high_blood_pressure",
            "self_assessed_health",
            "life_satisfaction",
        ],
        "demographics": ["age_years", "sex", "nssec8"],
        "employment": ["pwkstat", "salary_yearly"],
    }
    df_polars = (
        Builder(TEST_PATH, TEST_REGION, input_type, backend="polars")
        .add_time_use_diaries(features)
        .build()
    )
    df_pandas = (
        Builder(TEST_PATH, TEST_REGION, input_type, backend="pandas")
        .add_time_use_diaries(features)
        .build()
    )
    assert df_polars.columns == df_pandas.columns.to_list()
