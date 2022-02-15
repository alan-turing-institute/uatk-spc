import numpy as np
import random
import os
import json
from tqdm import tqdm
from convertbng.util import convert_lonlat

from ramp.snapshot import Snapshot
from ramp.constants import ColumnNames

sentinel_value = (1 << 31) - 1


class SnapshotConvertor:
    """
    Convert dataframe of individuals and activity locations into a Snapshot object that can be used by the OpenCL model
    """

    def __init__(
        self, individuals, activity_locations, time_activity_multiplier, data_dir
    ):
        self.data_dir = data_dir

        self.individuals = individuals
        self.activity_names = list(activity_locations.keys())

        self.locations = dict()
        for activity_name in self.activity_names:
            self.locations[activity_name] = activity_locations[activity_name]._locations

        self.lockdown_multipliers = time_activity_multiplier

        self.num_people = self.individuals["ID"].count()
        self.global_place_id_lookup, self.num_places = self.create_global_place_ids()

    def generate_snapshot(self):
        people_ages = self.get_people_ages()
        people_obesity = self.get_people_obesity()
        people_cvd = self.get_people_cvd()
        people_diabetes = self.get_people_diabetes()
        people_blood_pressure = self.get_people_blood_pressure()
        area_codes = self.get_people_area_codes()
        not_home_probs = self.get_not_home_probs()
        people_place_ids, people_flows = self.get_people_place_data()

        place_activities = self.get_place_data()
        place_coordinates = self.get_place_coordinates()
        return Snapshot.from_arrays(
            people_ages,
            people_obesity,
            people_cvd,
            people_diabetes,
            people_blood_pressure,
            people_place_ids,
            people_flows,
            area_codes,
            not_home_probs,
            place_activities,
            place_coordinates,
            self.lockdown_multipliers,
        )

    def create_global_place_ids(self):
        max_id = 0
        global_place_id_lookup = dict()

        for activity_name in self.activity_names:
            locations_ids = self.locations[activity_name]["ID"].to_numpy(
                dtype=np.uint32
            )
            num_activity_ids = locations_ids.shape[0]
            starting_id = locations_ids[0]

            # check that activity IDs increase by one
            assert locations_ids[-1] == num_activity_ids - 1 + starting_id

            # subtract starting ID in case the first local activity ID is not zero
            global_ids = locations_ids + max_id - starting_id
            global_place_id_lookup[activity_name] = {
                "ids": global_ids,
                "id_offset": starting_id,
            }
            max_id += num_activity_ids

        num_places = max_id
        return global_place_id_lookup, num_places

    def get_global_place_id(self, activity_name, local_place_id):
        ids_for_activity = self.global_place_id_lookup[activity_name]
        global_id_location = local_place_id - ids_for_activity["id_offset"]
        return ids_for_activity["ids"][global_id_location]

    def get_people_ages(self):
        return self.individuals["age"].to_numpy(dtype=np.uint16)

    def get_people_obesity(self):
        self.individuals["obesity"] = self.individuals.apply(
            lambda row: get_obesity_value(row["BMIvg6"]), axis=1
        )
        return self.individuals["obesity"].to_numpy(dtype=np.uint16)

    def get_people_cvd(self):
        return self.individuals["cvd"].to_numpy(dtype=np.uint8)

    def get_people_diabetes(self):
        return self.individuals["diabetes"].to_numpy(dtype=np.uint8)

    def get_people_blood_pressure(self):
        return self.individuals["bloodpressure"].to_numpy(dtype=np.uint8)

    def get_people_area_codes(self):
        return self.individuals[ColumnNames.MSOAsID].to_numpy(dtype=np.object)

    def get_not_home_probs(self):
        return self.individuals["pnothome"].to_numpy(dtype=np.float32)

    def get_people_place_data(
        self, max_places_per_person=100, places_to_keep_per_person=16
    ):
        """
        Calculate the "baseline flows" for each person by multiplying flows for each location by duration, then sorting
        these flows and taking the top n so they can fit in a fixed size array. Locations from all activities are contained
        in the same array so the activity specific location ids are mapped to global location ids.

        :param max_places_per_person: upper limit of places per person so we can use a fixed size array
        :param places_to_keep_per_person:
        :return: Numpy arrays of place ids and baseline flows indexed by person id
        """

        people_place_ids = np.full(
            (self.num_people, max_places_per_person), sentinel_value, dtype=np.uint32
        )
        people_place_flows = np.zeros(
            (self.num_people, max_places_per_person), dtype=np.float32
        )

        num_places_added = np.zeros(self.num_people, dtype=np.uint32)

        for activity_name in self.activity_names:
            activity_venues = self.individuals.loc[:, activity_name + "_Venues"]
            activity_flows = self.individuals.loc[:, activity_name + "_Flows"]
            activity_durations = self.individuals.loc[:, activity_name + "_Duration"]

            # TODO Ah, I think the problem is that Work venues aren't assigned correctly yet
            if activity_name == "Work":
                continue

            for people_id, (local_place_ids, flows, duration) in tqdm(
                enumerate(zip(activity_venues, activity_flows, activity_durations)),
                total=self.num_people,
                desc=f"Converting {activity_name} flows for all people",
            ):
                flows = np.array(flows) * duration

                # check dimensions match
                if len(local_place_ids) != flows.shape[0]:
                    print(
                        f"for {activity_name} and person {people_id}, we have {len(local_place_ids)} local place IDs, but {flows.shape[0]} flows"
                    )
                    print(f"  that first flow is {flows[0]}")
                    continue
                assert len(local_place_ids) == flows.shape[0]

                num_places_to_add = len(local_place_ids)

                start_idx = num_places_added[people_id]
                end_idx = start_idx + num_places_to_add
                people_place_ids[people_id, start_idx:end_idx] = np.array(
                    [
                        self.get_global_place_id(activity_name, local_place_id)
                        for local_place_id in local_place_ids
                    ]
                )

                people_place_flows[people_id, start_idx:end_idx] = flows

                num_places_added[people_id] += num_places_to_add

        # Sort by magnitude of flow (reversed)
        sorted_indices = people_place_flows.argsort()[:, ::-1]
        people_place_ids = np.take_along_axis(people_place_ids, sorted_indices, axis=1)
        people_place_flows = np.take_along_axis(
            people_place_flows, sorted_indices, axis=1
        )

        # truncate to maximum places per person
        people_place_ids = people_place_ids[:, 0:places_to_keep_per_person]
        people_place_flows = people_place_flows[:, 0:places_to_keep_per_person]

        return people_place_ids, people_place_flows

    def get_place_data(self):
        place_activities = np.zeros(self.num_places, dtype=np.uint32)

        for activity_index, activity_name in enumerate(self.activity_names):
            activity_locations_df = self.locations[activity_name]

            ids = activity_locations_df.loc[:, "ID"]

            # Store global ids
            for local_place_id in tqdm(
                ids, desc=f"Storing location type for {activity_name}"
            ):
                global_place_id = self.get_global_place_id(
                    activity_name, local_place_id
                )
                place_activities[global_place_id] = activity_index

        return place_activities

    def get_place_coordinates(self):
        place_coordinates = np.zeros((self.num_places, 2), dtype=np.float32)

        non_home_activities = list(
            filter(lambda activity: activity != "Home", self.activity_names)
        )

        for activity_index, activity_name in enumerate(non_home_activities):
            activity_locations_df = self.locations[activity_name]

            # rename OS grid coordinate columns
            activity_locations_df = activity_locations_df.rename(
                columns={"bng_e": "Easting", "bng_n": "Northing"}
            )

            # Convert OS grid coordinates (eastings and northings) to latitude and longitude
            if (
                "Easting" in activity_locations_df.columns
                and "Northing" in activity_locations_df.columns
            ):
                local_ids = activity_locations_df.loc[:, "ID"]
                eastings = activity_locations_df.loc[:, "Easting"]
                northings = activity_locations_df.loc[:, "Northing"]

                for local_place_id, easting, northing in tqdm(
                    zip(local_ids, eastings, northings),
                    desc=f"Processing coordinate data for {activity_name}",
                ):
                    global_place_id = self.get_global_place_id(
                        activity_name, local_place_id
                    )

                    long_lat = convert_lonlat([easting], [northing])
                    long = long_lat[0][0]
                    lat = long_lat[1][0]
                    place_coordinates[global_place_id] = np.array([lat, long])

        # for homes: assign coordinates of random building inside MSOA area
        home_locations_df = self.locations["Home"]
        lats, lons = self.get_coordinates_from_buildings(home_locations_df)
        local_ids = home_locations_df.loc[:, "ID"]

        for local_place_id, lat, lon in tqdm(
            zip(local_ids, lats, lons), desc=f"Storing coordinates for homes"
        ):
            global_place_id = self.get_global_place_id("Home", local_place_id)
            place_coordinates[global_place_id] = np.array([lat, lon])

        return place_coordinates

    def get_coordinates_from_buildings(self, home_locations_df):
        # load msoa building lookup from JSON file
        msoa_building_filepath = os.path.join(
            self.data_dir, "msoa_building_coordinates.json"
        )
        with open(msoa_building_filepath) as f:
            msoa_buildings = json.load(f)

        areas = home_locations_df.loc[:, ColumnNames.MSOAsID]

        num_locations = len(home_locations_df.index)

        lats = np.zeros(num_locations)
        lons = np.zeros(num_locations)

        for i, area in enumerate(areas):
            # select random building from within area and assign easting and northing
            area_buildings = msoa_buildings[area]
            building = random.choice(area_buildings)

            lats[i] = building[0]
            lons[i] = building[1]

        return lats, lons


def get_obesity_value(bmi_vg6_str):
    if bmi_vg6_str == "Obese III: 40 or more":
        return 4
    if bmi_vg6_str == "Obese II: 35 to less than 40":
        return 3
    if bmi_vg6_str == "Obese I: 30 to less than 35":
        return 2
    if bmi_vg6_str == "Overweight: 25 to less than 30":
        return 1
    if bmi_vg6_str == "Normal: 18.5 to less than 25" or bmi_vg6_str == "Not applicable":
        return 0

    # default
    return 0
