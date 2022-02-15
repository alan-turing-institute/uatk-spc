import numpy as np
import imgui
import pandas as pd
from ramp.disease_statuses import DiseaseStatus


class Summary:
    """
    Class to hold the aggregate timeseries data for the simulation.
    Stores and visualises time series of counts of each disease status.
    """

    def __init__(self, snapshot, store_detailed_counts=False, max_time=365):
        """
        Create a summary with memory pre-allocated for max_time days.

        Parameters
        ----------
            snapshot: Snapshot
                snapshot data for the simulation, required for ages and area codes
            store_detailed_counts : bool
                whether to store aggregate counts for ages and area codes. **WARNING**: this causes a significant
                reduction in performance.
            max_time : int
                number of timesteps
        """

        self.max_time = max_time
        self.store_detailed_counts = store_detailed_counts

        # create empty arrays to hold total counts
        self.total_counts = [np.zeros(max_time, np.float32) for _ in range(len(DiseaseStatus))]

        if store_detailed_counts:
            # process age data into buckets
            ages = snapshot.buffers.people_ages
            age_thresholds = np.array([4, 12, 18, 24, 30, 65, 80, 200])
            age_bins = np.digitize(ages, age_thresholds)
            self.age_thresholds = age_thresholds

            # get integer ids for area code strings
            self.unique_area_codes = np.unique(snapshot.area_codes)

            self.area_code_id_lookup = {area_code: i for (i, area_code) in enumerate(self.unique_area_codes)}
            area_ids = np.array([self.area_code_id_lookup[area_code] for area_code in snapshot.area_codes],
                                dtype=np.uint32)

            self.individuals_df = pd.DataFrame({'status': np.zeros(snapshot.npeople),
                                                'age_bin': age_bins,
                                                'area_id': area_ids,
                                                })

            # create empty dicts to hold age and area counts
            # (use the string representation of the disease, e.g. DiseaseStatus.Exposed = 'exposed')

            self.age_counts = {str(d): np.zeros((len(age_thresholds), max_time)) for d in DiseaseStatus}
            self.area_counts = {str(d): np.zeros((len(self.unique_area_codes), max_time)) for d in DiseaseStatus}

        # fill arrays up to current time with constant values
        for i in range(snapshot.time):
            self.update(i, snapshot.buffers.people_statuses)

    def get_df_columns(self):
        return [f"Day{i}" for i in range(self.max_time)]

    def get_age_dataframes(self):
        columns = self.get_df_columns()
        age_counts_dict = {}
        for status, age_count_array in self.age_counts.items():
            age_counts_dict[status] = pd.DataFrame.from_records(age_count_array, columns=columns)
        return age_counts_dict

    def get_area_dataframes(self):
        columns = self.get_df_columns()
        area_counts_dict = {}
        for status, area_count_array in self.area_counts.items():
            area_counts_dict[status] = pd.DataFrame.from_records(area_count_array, columns=columns,
                                                                 index=self.unique_area_codes)
        return area_counts_dict

    def update(self, time, statuses):
        """Given an array of status enums, compute and save counts."""
        current_time = np.minimum(time, self.max_time-1)

        # store total counts by status
        unique_statuses, counts = np.unique(statuses, return_counts=True)
        for status, count in zip(unique_statuses, counts):
            self.total_counts[status][current_time] = np.float32(count)

        if self.store_detailed_counts:
            # update dataframe with new statuses
            self.individuals_df['status'] = statuses

            # store age counts
            for (age_bin, status), count in self.individuals_df.groupby(["age_bin", "status"]).size().iteritems():
                self.age_counts[DiseaseStatus(status).name.lower()][age_bin][current_time] = np.float32(count)

            # store area counts
            for (area_id, status), count in self.individuals_df.groupby(["area_id", "status"]).size().iteritems():
                self.area_counts[DiseaseStatus(status).name.lower()][area_id][current_time] = np.float32(count)

    def draw_plots(self, time, size):
        """Given current time and graph size, draw the imgui plots."""
        opts = {"graph_size": size, "scale_min": 0.0, "values_count": np.minimum(time, self.max_time-1)}
        imgui.plot_lines("", self.total_counts[0], overlay_text="\nSusceptible", **opts)
        imgui.plot_lines("", self.total_counts[1], overlay_text="\nExposed", **opts)
        imgui.plot_lines("", self.total_counts[2], overlay_text="\nPresymptomatic", **opts)
        imgui.plot_lines("", self.total_counts[3], overlay_text="\nAsymptomatic", **opts)
        imgui.plot_lines("", self.total_counts[4], overlay_text="\nSymptomatic", **opts)
        imgui.plot_lines("", self.total_counts[5], overlay_text="\nRecovered", **opts)
        imgui.plot_lines("", self.total_counts[6], overlay_text="\nDead", **opts)

    def print_counts(self, time):
        """Print out the counts at time to stdout."""
        print(f"\tSusceptible: {int(self.total_counts[0][time])}")
        print(f"\tExposed: {int(self.total_counts[1][time])}")
        print(f"\tPresymptomatic: {int(self.total_counts[2][time])}")
        print(f"\tAsymptomatic: {int(self.total_counts[3][time])}")
        print(f"\tSymptomatic: {int(self.total_counts[4][time])}")
        print(f"\tRecovered: {int(self.total_counts[5][time])}")
        print(f"\tDead: {int(self.total_counts[6][time])}")
