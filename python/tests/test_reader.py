import pytest
from test_utils import EXPECTED_COLUMNS, TEST_URL_PB, TEST_URL_PQ
from uatk_spc.builder import unnest_pandas, unnest_polars
from uatk_spc.reader import Reader, filepath_to_path_and_region, is_parquet, is_protobuf

TEST_PARAMS_POLARS = [("parquet", "polars"), ("protobuf", "polars")]
TEST_PARAMS_PANDAS = [
    ("protobuf", "pandas"),
    ("parquet", "pandas"),
]


@pytest.fixture
def reader(request):
    input_type, backend = request.param
    if input_type == "parquet":
        return Reader(filepath=TEST_URL_PQ, backend=backend)
    else:
        return Reader(filepath=TEST_URL_PB, backend=backend)


def test_is_parquet():
    assert is_parquet(TEST_URL_PQ)
    assert not is_parquet(TEST_URL_PB)


def test_is_protobuf():
    assert is_protobuf(TEST_URL_PB)
    assert not is_protobuf(TEST_URL_PQ)


@pytest.mark.parametrize("filepath", [TEST_URL_PB, TEST_URL_PQ])
def test_filepath_to_path_and_region(filepath):
    _, region = filepath_to_path_and_region(filepath)
    assert region == "test_region"


@pytest.mark.parametrize("filepath", [TEST_URL_PB, TEST_URL_PQ])
def test_reader(filepath):
    spc = Reader(filepath=filepath)
    print(spc.people)
    assert spc.people.shape[0] == 4991


@pytest.mark.parametrize("reader", TEST_PARAMS_POLARS, indirect=True)
def test_merge_people_and_time_use_diaries(reader):
    merged = reader.merge_people_and_time_use_diaries(
        {"health": ["bmi"], "demographics": ["age_years"]}, diary_type="weekday_diaries"
    )
    assert merged.shape == (197_397, 30)


@pytest.mark.parametrize("reader", TEST_PARAMS_POLARS, indirect=True)
def test_merge_people_and_households(reader):
    merged = reader.merge_people_and_households()
    assert merged.shape == (4991, 17)


@pytest.mark.parametrize("reader", TEST_PARAMS_PANDAS, indirect=True)
def test_unnest_pandas_data(reader):
    spc_unnested = unnest_pandas(reader.households, ["details"])
    assert sorted(spc_unnested.columns.to_list()) == sorted(EXPECTED_COLUMNS)


@pytest.mark.parametrize("reader", TEST_PARAMS_POLARS, indirect=True)
def test_unnest_polars_data(reader):
    spc_unnested = unnest_polars(reader.households, ["details"])
    assert sorted(spc_unnested.columns) == sorted(EXPECTED_COLUMNS)
