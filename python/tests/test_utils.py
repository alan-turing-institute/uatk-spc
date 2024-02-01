import os
import pathlib

def get_path():
    return pathlib.Path(os.path.abspath(__file__)).parent.joinpath("data/")


TEST_REGION = "test_region"
TEST_PATH = get_path()


