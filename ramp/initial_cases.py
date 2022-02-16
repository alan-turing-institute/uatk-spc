import pandas as pd
import numpy as np
import os
from ramp.constants import Constants
from yaml import load, SafeLoader


class InitialCases:
    def __init__(self, area_codes, not_home_probs, parameters_file):
        """
        This class loads the initial cases data for seeding infections in the model.
        Once the data is loaded, it selects people at higher risk who
        spend more time outside of their home.
        """

        # load initial case data
        with open(parameters_file, "r") as f:
            parameters = load(f, Loader=SafeLoader)
            sim_params = parameters["microsim"]
        study_area = sim_params["study-area"]
        self.initial_cases = pd.read_csv(
            os.path.join(
                Constants.Paths.PARAMETERS.FULL_PATH, f"Input_{study_area}.csv"
            )
        )

        self.people_df = pd.DataFrame(
            {"area_code": area_codes, "not_home_prob": not_home_probs}
        )

        # combine into a single dataframe to allow easy filtering based on high risk area codes and
        # not home probabilities
        # people_df = pd.DataFrame({"area_code": area_codes,
        #                          "not_home_prob": not_home_probs})
        # people_df = people_df.merge(msoa_risks_df,
        #                            on="area_code")

        # get people_ids for people in high risk MSOAs and high not home probability
        # self.high_risk_ids = np.where((people_df["risk"] == "High") & (people_df["not_home_prob"] > 0.3))[0]

    # def get_seed_people_ids_for_day(self, day):
    #    """Randomly choose a given number of people ids from the high risk people"""
    #
    #    num_cases = self.initial_cases.loc[day, "num_cases"]
    #    if num_cases > self.high_risk_ids.shape[0]:  # if there aren't enough high risk individuals then return all of them
    #        return self.high_risk_ids
    #
    #    selected_ids = np.random.choice(self.high_risk_ids, num_cases, replace=False)
    #
    #    # remove people from high_risk_ids so they are not chosen again
    #    self.high_risk_ids = np.setdiff1d(self.high_risk_ids, selected_ids)
    #
    #    return selected_ids

    def get_seed_people_ids(self):
        """Randomly choose a given number of people ids among the MSOAs with positive cases"""

        selected_ids = []
        for i in range(len(self.initial_cases)):
            high_risk_ids = np.where(
                (self.people_df.area_code == self.initial_cases.MSOA11CD[i])
                & (self.people_df.not_home_prob > 0.3)
            )[0]
            if (
                self.initial_cases.cases[i] > high_risk_ids.shape[0]
            ):  # if there aren't enough high risk individuals then return all of them
                selected_ids = selected_ids + list(high_risk_ids)
            else:
                rng = np.random.default_rng(12345)
                selected_ids = selected_ids + list(
                    rng.choice(
                        high_risk_ids, self.initial_cases.cases[i], replace=False
                    )
                )

        return selected_ids
