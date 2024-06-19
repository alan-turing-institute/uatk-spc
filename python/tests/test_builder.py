import pytest
from test_utils import TEST_URL_PB, TEST_URL_PQ
from uatk_spc.builder import Builder

TEST_PARAMS = [
    ("protobuf", "pandas"),
    ("protobuf", "polars"),
    ("parquet", "pandas"),
    ("parquet", "polars"),
]
TEST_PARAMS_PAIRED = [
    ("protobuf", "protobuf"),
    ("parquet", "parquet"),
]


@pytest.fixture
def builder(request):
    input_type, backend = request.param
    if input_type == "parquet":
        return Builder(filepath=TEST_URL_PQ, backend=backend)
    else:
        return Builder(filepath=TEST_URL_PB, backend=backend)


@pytest.fixture
def builder_pandas(request):
    input_type = request.param
    if input_type == "parquet":
        return Builder(filepath=TEST_URL_PQ, backend="pandas")
    else:
        return Builder(filepath=TEST_URL_PB, backend="pandas")


@pytest.fixture
def builder_polars(request):
    input_type = request.param
    if input_type == "parquet":
        return Builder(filepath=TEST_URL_PQ, backend="polars")
    else:
        return Builder(filepath=TEST_URL_PB, backend="polars")


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
