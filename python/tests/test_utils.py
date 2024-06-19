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
def reader(request):
    input_type, backend = request.param
    if input_type == "parquet":
        return Reader(filepath=TEST_URL_PQ, backend=backend)
    else:
        return Reader(filepath=TEST_URL_PB, backend=backend)


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
