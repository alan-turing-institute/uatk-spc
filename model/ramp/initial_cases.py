import pandas as pd
import numpy as np
import os
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
        self.initial_cases = pd.read_csv(f"../model_parameters/Input_{study_area}.csv")

        self.people_df = pd.DataFrame(
            {"area_code": area_codes, "not_home_prob": not_home_probs}
        )

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
