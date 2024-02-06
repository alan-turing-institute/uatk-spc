from test_utils import TEST_PATH, TEST_REGION
from uatk_spc.builder import Builder, unnest
from uatk_spc.reader import SPCReader


def test_unnest_data():
    spc = SPCReader(TEST_PATH, TEST_REGION, backend="pandas")
    spc_unnested = unnest(spc.households, ["details"])
    assert spc_unnested.columns.to_list() == [
        "id",
        "msoa",
        "oa",
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


def test_add_households():
    df_pandas = (
        Builder(TEST_PATH, TEST_REGION, backend="pandas")
        .add_households()
        .unnest(["details"])
        .build()
    )
    df_polars = (
        Builder(TEST_PATH, TEST_REGION, backend="polars")
        .add_households()
        .unnest(["details"])
        .build()
    )
    # Check no duplicate columns
    assert len(set(df_pandas.columns.to_list())) == len(df_pandas.columns.to_list())
    assert len(set(df_polars.columns)) == len(df_polars.columns)
    # Order is not guaranteed but the same set of columns is expected
    assert set(df_pandas.columns.to_list()) == set(df_polars.columns)


def test_time_use_diaries_pandas():
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
        Builder(TEST_PATH, TEST_REGION, backend="polars")
        .add_time_use_diaries(features)
        .build()
    )
    df_pandas = (
        Builder(TEST_PATH, TEST_REGION, backend="pandas")
        .add_time_use_diaries(features)
        .build()
    )
    assert df_polars.columns == df_pandas.columns.to_list()
