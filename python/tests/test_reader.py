import os
import pathlib

from uatk_spc.reader import SPCReader


def get_path():
    return pathlib.Path(os.path.abspath(__file__)).parent.joinpath("data/")


TEST_REGION = "test_region"
TEST_PATH = get_path()


def test_reader():
    spc = SPCReader(TEST_PATH, TEST_REGION)
    print(spc.people)
    assert spc.people.shape[0] == 4991


def test_merge_people_and_time_use_diaries():
    spc = SPCReader(TEST_PATH, TEST_REGION)
    merged = spc.merge_people_and_time_use_diaries(
        {"health": ["bmi"], "demographics": ["age_years"]}, diary_type="weekday_diaries"
    )
    assert merged.shape == (197_397, 30)


def test_merge_people_and_households():
    spc = SPCReader(TEST_PATH, TEST_REGION)
    merged = spc.merge_people_and_households()
    assert merged.shape == (4991, 18)
