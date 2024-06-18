import pytest
from uatk_spc.builder import Builder
from uatk_spc.reader import Reader

TEST_URL_PB = (
    "https://ramp0storage.blob.core.windows.net/test-spc-output/test_region.pb.gz"
)
TEST_URL_PQ = (
    "https://ramp0storage.blob.core.windows.net/test-spc-output/test_region.tar.gz"
)


@pytest.fixture
def spc_pandas_parquet():
    return Reader(filepath=TEST_URL_PQ, backend="pandas", input_type="parquet")


@pytest.fixture
def spc_polars_parquet():
    return Reader(filepath=TEST_URL_PQ, backend="polars", input_type="parquet")


@pytest.fixture
def spc_pandas_protobuf():
    return Reader(filepath=TEST_URL_PB, backend="pandas", input_type="protobuf")


@pytest.fixture
def spc_polars_protobuf():
    return Reader(filepath=TEST_URL_PB, backend="polars", input_type="protobuf")


def builder_pandas_parquet():
    return Builder(filepath=TEST_URL_PQ, backend="pandas", input_type="parquet")


def builder_polars_parquet():
    return Builder(filepath=TEST_URL_PQ, backend="polars", input_type="parquet")


def builder_pandas_protobuf():
    return Builder(filepath=TEST_URL_PB, backend="pandas", input_type="protobuf")


def builder_polars_protobuf():
    return Builder(filepath=TEST_URL_PB, backend="polars", input_type="protobuf")
