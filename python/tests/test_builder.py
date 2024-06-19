import pytest
from uatk_spc.builder import unnest_pandas, unnest_polars

TEST_PARAMS = [
    ("protobuf", "pandas"),
    ("protobuf", "polars"),
    ("parquet", "pandas"),
    ("parquet", "polars"),
]
TEST_PARAMS_PANDAS = [
    ("protobuf", "pandas"),
    ("parquet", "pandas"),
]
TEST_PARAMS_POLARS = [
    ("protobuf", "polars"),
    ("parquet", "polars"),
]
TEST_PARAMS_PAIRED = [
    ("protobuf", "protobuf"),
    ("parquet", "parquet"),
]

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


@pytest.mark.parametrize("reader", TEST_PARAMS_PANDAS, indirect=True)
def test_unnest_pandas_data(reader):
    spc_unnested = unnest_pandas(reader.households, ["details"])
    assert sorted(spc_unnested.columns.to_list()) == sorted(EXPECTED_COLUMNS)


@pytest.mark.parametrize("reader", TEST_PARAMS_POLARS, indirect=True)
def test_unnest_polars_data(reader):
    spc_unnested = unnest_polars(reader.households, ["details"])
    assert sorted(spc_unnested.columns) == sorted(EXPECTED_COLUMNS)


@pytest.mark.parametrize(
    ("builder_pandas", "builder_polars"), TEST_PARAMS_PAIRED, indirect=True
)
def test_add_households(builder_pandas, builder_polars):
    df_pandas = builder_pandas.add_households().unnest(["details"]).build()
    df_polars = builder_polars.add_households().unnest(["details"]).build()
    # Check no duplicate columns
    assert len(set(df_pandas.columns.to_list())) == len(df_pandas.columns.to_list())
    assert len(set(df_polars.columns)) == len(df_polars.columns)
    # Order is not guaranteed but the same set of columns is expected
    assert set(df_pandas.columns.to_list()) == set(df_polars.columns)


@pytest.mark.parametrize("builder", TEST_PARAMS, indirect=True)
def test_column_overlap_exception(builder):
    # Exception: ovelapping 'nssec8' without `rsuffix`
    with pytest.raises(Exception):
        builder.add_households().unnest(["demographics", "details"]).build()


@pytest.mark.parametrize("builder", TEST_PARAMS, indirect=True)
def test_column_overlap_ok(builder):
    # Ok: ovelapping 'nssec8' with `rsuffix` specified
    df = (
        builder.add_households()
        .unnest(["demographics", "details"], rsuffix="_household")
        .build()
    )
    assert all([col in df.columns for col in ["nssec8", "nssec8_household"]])


@pytest.mark.parametrize(
    ("builder_pandas", "builder_polars"), TEST_PARAMS_PAIRED, indirect=True
)
def test_time_use_diaries_pandas(builder_pandas, builder_polars):
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
    df_polars = builder_polars.add_time_use_diaries(features).build()
    df_pandas = builder_pandas.add_time_use_diaries(features).build()
    assert df_polars.columns == df_pandas.columns.to_list()
