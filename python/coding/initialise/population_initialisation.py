#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Core part to initialise the RAMP-UA model.

Created on Wed Apr 29 19:59:25 2020
Edited on April 2021

@authors: nick, Anna for the national up-scaling
"""
import decimal
import sys

# sys.path.append("microsim")  # This is only needed when testing. I'm so confused about the imports
from coding.initialise.activity_location import ActivityLocation
from coding.constants import ColumnNames
from coding.constants import Constants
from coding.model.utilities import Optimise, check_durations_sum_to_1
from coding.initialise.quant_api import QuantRampAPI
from coding.initialise.raw_data_handler import RawDataHandler
from coding.initialise.comModule import Commuting
from decimal import *
import multiprocessing  # process based parallelism
import pandas as pd

pd.set_option('display.expand_frame_repr', False)  # Don't wrap lines when displaying DataFrames
# pd.set_option('display.width', 0)  # Automatically find the best width
import numpy as np
import os
import warnings
from collections.abc import Iterable  # drop `.abc` with Python 2.7 or lower
from typing import List, Dict, Tuple
from tqdm import tqdm  # For a progress bar
from yaml import load, SafeLoader

getcontext().rounding = ROUND_DOWN


# name = ColumnNames.MSOAsID
# print(f"this is number 1 {name}")

class PopulationInitialisation:
    """
    A class used to load different data microsims and generate the population of people ready to be iterated.
    This produces dataframes of people and places ready to start either model implementation.
    """

    # Static variables:
    REGIONAL_DATA_DIR = ""  # leaving this here until we remove the remove devon_data stuff completely
    testing = False
    debug = False
    raw_data_handler: RawDataHandler = None  # defining the static variabla raw_data_handler as type RawDataHandler

    def __init__(self,
                 #  regional_data_dir: str = "",
                 raw_data_handler_param: RawDataHandler,
                 read_data: bool = True,
                 testing: bool = True,
                 debug=True
                 # quant_object=None
                 ):
        """
        PopulationInitialisation constructor. This reads all of the necessary data to run the microsimulation.
        ----------
        #:param data_dir: A data directory from which to read the microsim data
        :param read_data: Optionally don't read in the data when instantiating this Microsim (useful
            in debugging).
        :param testing: Optionally turn off some exceptions and replace them with warnings (only good when testing!)
        :param debug: Whether to do some more intense error checks (e.g. for data inconsistencies)
        #:param quant_object: optional parameter to use QUANT data, don't specify if you want to use Devon data
        """

        # PopulationInitialisation.REGIONAL_DATA_DIR = regional_data_dir
        # TODO (minor) pass the data_dir to class functions directly so no need to have it defined at class level
        # self.DATA_DIR = data_dir

        # # Administrative variables that need to be defined
        # if testing is False:
        #     PopulationInitialisation.DATA_DIR = Configuration.Paths.DATA_FOLDER
        # else:
        #     PopulationInitialisation.DATA_DIR = Configuration.Paths.TESTS_FOLDER

        PopulationInitialisation.debug = debug
        PopulationInitialisation.testing = testing
        if testing:
            warnings.warn("Running in testing mode. Some exceptions will be disabled.")

        if not read_data:  # Optionally can not do this, usually for debugging
            return

        self.quant_object = QuantRampAPI(Constants.Paths.QUANT.FULL_PATH_FOLDER)  # (os.path.join(common_data_dir,
        # Constants.Paths.QUANT.QUANT_FOLDER))

        self.raw_data_handler = raw_data_handler_param
        # *********
        # Generate population and places dataframes
        # *********

        # Begin by reading the individuals. This includes core information about the population as well as the
        # durations that people spend doing activities.
        # This also creates flows and venues columns for the journeys of individuals to households, and makes a new
        # households dataset to replace the one we read in above.
        home_name = ColumnNames.Activities.HOME  # How to describe flows to people's houses
        self.individuals, self.households = self.read_individual_time_use_and_health_data(home_name)

        # Extract a list of all MSOAs in the study area. Will need this for the new SIMs
        self.all_msoas = PopulationInitialisation.extract_msoas_from_individuals(self.individuals)
        # name = ColumnNames.MSOAsID
        # print(f"this is number 2 {name}")
        #
        # ********** How to assign activities for the population **********
        #
        # For each 'activity' (e.g shopping), we need to store the following things:
        #
        # 1. A data frame of the places where the activities take place (e.g. a list of shops). Referred to as
        # the 'locations' dataframe. Importantly this will have a 'Danger' column which records whether infected
        # people have visited the location.
        #
        # 2. Columns in the individuals data frame that says which locations each individual is likely to do that
        # activity (a list of 'venues'), how likely they are to do to the activity (a list of 'flows'), and the
        # duration spent doing the activity.
        #
        # For most activities, there are a number of different possible locations that the individual
        # could visit. The 'venues' column stores a list of indexes to the locations dataframe. E.g. one individual
        # might have venues=[2,54,19]. Those numbers refer to the *row numbers* of locations in the locations
        # dataframe. So venue '2' is the third venue in the list of all the locations associated with that activity.
        # Flows are also a list, e.g. for that individual the flows might be flows=[0.8,0.1,0.1] which means they
        # are most likely to go to venue with index 2, and less likely to go to the other two.
        #
        # For some activities, e.g. 'being at home', each individual has only a single location and one flow, so their
        # venues and flows columns will only be single-element lists.
        #
        # For multi-venue activities, the process is as follows (easiest to see the retail or shopping example):
        # 1. Create a dataframe of individual locations and use a spatial interaction model to estimate flows to those
        # locations, creating a flow matrix. E.g. the `read_retail_flows_data()` function
        # 2. Run through the flow matrix, assigning all individuals in each MSOA the appropriate flows. E.g. the
        # `add_individual_flows()` function.
        # 3. Create an `ActivityLocation` object to store information about these locations in a standard way.
        # When they are created, these `ActivityLocation` objects will also add another column
        # to the individuals dataframe that records the amount of time they spend doing the activity
        # (e.g. 'RETAIL_DURATION'). These raw numbers were attached earlier in `attach_time_use_and_health_data`.
        # (Again see the retail example below).
        # These ActivityLocation objects are stored in a dictionary (see `activity_locations` created above). This makes
        # it possible to run through all activities and calculate risks and dangers using the same code.
        #

        # For each type of activity (store, retail, etc), create ActivityLocation objects to keep all the
        # required information together.
        self.activity_locations: Dict[str, ActivityLocation] = {}

        # Create 'activity locations' for the activity of being at home. (This is done for other activities,
        # like retail etc, when those data are read in later.
        self.activity_locations[home_name] = ActivityLocation(name=home_name, locations=self.households,
                                                              flows=None, individuals=self.individuals,
                                                              duration_col="phome")

        # Generate travel time columns and assign travel modes to some kind of risky activity (not doing this yet)
        # individuals = PopulationInitialisation.generate_travel_time_columns(individuals)
        # One thing we do need to do (this would be done in the function) is replace NaNs in the time use data with 0
        # for col in ["pwork", "_pschool", "pshop", "pleisure", "ptransport", "pother"]:
        for col in ["punknown", "phome", "pworkhome", "pwork", "_pschool", "pshop", "pservices", "pleisure",
                    "pescort", "ptransport", "pnothome", "phometot", "pmwalk", "pmcycle", "pmprivate",
                    "pmpublic", "pmunknown"]:
            # TODO: this is hard-coded, add this to ColumnNames?
            self.individuals[col].fillna(0, inplace=True)

        # Read Retail flows data
        retail_name = ColumnNames.Activities.RETAIL  # How to refer to this in data frame columns etc.
        stores, stores_flows = PopulationInitialisation.read_retail_flows_data(self,
                                                                               self.all_msoas)  # (list of shops and a flow matrix)
        PopulationInitialisation.check_sim_flows(stores, stores_flows)
        # Assign Retail flows data to the individuals
        self.individuals = PopulationInitialisation.add_individual_flows(retail_name,
                                                                         self.individuals,
                                                                         stores_flows)
        self.activity_locations[retail_name] = \
            ActivityLocation(retail_name, stores, stores_flows, self.individuals, "pshop")
        # name = ColumnNames.MSOAsID
        # print(f"this is number 2 {name}")

        # Read Night clubs
        nightclub_name = ColumnNames.Activities.NIGHTCLUBS
        # Add new read_nightclubs_flows_data
        nightclubs, nightclub_flows = PopulationInitialisation.read_nightclubs_flows_data(self,
                                                                                          self.all_msoas)
        PopulationInitialisation.check_sim_flows(nightclubs,
                                                 nightclub_flows)
        # Assign nightclubs flows data to the individuals
        self.individuals = PopulationInitialisation.add_individual_flows(nightclub_name, self.individuals,
                                                                         nightclub_flows)
        self.activity_locations[nightclub_name] = \
            ActivityLocation(nightclub_name, nightclubs, nightclub_flows, self.individuals,
                             "pleisure")  # temporarily using column 'pleisure' for the nightclubs probability
        # this assumption can be discussed and improved further

        # Read Schools (primary and secondary)
        primary_name = ColumnNames.Activities.PRIMARY
        secondary_name = ColumnNames.Activities.SECONDARY
        primary_schools, secondary_schools, primary_flows, secondary_flows = \
            PopulationInitialisation.read_school_flows_data(self, self.all_msoas)  # (list of schools and a flow matrix)
        PopulationInitialisation.check_sim_flows(primary_schools, primary_flows)
        PopulationInitialisation.check_sim_flows(secondary_schools, secondary_flows)
        # Assign Schools
        # TODO: need to separate primary and secondary school duration. At the moment everyone is given the same
        # duration, 'pschool', which means that children will be assigned a PrimarySchool duration *and* a
        # secondary school duration, regardless of their age. I think the only way round this is to
        # make two new columns - 'pschool_primary' and 'pschool_secondary', and set these to either 'pschool'
        # or 0 depending on the age of the child.
        self.individuals = PopulationInitialisation.add_individual_flows(primary_name, self.individuals, primary_flows)
        self.activity_locations[primary_name] = \
            ActivityLocation(primary_name, primary_schools.copy(), primary_flows, self.individuals, "pschool-primary")
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?

        self.individuals = PopulationInitialisation.add_individual_flows(secondary_name, self.individuals,
                                                                         secondary_flows)
        self.activity_locations[secondary_name] = \
            ActivityLocation(secondary_name, secondary_schools.copy(), secondary_flows, self.individuals,
                             "pschool-secondary")
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        del primary_schools, secondary_schools  # No longer needed as we gave copies to the ActivityLocation

        # Assign work NEW VERSION.
        with open('model_parameters/default.yml', 'r') as f:
            # print(f"Reading parameters file: {parameters_file}. ")
            parameters = load(f,
                              Loader=SafeLoader)
            sim_params = parameters["microsim"]
            wthreshold = sim_params["sicThresh"]
        #wthreshold = 0 # Add threshold to parameters

        commuting = Commuting(self.individuals,
                              wthreshold)
        [reg,orig,dest] = commuting.getCommutingData()
        PopulationInitialisation._add_location_columns(reg, location_names=reg['id'])
        work_name = ColumnNames.Activities.WORK
        self.individuals = PopulationInitialisation.add_work_flows(self,flow_type=work_name,individuals=self.individuals,orig = orig,dest = dest)
        self.activity_locations[work_name] = ActivityLocation(name=work_name, locations=reg, flows=None,
                                                              individuals=self.individuals, duration_col="pwork")
        print("...finished calculating commuting flows.")

        # Assign work. Use a flow matrix of general commuting flows. Assume one office for each different employment
        # type exists in each MSOA. An individual is assigned flows and office locations according to the general
        # flows from their home MSOA.
        # Occupation is taken from column soc2010 in individuals df. Make it a string and replace empty cells with "NA" string
        #self.individuals['soc2010'] = self.individuals['soc2010'].astype(str).fillna("NA")
        #possible_jobs = sorted(self.individuals.soc2010.unique())  # list of possible jobs in alphabetical order
        #workplace_names = []  # Creat a list of workplace names, built from the MSOA code and the SOC
        #workplace_msoas = []
        #workplace_socs = []
        #for msoa in self.all_msoas:
        #    for soc in possible_jobs:
        #        workplace_msoas.append(msoa)
        #        workplace_socs.append(soc)
        #        workplace_names.append(msoa + "-" + soc)
        #assert len(workplace_names) == len(self.all_msoas) * len(possible_jobs)
        #assert len(pd.unique(workplace_names)) == len(workplace_names)  # Each name should be unique
        # name = ColumnNames.MSOAsID
        # print(f"this is number 4 {name}")
        #workplaces = pd.DataFrame({
        #    'ID': range(0, len(workplace_names)),
        #    'MSOA': workplace_msoas,
        #    'SOC': workplace_socs
        #})
        #assert len(workplaces) == len(self.all_msoas) * len(possible_jobs)  # One location per job per msoa
        #PopulationInitialisation._add_location_columns(workplaces, location_names=workplace_names)
        # work_name = ColumnNames.Activities.WORK
        # Workplaces dataframe is ready. Now read commuting flows
        #commuting_flows = PopulationInitialisation.read_commuting_flows_data(self, self.all_msoas)
        #num_individuals = len(self.individuals)  # (sanity check)
        #cols = self.individuals.columns
        #self.individuals = PopulationInitialisation.add_work_flows(self, flow_type=work_name,
        #                                                           individuals=self.individuals,
        #                                                           workplaces=workplaces,
        #                                                           commuting_flows=commuting_flows,
        #                                                           flow_threshold=5)
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?

        #assert num_individuals == len(self.individuals), \
        #    "There was an error reading workplaces (caching?) and the number of individuals has changed!"
        #assert (self.individuals.columns[0:-3] == cols).all(), \
        #    "There was an error reading workplaces (caching?) the column names don't match!"
        #del num_individuals, cols
        #self.activity_locations[work_name] = ActivityLocation(name=work_name, locations=workplaces, flows=None,
        #                                                      individuals=self.individuals, duration_col="pwork")
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?


        ## Some flows will be very complicated numbers. Reduce the numbers of decimal places across the board.
        ## This makes it easier to write out the files and to make sure that the proportions add up properly
        ## Use multiprocessing because swifter doesn't work properly for some reason (wont parallelise)
        # with multiprocessing.Pool(processes=int(os.cpu_count()/2)) as pool:
        #   for name in tqdm(activity_locations.keys(), desc="Rounding all flows"):
        #       rounded_flows = pool.map( PopulationInitialisation._round_flows, list(individuals[f"{name}{ColumnNames.ACTIVITY_FLOWS}"]))
        #       individuals[f"{name}{ColumnNames.ACTIVITY_FLOWS}"] = rounded_flows
        #   # Use swifter, but for some reason it wont parallelise the problem. Not sure why.
        #   #individuals[f"{name}{ColumnNames.ACTIVITY_FLOWS}"] = \
        #   #        individuals.loc[:,f"{name}{ColumnNames.ACTIVITY_FLOWS}"].\
        #   #            swifter.allow_dask_on_strings(enable=True).progress_bar(True, desc=name).\
        #   #            apply(lambda flows: [round(flow, 5) for flow in flows])

        # Round the durations
        for name in tqdm(self.activity_locations.keys(), desc="Rounding all durations"):
            self.individuals[f"{name}{ColumnNames.ACTIVITY_DURATION}"] = \
                self.individuals[f"{name}{ColumnNames.ACTIVITY_DURATION}"].apply(lambda x: round(x, 5))
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        # name = ColumnNames.MSOAsID
        # print(f"this is number 5 {name}")
        # Some people's activity durations will not add up to 1.0 because we don't model all their activities.
        # Extend the amount of time at home to make up for this
        self.individuals = PopulationInitialisation.pad_durations(self.individuals, self.activity_locations)

        # Now that we have everyone's initial activities, remember the proportions of times that they spend doing things
        # so that if these change (e.g. under lockdown) they can return to 'normality' later
        for activity_name in self.activity_locations.keys():
            self.individuals[f"{activity_name}{ColumnNames.ACTIVITY_DURATION_INITIAL}"] = \
                self.individuals[f"{activity_name}{ColumnNames.ACTIVITY_DURATION}"]

        # Add some necessary columns for the disease
        self.individuals = PopulationInitialisation.add_disease_columns(self.individuals)

        print(" ... finished initialisation.")

    @staticmethod
    def _round_flows(flows):
        return [round(flow, 5) for flow in flows]

    # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?

    def _check_no_homeless(self, individuals, households, warn=True):
        """
        Check that each individual has a household. NOTE: this only works for the raw mirosimulation data.
        Once the health data has been attached this wont work because the unique identifiers change.
        If this function is still needed then it will need to take the specific IDs as arguments, but this is
        a little complicated because some combination of [area, HID, (PID)] is needed for unique identification.

        :param individuals:
        :param households:
        :param warn: Whether to warn (default, True) or raise an exception (False)
        :return: True if there are no homeless, False otherwise (unless `warn==False` in which case an
        exception is raised).
        :raise: An exception if `warn==False` and there are individuals without a household
        """
        print("Checking no homeless (all individuals assigned to a household) ...", )
        # This will fail if used on anything other than the raw msm data because once I read in the
        # health data the PID and HID columns are renamed to prevent them being accidentally used.
        assert "PID" in individuals.columns and "HID" in households.columns
        # Households in the msm are uniquely identified by [area,HID] combination.
        # Individuals are identified by [House_OA,HID,PID]
        hids = households.set_index(
            ["area", "HID"])  # Make a new dataset with a unique index for households # leave 'area' here ??? AZ
        # Find individuals who do not have a related entry in the households dataset
        homeless = [(area, hid, pid) for area, hid, pid in individuals.loc[:, ["House_OA", "HID", "PID"]].values if
                    (area, hid) not in hids.index]
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        # name = ColumnNames.MSOAsID
        # print(f"this is number 6 {name}")
        # (version using apply isn't quicker)
        # h2 = individuals.reset_index().loc[:, ["House_OA", "HID", "PID"]].swifter.apply(
        #    lambda x: x[2] if (x[0], x[1]) in hids.index else None, axis=1)
        # (Vectorised version doesn't quite work sadly)
        # h2 = np.where(individuals.loc[:, ["House_OA", "HID", "PID"]].isin(hids.index), True, False)
        if len(homeless) > 0:
            msg = f"There are {len(homeless)} individuals without an associated household (HID)."
            if warn:
                warnings.warn(msg)
                return False
            else:
                raise Exception(msg)
        print("... finished checking homeless")
        return True

    @staticmethod
    def extract_msoas_from_individuals(individuals: pd.DataFrame) -> List[str]:
        """
        Analyse a DataFrame of individuals and extract the unique MSOA codes, returning them as a list in ascending
        order
        :param individuals:
        :return:
        """
        areas = list(individuals[ColumnNames.MSOAsID].unique())  # list(individuals.area.unique())
        areas.sort()
        # name = ColumnNames.MSOAsID
        # print(f"this is number 7 {name}")
        return areas

    def read_individual_time_use_and_health_data(self, home_name: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
        # TODO solve this tuple not defined as tuple (see return)
        """
        Read a population of individuals. Includes time-use & health info.

        :param home_name: A string to describe flows to people's homes (probably 'Home')
        :return A tuple with new dataframes of individuals and households
        """
        print("Reading time use and health data ... ", )
        # filename = os.path.join(cls.DATA_DIR, "devon-tu_health", "Devon_simulated_TU_health.txt")
        # filename = os.path.join(cls.DATA_DIR, "devon-tu_health", "Devon_keyworker.txt")
        # filename = os.path.join(cls.DATA_DIR, "devon-tu_health", "Devon_Complete.txt")
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?

        # filename = os.path.join(cls.DATA_DIR, "devon-tu_health", "Devon_simulated_TU_keyworker_health.csv")

        # filename = os.path.join(PopulationInitialisation.REGIONAL_DATA_DIR,
        #                         Constants.Paths.TU_FILE)

        # tuh = pd.read_csv(filename)  # , encoding = "ISO-8859-1")
        tuh = self.raw_data_handler.getCombinedTUFile()  # Calling file created from RawDataHandler that appends TU files
        tuh.index = range(len(tuh))

        tuh = Optimise.optimize(tuh)  # Reduce memory of tuh where possible.

        # Drop people that weren't matched to a household originally
        nohh = len(tuh.loc[tuh.hid == -1])
        if nohh > 0:
            warnings.warn(f"{nohh} / {len(tuh)} individuals in the TUH data had not originally been matched "
                          f"to a household. They're being removed")
        tuh = tuh.loc[tuh.hid != -1]
        # name = ColumnNames.MSOAsID
        # print(f"this is number 8 {name}")
        # Indicate that HIDs and PIDs shouldn't be used as indices as they don't uniquely
        # identify individuals / households in this health data
        tuh = tuh.rename(columns={'hid': '_hid', 'pid': '_pid'})
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?

        # Make a new, unique id for each individual (PIDs have been replicated so no longer uniquely identify individuals}
        assert len(tuh.index.unique()) == len(tuh)  # Index should have been set to row number when tuh was read in
        tuh.insert(0, "ID", tuh.index, allow_duplicates=False)  # Insert into first position

        #
        # ********** Create households dataframe *************
        #

        # Go through each individual. House members can be identified because they have the same [Area, HID]
        # combination.
        # Maintain a dictionary of (Area, HID) -> House_ID that records a new ID for each house
        # Each time a new [Area, HID] combination is found, create a new entry in the households dictionary for that
        # household, generate a House_ID, and record that in the dictionary.
        # When existing (Area, HID) combinations are found, look up the ID in the dataframe and record it for that
        # individual
        # Also, maintain a list of house_ids in the same order as individuals in the tuh data which can be used later
        # when we link from the individuls in the TUH data to their house id

        # This is the main dictionary. It maps (Area, HID) to house id numbers, along with some more information:
        house_ids_dict = {}  # (Area, HID) -> [HouseIDNumber, NumPeople, area, hid]

        house_ids_list = []  # ID of each house for each individual
        house_id_counter = 0  # Counter to generate new HouseIDNumbers
        unique_individuals = []  # Also store all [Area, HID, PID] combinations to check they're are unique later

        # Maybe quicker to loop over 3 lists simultaneously than through a DataFrame
        _areas = list(tuh[ColumnNames.MSOAsID])  # list(tuh["area"])  # MSOAs IDs name
        _hids = list(tuh["_hid"])
        _pids = list(tuh["_pid"])
        # name = ColumnNames.MSOAsID
        # print(f"this is number 9 {name}")
        for i, (area, hid, pid) in enumerate(zip(_areas, _hids, _pids)):
            # print(i, area, hid, pid)
            unique_individuals.append((area, hid, pid))
            house_key = (area, hid)  # Uniquely identifies a household
            # print("***")
            # print(house_key)
            house_id_number = -1
            # print(house_id_number)
            try:  # If this lookup works then we've seen this house before. Get it's ID number and increase num people in it
                house_info = house_ids_dict[house_key]
                # Check the area and hid are the same as the one previously stored in the dictionary
                assert area == house_info[2] and hid == house_info[3]
                # Also check that the house key (Area, HID) matches the area and HID
                # print(f"{house_key[0]}")
                # print(f"{house_info[2]}")
                # print(f"{house_key[1]}")
                # print(f"{house_info[3]}")
                assert house_key[0] == house_info[2] and house_key[1] == house_info[3]
                # We need the ID number to tell the individual which their house is
                house_id_number = house_info[0]
                # Increase the number of people in the house and create a new list of info for this house
                people_per_house = house_info[1] + 1
                house_ids_dict[house_key] = [house_id_number, people_per_house, area, hid]
            except KeyError:  # If the lookup failed then this is the first time we've seen this house. Make a new ID.
                house_id_number = house_id_counter
                house_ids_dict[house_key] = [house_id_number, 1, area,
                                             hid]  # (1 is because 1 person so far in the house)
                house_id_counter += 1
            assert house_id_number > -1
            house_ids_list.append(house_id_number)  # Remember the house for this individual

        assert len(unique_individuals) == len(tuh)
        assert len(house_ids_list) == len(tuh)
        assert len(house_ids_dict) == house_id_counter

        # While we're here, may as well also check that [Area, HID, PID] is a unique identifier of individuals
        if len(tuh) != len(set(unique_individuals)):
            # TODO FIND OUT FROM KARYN WHY THERE ARE ~20,000 NON-UNIQUE PEOPLE
            warnings.warn(f"There are {len(tuh) - len(set(unique_individuals))} / {len(tuh)} non-unique individuals.")

        # Done! Now can create the households dataframe
        households_df = pd.DataFrame(house_ids_dict.values(),
                                     columns=['House_ID', 'Num_People', ColumnNames.MSOAsID, '_hid'])
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        households_df = Optimise.optimize(households_df)

        # And tell the individuals which house they live in
        tuh["House_ID"] = house_ids_list  # Assign each individuals to their household

        # Check all house IDs are unique and have same number as in TUH data
        assert len(frozenset(households_df.House_ID.unique())) == len(households_df)
        # assert len(tuh[ColumnNames.MSOAsID].unique()) == len(tuh[ColumnNames.MSOAsID].unique())
        # Check that the area that the individual lives in is the same as the area their house is in
        temp_merge = tuh.merge(households_df, how="left", on=["House_ID"], validate="many_to_one")
        assert len(temp_merge) == len(tuh)
        # name = ColumnNames.MSOAsID
        # print(f"this is number 10 {name}")
        assert (temp_merge[ColumnNames.MSOAsID + '_x'] == temp_merge[
            ColumnNames.MSOAsID + '_y']).all()  # (all says 'all are true')

        # Check that NumPeople in the house dataframe is the same as number of people in the individuals dataframe
        # with this house id
        if PopulationInitialisation.debug:
            for house_id, num_people in tqdm(zip(households_df.House_ID, households_df.Num_People),
                                             desc="Checking household sizes match"):  # I know you shouldn't loop, but I can't work out the apply way (and this only happens once)
                num_people2 = len(tuh.loc[tuh.House_ID == house_id])  # Number of individuals who link to this house
                assert num_people == num_people2, f"House {house_id} doesn't match: {num_people} / {num_people2}"

        # Add some required columns
        PopulationInitialisation._add_location_columns(households_df, location_names=list(households_df.House_ID),
                                                       location_ids=households_df.House_ID)
        # The new ID column should be the same as the House_ID
        assert (households_df.House_ID == households_df[ColumnNames.LOCATION_ID]).all()

        # Later we need time spent in primary and secondary school. But currently we just have 'pschool'. Make
        # two new columns separating out primary and secondary based on age
        tuh["pschool"] = tuh["pschool"].fillna(0)
        tuh["pschool-primary"] = 0.0
        tuh["pschool-secondary"] = 0.0
        children_idx = tuh.index[tuh["age"] < 11]
        teen_idx = tuh.index[(tuh["age"] >= 11) & (tuh["age"] < 19)]

        assert len(children_idx) > 0
        assert len(teen_idx) > 0

        tuh.loc[children_idx, "pschool-primary"] = tuh.loc[children_idx, "pschool"]
        tuh.loc[teen_idx, "pschool-secondary"] = tuh.loc[teen_idx, "pschool"]

        # Check that people have been allocated correctly
        adults_in_school = tuh.loc[~(tuh["pschool-primary"] + tuh["pschool-secondary"] == tuh["pschool"]),
                                   ["age", "pschool", "pschool-primary", "pschool-secondary"]]
        if len(adults_in_school) > 0:
            warnings.warn(f"{len(adults_in_school)} people > 18y/o go to school, but they are not being assigned to a "
                          f"primary or secondary school (so their schooling is ignored at the moment).")

        tuh = tuh.rename(columns={"pschool": "_pschool"})  # Indicate that the pschool column shouldn't be used now

        # For some reason, we get some *very* large households. Can demonstrate this with:
        # households_df.Num_People.hist(bins=10000)
        # This needs to be resolved, but in the meantime just remove all households that have more than 10 people
        large_house_idx = frozenset(households_df.index[households_df.Num_People > 10])  # Indexes of large houses
        # For each person, get a house_id, or -1 if the house is very large
        large_people_idx = tuh["House_ID"].apply(lambda x: -1 if x in large_house_idx else x)
        if len(large_house_idx) > 0:
            warnings.warn(f"There are {len(large_house_idx)} households with more than 10 people in them. This covers "
                          f"{len(large_people_idx[large_people_idx == -1])} people. These households are being removed.")
        tuh["TEMP_HOUSE_ID"] = large_people_idx  # Use this colum to remove people (all people with HOUSE_ID == -1)
        # Check the numbers add up (normal house len + large house len = original len)
        assert (len(tuh.loc[tuh.TEMP_HOUSE_ID != -1]) + len(large_people_idx[large_people_idx == -1])) == len(tuh)
        assert (len(households_df.loc[~households_df.House_ID.isin(large_house_idx)]) + len(large_house_idx)) == len(
            households_df)
        # Remove people, but leave the households (no one will live there so they wont affect anything)
        tuh = tuh[tuh.TEMP_HOUSE_ID != -1]
        # TODO Work out why removing households kills the model later. - it's probably because houses are removed but the indexes and IDs don't change, so indexes will end up larger than size of the households list. Probably would need to recalculate the index and House_ID so that they are ascending again (pain, can't be bothered).
        # households_df = households_df.loc[~households_df.House_ID.isin(large_house_idx)]
        # households_df = households_df.loc[households_df.Num_People <= 10]
        # Check that the large house ids no longer exist in the individuals df (use House_ID rather than index to be sure, but they're the same anyway)
        id_set = frozenset(households_df.loc[households_df.Num_People > 10, "House_ID"].values)
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        assert True not in list(tuh["House_ID"].apply(lambda x: x in id_set))
        del tuh["TEMP_HOUSE_ID"]

        # Add flows for each individual (this is easy, it's just converting their House_ID and flow (1.0) into a
        # one-value lists).
        venues_col = f"{home_name}{ColumnNames.ACTIVITY_VENUES}"  # Names for the new columns
        flows_col = f"{home_name}{ColumnNames.ACTIVITY_FLOWS}"
        tuh[venues_col] = tuh["House_ID"].apply(lambda x: [x])
        tuh[flows_col] = [[1.0]] * len(tuh)

        # Later we also record the individual risks for each activity per individual. It's nice if the columns for
        # each activity are grouped together, so create that column now.
        tuh[f"{home_name}{ColumnNames.ACTIVITY_RISK}"] = [-1] * len(tuh)

        print(f"... finished reading TU&H data. There are {len(tuh)} individuals in {len(households_df)} houses "
              f"over {len(tuh[ColumnNames.MSOAsID].unique())} MSOAs")

        return tuh, households_df

    def generate_travel_time_columns(self, individuals: pd.DataFrame) -> pd.DataFrame:
        """
        TODO Read the raw travel time columns and create standard ones to show how long individuals
        spend travelling on different modes. Ultimately these will be turned into activities
        :param individuals:
        :return:
        """

        # Some sanity checks for the time use data
        # Variables pnothome, phome add up to 100% of the day and
        # pwork +pschool +pshop+ pleisure +pescort+ ptransport +pother = phome

        ######## ------------- RELEVANT?? ---------------------------------- ######
        # TODO go through some of these with Karyn, they don't all pass
        # Time at home and not home should sum to 1.0
        if False in list((individuals.phome + individuals.pnothome) == 1.0):
            raise Exception("Time at home (phome) + time not at home (pnothome) does not always equal 1.0")
        # These columns should equal time not at home
        # if False in list(tuh.loc[:, ["pwork", "pschool", "pshop", "pleisure",  "ptransport", "pother"]]. \
        #                         sum(axis=1, skipna=True) == tuh.pnothome):
        #    raise Exception("Times doing activities don't add up correctly")

        # Temporarily (?) remove NAs from activity columns (I couldn't work out how to do this in 1 line like:
        for col in ["pwork", "pschool", "pshop", "pleisure", "ptransport", "pother"]:
            individuals[col].fillna(0, inplace=True)
        # TODO: this is hard-coded, add this threshold to ColumnNames?

        ######## ------------- RELEVANT?? ---------------------------------- ######
        # TODO assign activities properly. Need to map from columns in the dataframe to standard names
        # Assign time use for Travel (just do this arbitrarily for now, the correct columns aren't in the data).
        # travel_cols = [ x + ColumnNames.ACTIVITY_DURATION for x in
        #                 [ ColumnNames.TRAVEL_CAR, ColumnNames.TRAVEL_BUS, ColumnNames.TRAVEL_TRAIN, ColumnNames.TRAVEL_WALK ] ]
        # for col in travel_cols:
        #    tuh[col] = 0.0
        # OLD WAY OF HARD-CODING TIME USE CATEGORIES FOR EACH INDIVIDUAL
        # For now just hard code broad categories. Ultimately will have different values for different activities.
        # activities = ["Home", "Retail", "PrimarySchool", "SecondarySchool", "Work", "Leisure"]
        # col_names = []
        # for act in activities:
        #    col_name = act + ColumnNames.ACTIVITY_DURATION
        #    col_names.append(col_name)
        #    if act=="Home":
        #        # Assume XX hours per day at home (this is whatever not spent doing other activities)
        #        individuals[col_name] = 14/24
        #    elif act == "Retail":
        #        individuals[col_name] = 1.0/24
        #    elif act == "PrimarySchool":
        #        # Assume 8 hours per day for all under 12
        #        individuals[col_name] = 0.0 # Default 0
        #        individuals.loc[individuals[ColumnNames.INDIVIDUAL_AGE] < 12, col_name] = 8.0/24
        #    elif act == "SecondarySchool":
        #        # Assume 8 hours per day for 12 <= x < 19
        #        individuals[col_name] = 0.0  # Default 0
        #        individuals.loc[individuals[ColumnNames.INDIVIDUAL_AGE] < 19, col_name] = 8.0 / 24
        #        individuals.loc[individuals[ColumnNames.INDIVIDUAL_AGE] < 12, col_name] = 0.0
        #    elif act == "Work":
        #        # Opposite of school
        ##        individuals[col_name] = 0.0 # Default 0
        #        individuals.loc[individuals[ColumnNames.INDIVIDUAL_AGE] >= 19, col_name] = 8.0/24
        #    elif act == "Leisure":
        #        individuals[col_name] = 1.0/24
        #    else:
        #        raise Exception(f"Unrecognised activity: {act}")

        # Check that proportions add up to 1.0
        # For some reason this fails, but as far as I can see the proportions correctly sum to 1 !!
        # assert False not in (individuals.loc[:, col_names].sum(axis=1).round(decimals=4) == 1.0)

        ## Add travel data columns (no values yet)
        # travel_cols = [ x + ColumnNames.ACTIVITY_DURATION for x in ["Car", "Bus", "Walk", "Train"] ]
        # for col in travel_cols:
        #    individuals[col] = 0.0
        return individuals

    def read_school_flows_data(self, study_msoas: List[str]) -> Tuple[
        pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Read the flows between each MSOA and the most likely schools attended by pupils in this area.
        All schools are initially read together, but flows are separated into primary and secondary

        :param study_msoas: A list of MSOAs in the study area (flows outside of this will be ignored)
        :return: A tuple of three dataframes. All schools, then the flows to primary and secondary
        (Schools, PrimaryFlows, SecondaryFlows). Although all the schools are one dataframe, no primary flows will flow
        to secondary schools and vice versa).
        """

        print("Reading school flow data...", )

        # Read the primary schools
        # primary_schools = pd.read_csv(os.path.join(PopulationInitialisation.COMMON_DATA_DIR,
        #                                              Constants.Paths.QUANT.QUANT_FOLDER,
        #                                              Constants.Paths.QUANT.PRIMARYSCHOOLS_FILE))
        primary_schools = pd.read_csv(Constants.Paths.PRIMARYSCHOOLS.FULL_PATH_FILE)
        # Add some standard columns that all locations need
        primary_school_ids = list(primary_schools.index)
        primary_school_names = primary_schools.URN  # unique ID for venue
        PopulationInitialisation._add_location_columns(primary_schools, location_names=primary_school_names,
                                                       location_ids=primary_school_ids)

        # Read the secondary schools
        # secondary_schools = pd.read_csv(os.path.join(PopulationInitialisation.COMMON_DATA_DIR,
        #                                              Constants.Paths.QUANT.QUANT_FOLDER,
        #                                              Constants.Paths.QUANT.SECONDARYSCHOOLS_FILE))
        secondary_schools = pd.read_csv(Constants.Paths.SECONDARYSCHOOLS.FULL_PATH_FILE)
        # Add some standard columns that all locations need
        secondary_school_ids = list(secondary_schools.index)
        secondary_school_names = secondary_schools.URN  # unique ID for venue
        PopulationInitialisation._add_location_columns(secondary_schools,
                                                       location_names=secondary_school_names,
                                                       location_ids=secondary_school_ids)

        # Read the primary school flows
        threshold = Constants.Thresholds.SCHOOL  # top 5
        thresholdtype = Constants.Thresholds.SCHOOL_TYPE  # threshold based on nr venues
        primary_flow_matrix = self.quant_object.get_flows(ColumnNames.Activities.PRIMARY,
                                                          study_msoas,
                                                          threshold,
                                                          thresholdtype)  ## get_flows is defined in file 'quant_api.py'

        # Read the secondary school flows
        # same thresholds as before
        secondary_flow_matrix = self.quant_object.get_flows(ColumnNames.Activities.SECONDARY,
                                                            study_msoas,
                                                            threshold,
                                                            thresholdtype)  ## get_flows is defined in file 'quant_api.py'

        return primary_schools, secondary_schools, primary_flow_matrix, secondary_flow_matrix


    def read_commuting_flows_data(self, reg, pop, useSic):
        [orig,dest] = Commuting.commutingDistance(self,reg,pop)

    #read_commuting_flows_data(self, reg, pop, useSic)
    def read_commuting_flows_data(self, study_msoas: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Read the commuting flows between each MSOA

        :param study_msoas: A list of MSOAs in the study area (flows outside of this will be ignored)
        :return: A dataframe with origin and destination flows in all MSOAs in the study area
        """
        print("Reading commuting flow data for the selected region...", )
        # commuting_flows = pd.read_csv(Constants.Paths.COMMUTING.FULL_PATH_FILE,
        #                               dtype={'HomeMSOA': str,
        #                                      'DestinationMSOA': str,
        #                                      'Total_Flow': int})
        commuting_flows = self.raw_data_handler.getOriginDestinationFile()  # Calling file created from RawDataHandler that contains ODcommuting data
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        # Need to append the devon code to the areas (they're integers in the csv file)
        commuting_flows["Orig"] = commuting_flows["HomeMSOA"]  # .apply(lambda x: "E0" + x)
        commuting_flows["Dest"] = commuting_flows["DestinationMSOA"]  # .apply(lambda x: "E0" + x)
        print(f"\tRead {len(pd.unique(commuting_flows['Orig']))} origins and {len(pd.unique(commuting_flows['Dest']))} "
              f"destinations (MSOAs in the study area: {len(study_msoas)})")

        # TEMP: remove areas outside the study area (just while the correct files are being prepared)
        if len(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas)]) > 0 or \
                len(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas)]) > 0:
            warnings.warn(
                f"Some origins ({len(pd.unique(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas), 'Orig']))}) "
                f"and destinations ({len(pd.unique(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas), 'Dest']))}) "
                f"are outside the study area. Removing them.")
            commuting_flows = commuting_flows.loc[commuting_flows.Orig.isin(study_msoas)]
            commuting_flows = commuting_flows.loc[commuting_flows.Dest.isin(study_msoas)]
        assert len(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas)]) == 0
        assert len(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas)]) == 0
        assert len(pd.unique(commuting_flows["Orig"])) == len(study_msoas)
        assert len(pd.unique(commuting_flows["Dest"])) == len(study_msoas)

        # There should be a flow between every possible combination of areas:
        assert len(study_msoas) ** 2 == len(commuting_flows)

        return commuting_flows

    """ def read_commuting_flows_data(self, study_msoas: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        
        Read the commuting flows between each MSOA
        :param study_msoas: A list of MSOAs in the study area (flows outside of this will be ignored)
        :return: A dataframe with origin and destination flows in all MSOAs in the study area
        
        print("Reading commuting flow data for the selected region...", )
        # commuting_flows = pd.read_csv(Constants.Paths.COMMUTING.FULL_PATH_FILE,
        #                               dtype={'HomeMSOA': str,
        #                                      'DestinationMSOA': str,
        #                                      'Total_Flow': int})
        commuting_flows = self.raw_data_handler.getOriginDestinationFile()  # Calling file created from RawDataHandler that contains ODcommuting data
        # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
        # Need to append the devon code to the areas (they're integers in the csv file)
        commuting_flows["Orig"] = commuting_flows["HomeMSOA"]  # .apply(lambda x: "E0" + x)
        commuting_flows["Dest"] = commuting_flows["DestinationMSOA"]  # .apply(lambda x: "E0" + x)
        print(f"\tRead {len(pd.unique(commuting_flows['Orig']))} origins and {len(pd.unique(commuting_flows['Dest']))} "
              f"destinations (MSOAs in the study area: {len(study_msoas)})")

        # TEMP: remove areas outside the study area (just while the correct files are being prepared)
        if len(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas)]) > 0 or \
                len(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas)]) > 0:
            warnings.warn(
                f"Some origins ({len(pd.unique(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas), 'Orig']))}) "
                f"and destinations ({len(pd.unique(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas), 'Dest']))}) "
                f"are outside the study area. Removing them.")
            commuting_flows = commuting_flows.loc[commuting_flows.Orig.isin(study_msoas)]
            commuting_flows = commuting_flows.loc[commuting_flows.Dest.isin(study_msoas)]
        assert len(commuting_flows.loc[~commuting_flows.Orig.isin(study_msoas)]) == 0
        assert len(commuting_flows.loc[~commuting_flows.Dest.isin(study_msoas)]) == 0
        assert len(pd.unique(commuting_flows["Orig"])) == len(study_msoas)
        assert len(pd.unique(commuting_flows["Dest"])) == len(study_msoas)

        # There should be a flow between every possible combination of areas:
        assert len(study_msoas) ** 2 == len(commuting_flows)

        return commuting_flows """

    def add_work_flows(self,flow_type: str,individuals: pd.DataFrame,orig,dest) -> (pd.DataFrame):
        venues_col = f"{flow_type}{ColumnNames.ACTIVITY_VENUES}"
        flows_col = f"{flow_type}{ColumnNames.ACTIVITY_FLOWS}"
        prob = [[0] for _ in range(len(individuals))]
        destf = [[] for _ in range(len(individuals))]
        for i in range(len(orig)):
            indid = np.where(individuals['idp'] == orig[i])[0][0]
            prob[indid] = [1]
            destf[indid] = [dest[i]]
        individuals[venues_col] = destf
        individuals[flows_col] = prob
        return individuals


    """ def add_work_flows(self, flow_type: str, individuals: pd.DataFrame, workplaces: pd.DataFrame,
                       commuting_flows: pd.DataFrame, flow_threshold) -> (pd.DataFrame):
        
        Create a dataframe of work locations that individuals travel to. The flows are based on general commuting
        patterns and assume one work location per industry type MSOA.
        :param flow_type: The name for these flows (probably something like 'Work')
        :param individuals: The dataframe of synthetic individuals
        :param workplaces:  The dataframe of workplaces (i.e. occupations)
        :param commuting_flows: The general commuting flows between MSOAs (an O-D matrix)
        :param flow_threshold: Only include the top x destinations as possible flows. 'None' means no limit.
        :return: The new 'individuals' dataframe (with new columns)
        
        # The logic of this function is basically copied from add_individual_flows()

        # Names for the columns and empty lists to store the venues and flows
        venues_col = f"{flow_type}{ColumnNames.ACTIVITY_VENUES}"
        flows_col = f"{flow_type}{ColumnNames.ACTIVITY_FLOWS}"
        individuals[venues_col] = [[] for _ in range(len(individuals))]
        individuals[flows_col] = [[] for _ in range(len(individuals))]

        # Later we also record the individual risks for each activity per individual. It's nice if the columns for
        # each activity are grouped together, so create that column now.
        individuals[f"{flow_type}{ColumnNames.ACTIVITY_RISK}"] = [-1] * len(individuals)

        with multiprocessing.Pool(processes=int(os.cpu_count() / 2)) as pool:

            # Do all individuals in an MSOA at once
            for msoa in tqdm(pd.unique(individuals[ColumnNames.MSOAsID]), desc="Assigning work flows"):
                # Get the indices of the individuals in this msoa
                individuals_idx = individuals.index[individuals[ColumnNames.MSOAsID] == msoa]

                # Destinations with positive flows and the flows themselves.
                dests_and_flows = commuting_flows.loc[
                    (commuting_flows.Orig == msoa) & (commuting_flows.Total_Flow > 0),]
                if flow_threshold is not None and len(dests_and_flows) > flow_threshold:
                    # Keep only the x destinations with largest flows
                    dests_and_flows = \
                        dests_and_flows.sort_values(by="Total_Flow", ascending=False).iloc[0:flow_threshold].copy()
                dests_msoas = dests_and_flows["Dest"].values  # The MSOA destinations
                # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
                flows = PopulationInitialisation._normalise(dests_and_flows["Total_Flow"].values)
                assert len(dests_msoas) == len(flows)
                assert True in [x > 0.0 for x in flows]  # Check that there is a non-zero flow

                # Now have destination MSOAs (list), flows (list), need to work out, for each individual
                # what the destination activity place is called (MSOA+SOC), get that place's ID and assign
                # those IDs as the destinations.
                socs = list(individuals.loc[individuals_idx, "soc2010"].values)  # SOC for each individual
                # TODO: this is hard-coded, add this threshold to the list of thresholds in Configuration.py?
                individuals_venues = np.array(pool.starmap(PopulationInitialisation._calc_workplace_indices, zip(
                    socs,  # A 1D list; one soc for each individual in this msoa
                    (dests_msoas for _ in range(len(socs))),  # list of dests, 2D, one list for each individual
                    (workplaces for _ in range(len(socs)))  # list of pointers to the workplaces df,
                )))
                # Only way I can get pandas to correctly assign the list to each cell is with a for loop
                # individuals.loc[individuals_idx, venues_col]  = individuals_venues  # Doesn't work
                for i, idx in enumerate(individuals_idx):
                    individuals.at[idx, venues_col] = individuals_venues[i]

                # Flows are easier as every individual in this msoa has the same flows
                individuals.loc[individuals_idx, flows_col] = \
                    individuals.loc[individuals_idx, flows_col].apply(lambda _: flows).values

        # Check everyone has some flows (all list lengths are >0)
        assert False not in (individuals.loc[:, venues_col].apply(lambda cell: len(cell)) > 0).values
        assert False not in (individuals.loc[:, flows_col].apply(lambda cell: len(cell)) > 0).values

        return individuals
    """

    @staticmethod
    def _calc_workplace_indices(soc: str, dest_msoas: List, workplace_df: pd.DataFrame):
        """
        Work out the workplaces where an individual might work, given their soc,
        the names of the destination MSOAs where they might work, and the workplaces dataframe so that
        they can work out what the index of the workplace is. This works because each virtual workplace is uniquely
        named by it's msoa and industry type (i.e. f"{msoa}-{row['soc2010']}")

        :param soc: A individuals's soc (industry where they work)3
        :param dest_msoas: A list of the destination MSOA names for the individual
        :param workplace_df: The dataframe containing all workplaces
        :return:
        """
        workplace_ids = [
            int(workplace_df.loc[workplace_df[ColumnNames.LOCATION_NAME] == f"{msoa}-{soc}"].index[0])
            for msoa in dest_msoas]
        assert False not in (isinstance(id, int) for id in workplace_ids)  # Check all are ints (not lists etc)
        return workplace_ids

    @staticmethod
    def _assign_work_flow(job, workplaces):
        return workplaces.index[workplaces[ColumnNames.LOCATION_NAME] == job].values[0]

    def read_retail_flows_data(self, study_msoas: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Read the flows between each MSOA and the most commonly visited shops

        :param study_msoas: A list of MSOAs in the study area (flows outside of this will be ignored)
        :return: A tuple of two dataframes. One containing all of the flows and another
        containing information about the stores themselves.
        """

        print("Reading retail flow data...", )
        # Read the stores
        stores = pd.read_csv(Constants.Paths.RETAIL.FULL_PATH_FILE)
        # Add some standard columns that all locations need
        stores_ids = list(stores.index)
        store_names = stores.id  # unique ID for venue
        PopulationInitialisation._add_location_columns(stores, location_names=store_names, location_ids=stores_ids)

        # Read the flows
        threshold = Constants.Thresholds.RETAIL  # top 10
        thresholdtype = Constants.Thresholds.RETAIL_TYPE  # threshold based on nr venues
        flow_matrix = self.quant_object.get_flows("Retail", study_msoas, threshold,
                                                  thresholdtype)  ## get_flows is defined in file 'quant_api.py'

        return stores, flow_matrix

    def read_nightclubs_flows_data(self, study_msoas: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Read the flows between each MSOA and the most commonly visited nightclubs

        :param study_msoas: A list of MSOAs in the study area (flows outside of this will be ignored)
        :param quant_object: The QuantRampAPI object used to estimate destination school and retail locations
        :return: A tuple of two dataframes. One containing all of the flows and another
        containing information about the stores themselves.
        """

        print("Reading nightclubs flow data...", )
        # Read the nightclubs
        nightclubs = pd.read_csv(Constants.Paths.NIGHTCLUBS.FULL_PATH_FILE)
        # Add some standard columns that all locations need
        nightclubs_ids = list(nightclubs.index)
        nightclubs_names = nightclubs.id  # unique ID for venue
        PopulationInitialisation._add_location_columns(nightclubs, location_names=nightclubs_names,
                                                       location_ids=nightclubs_ids)

        # Read the flows
        threshold = Constants.Thresholds.NIGHTCLUB  # top 10
        thresholdtype = Constants.Thresholds.NIGHTCLUB_TYPE  # "nr"  # threshold based on nr venues
        flow_matrix = self.quant_object.get_flows("Nightclubs", study_msoas, threshold, thresholdtype)

        return nightclubs, flow_matrix

    @staticmethod
    def check_sim_flows(locations: pd.DataFrame, flows: pd.DataFrame):
        """
        Check that the flow matrix looks OK, raising an error if not
        :param locations: A DataFrame with information about each location (destination)
        :param flows: The flow matrix itself, showing flows from origin MSOAs to destinations
        :return:
        """
        # TODO All MSOA codes are unique
        # TODO Locations have 'Danger' and 'ID' columns
        # TODO Number of destination columns ('Loc_*') matches number of locations
        # TODO Number of origins (rows) in the flow matrix matches number of OAs in the locations
        return

    @staticmethod
    def _add_location_columns(locations: pd.DataFrame, location_names: List[str], location_ids: List[int] = None):
        """
        Add some standard columns to DataFrame (in place) that contains information about locations.
        :param locations: The dataframe of locations that the columns will be added to
        :param location_names: Names of the locations (e.g shop names)
        :param location_ids: Can optionally include a list of IDs. An 'ID' column is always created, but if no specific
        IDs are provided then the ID will be the same as the index (i.e. the row number). If ids are provided then
        the ID column will be set to the given IDs, but the index will still be the row number.
        :return: None; the columns are added to the input dataframe inplace.
        """
        # Make sure the index will always be the row number
        locations.reset_index(inplace=True, drop=True)
        if location_ids is None:
            # No specific index provided, just use the index
            locations[ColumnNames.LOCATION_ID] = locations.index
        else:
            # User has provided a specific list of indices to use
            if len(location_ids) != len(locations):
                raise Exception(f"When adding the standard columns to a locations dataframe, a list of specific",
                                f"IDs has ben passed, but this list (length {len(location_ids)}) is not the same"
                                f"length as the locations dataframe (length {len(locations)}. The list of ids passed"
                                f"is: {location_ids}.")
            locations[ColumnNames.LOCATION_ID] = location_ids
        if len(location_names) != len(locations):
            raise Exception(f"The list of location names is not the same as the number of locations in the dataframe",
                            f"({len(location_names)} != {len(locations)}.")
        locations[ColumnNames.LOCATION_NAME] = location_names  # Standard name for the location
        locations[ColumnNames.LOCATION_DANGER] = 0  # All locations have a disease danger of 0 initially
        # locations.set_index(ColumnNames.LOCATION_ID, inplace=True, drop=False)
        return None  # Columns added in place so nothing to return

    @staticmethod
    def add_individual_flows(flow_type: str, individuals: pd.DataFrame, flow_matrix: pd.DataFrame) -> pd.DataFrame:
        """
        Take a flow matrix from MSOAs to (e.g. retail) locations and assign flows to individuals.

        It assigns the id of the destination of the flow according to its column in the matrix. So the first column
        that has flows for a destination is given index 0, the second is index 1, etc. This is probably not the same as
        the ID of the venue that they point to (e.g. the first store probably has ID 1, but will be given the index 0)
        so it is important that when the activity_locations are created, they are created in the same order as the
        columns that appear in the matrix. The first column in the matrix must also be the first row in the locations
        data.
        :param flow_type: What type of flows are these. This will be appended to the column names. E.g. "Retail".
        :param individuals: The DataFrame containing information about all individuals
        :param flow_matrix: The flow matrix, created by (e.g.) read_retail_flows_data()
        :return: The DataFrame of individuals with new locations and probabilities added
        """

        # Check that there aren't any individuals who wont be given any flows
        if len(individuals.loc[-individuals[ColumnNames.MSOAsID].isin(flow_matrix.Area_Code)]) > 0:
            raise Exception(f"Some individuals will not be assigned any flows to: '{flow_type}' because their"
                            f"MSOA is not in the flow matrix: "
                            f"{individuals.loc[-individuals[ColumnNames.MSOAsID].isin(flow_matrix.Area_Code)]}.")

        # Check that there aren't any duplicate flows
        if len(flow_matrix) != len(flow_matrix.Area_Code.unique()):
            raise Exception("There are duplicate area codes in the flow matrix: ", flow_matrix.Area_Code)

        # Names for the new columns
        venues_col = f"{flow_type}{ColumnNames.ACTIVITY_VENUES}"
        flows_col = f"{flow_type}{ColumnNames.ACTIVITY_FLOWS}"

        # Create empty lists to hold the venues and flows for each individuals
        individuals[venues_col] = [[] for _ in range(len(individuals))]
        individuals[flows_col] = [[] for _ in range(len(individuals))]

        # Later we also record the individual risks for each activity per individual. It's nice if the columns for
        # each activity are grouped together, so create that column now.
        individuals[f"{flow_type}{ColumnNames.ACTIVITY_RISK}"] = [-1] * len(individuals)

        # Use a hierarchical index on the Area to speed up finding all individuals in an area
        # (not sure this makes much difference).
        # name = ColumnNames.MSOAsID
        # print(f"this is number 11 {name}")
        individuals.set_index([ColumnNames.MSOAsID, "ID"], inplace=True, drop=False)

        for area in tqdm(flow_matrix.values,
                         desc=f"Assigning individual flows for {flow_type}"):  # Easier to operate over a 2D matrix rather than a dataframe
            oa_num: int = area[0]
            oa_code: str = area[1]
            # Get rid of the area codes, so are now just left with flows to locations
            area = list(area[2:])
            # Destinations with positive flows and the flows themselves
            dests = []
            flows = []
            for i, flow in enumerate(area):
                if flow > 0.0:
                    dests.append(i)
                    flows.append(flow)

            # Normalise the flows
            flows = PopulationInitialisation._normalise(flows)

            # Now assign individuals in those areas to those flows
            # This ridiculous 'apply' line is the only way I could get pandas to update the particular
            # rows required. Something like 'individuals.loc[ ...] = dests' (see below) didn't work because
            # instead of inserting the 'dests' list itself, pandas tried to unpack the list and insert
            # the individual values instead.
            # individuals.loc[individuals.area == oa_code, f"{flow_type}_Venues"] = dests
            # individuals.loc[individuals.area == oa_code, f"{flow_type}_Probabilities"] = flow
            #
            # A quicker way to do this is probably to create N subsets of individuals (one table for
            # each area) and then concatenate them at the end.
            individuals.loc[oa_code, venues_col] = \
                individuals.loc[oa_code, venues_col].apply(lambda _: dests).values
            individuals.loc[oa_code, flows_col] = \
                individuals.loc[oa_code, flows_col].apply(lambda _: flows).values
            # individuals.loc[individuals.area=="E02004189", f"{flow_type}_Venues"] = \
            #    individuals.loc[individuals.area=="E02004189", f"{flow_type}_Venues"].apply(lambda _: dests)
            # individuals.loc[individuals.area=="E02004189", f"{flow_type}_Probabilities"] = \
            #    individuals.loc[individuals.area=="E02004189", f"{flow_type}_Probabilities"].apply(lambda _: flows)

        # Reset the index so that it's not the PID
        individuals.reset_index(inplace=True, drop=True)

        # Check everyone has some flows (all list lengths are >0)
        assert False not in (individuals.loc[:, venues_col].apply(lambda cell: len(cell)) > 0).values
        assert False not in (individuals.loc[:, flows_col].apply(lambda cell: len(cell)) > 0).values

        return individuals

    @staticmethod
    def pad_durations(individuals, activity_locations) -> pd.DataFrame:
        """
        Some individuals' activity durations don't add up to 1. In these cases pad them out with extra time at home.
        :param individuals:
        :param activity_locations:
        :return: The new individuals dataframe
        """
        
        total_duration = [0.0] * len(individuals)  # Add up all the different activity durations

        for activity in activity_locations.keys():
            # To not carry decimal that would damage the computation of the total duration and the missing time at home I round the durations to 2 values, Then I will guarante all values.
            individuals.loc[:, f"{activity}{ColumnNames.ACTIVITY_DURATION}"] = round(
                individuals.loc[:, f"{activity}{ColumnNames.ACTIVITY_DURATION}"], 2)
            total_duration = total_duration + individuals.loc[:, f"{activity}{ColumnNames.ACTIVITY_DURATION}"]
        total_duration = total_duration.apply(lambda x: round(x, 5))

        #assert (total_duration <= (1.0).all()  # None should be more than 1.0 (after rounding)

        missing_duration = 1.0 - total_duration  # Amount of activity time that needs to be added on to home
        missing_duration = missing_duration.apply(lambda x: round(x,5))

        individuals[f"{ColumnNames.Activities.HOME}{ColumnNames.ACTIVITY_DURATION}"] = \
            (individuals[f"{ColumnNames.Activities.HOME}{ColumnNames.ACTIVITY_DURATION}"] + missing_duration)

        individuals[f"{ColumnNames.Activities.HOME}{ColumnNames.ACTIVITY_DURATION}"] = \
            (individuals[f"{ColumnNames.Activities.HOME}{ColumnNames.ACTIVITY_DURATION}"].mask(individuals[f"{ColumnNames.Activities.HOME}{ColumnNames.ACTIVITY_DURATION}"]<0,0))

        check_durations_sum_to_1(individuals, activity_locations.keys())

        return individuals

    @staticmethod
    def _normalise(l: List[float], decimals=3) -> List[float]:
        """
        Normalise a list so that it sums to almost 1.0. Rounding might cause it not to add exactly to 1

        :param decimals: Optionally round to the number of decimal places. Default 3. If 'None' the do no rounding.
        """
        if not isinstance(l, Iterable):
            raise Exception("Can only work with iterables")
        if len(l) == 1:  # Special case for 1-item iterables
            return [1.0]

        l = np.array(l)  # Easier to work with numpy vectorised operators
        total = l.sum()
        l = l / total
        if decimals is None:
            return list(l)
        return [round(x, decimals) for x in l]

    @staticmethod
    def add_disease_columns(individuals: pd.DataFrame) -> pd.DataFrame:
        """Adds columns required to estimate disease prevalence"""
        individuals[ColumnNames.DISEASE_STATUS] = 0
        individuals[ColumnNames.DISEASE_STATUS_CHANGED] = False
        # individuals[ColumnNames.DAYS_WITH_STATUS] = 0  # Also keep the number of days that have elapsed with this status
        individuals[ColumnNames.CURRENT_RISK] = 0  # This is the risk that people get when visiting locations.

        # No longer update disease counts per MSOA etc. Not needed
        # individuals[ColumnNames.MSOA_CASES] = 0  # Useful to count cases per MSOA
        # individuals[ColumnNames.HID_CASES] = 0  # Ditto for the household

        individuals[ColumnNames.DISEASE_PRESYMP] = -1
        individuals[ColumnNames.DISEASE_SYMP_DAYS] = -1
        individuals[ColumnNames.DISEASE_EXPOSED_DAYS] = -1
        return individuals
