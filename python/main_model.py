#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Core RAMP-UA model.

Created on Tue Apr 6

@author: Anna on Nick's code, for the national scaling-up
"""
import sys
sys.path.append("microsim")  # This is only needed when testing. I'm so confused about the imports
import multiprocessing
import pandas as pd
import numpy as np
pd.set_option('display.expand_frame_repr', False)  # Don't wrap lines when displaying DataFrames
# pd.set_option('display.width', 0)  # Automatically find the best width
import os
import click  # command-line interface
import pickle  # to save data
from yaml import load, SafeLoader  # pyyaml library for reading the parameters.yml file
from shutil import copyfile

# from model.microsim.microsim_model import MicrosimModel # are we keeping the R/Python model or not?
from coding.run import run_opencl
from coding.snapshot_convertor import SnapshotConvertor
from coding.snapshot import Snapshot
from coding.params import Params, IndividualHazardMultipliers, LocationHazardMultipliers
from coding.initialise.initialisation_cache import InitialisationCache
from coding.constants import Constants
from coding.constants import ColumnNames

@click.command()
@click.option('-p',
              '--parameters-file',
              type=click.Path(exists=True),
              help="Parameters file to use to configure the model. This must be located in the working directory.")
def main(parameters_file):
    """
    Main function which runs the population initialisation, then chooses which model to run, either the Python/R
    model or the OpenCL model
    """

    print(f"--\nReading parameters file: {parameters_file}\n--")

    try:
        with open(parameters_file, 'r') as f:
            #print(f"Reading parameters file: {parameters_file}. ")
            # print(f"Reading parameters file: {parameters_file}. ")
            parameters = load(f,
                              Loader=SafeLoader)
            sim_params = parameters["microsim"]  # Parameters for the dynamic microsim (python)
            calibration_params = parameters["microsim_calibration"]
            disease_params = parameters["disease"]  # Parameters for the disease model (r)
            # TODO Implement a more elegant way to set the parameters and pass them to the model. E.g.:
            #         self.params, self.params_changed = Model._init_kwargs(params, kwargs)
            #         [setattr(self, key, value) for key, value in self.params.items()]
            # Utility parameters
            scenario = sim_params["scenario"]
            initialise = sim_params["initialise"]
            iterations = sim_params["iterations"]
#            Constants.Paths.PROJECT_FOLDER_ABSOLUTE_PATH = sim_params["project-dir-absolute-path"]
            study_area = sim_params["study-area"]
            # selected_region_folder_name = sim_params["selected-region-folder-name"]
            output = sim_params["output"]
            output_every_iteration = sim_params["output-every-iteration"]
            debug = sim_params["debug"]
            repetitions = sim_params["repetitions"]
            use_lockdown = sim_params["use-lockdown"]
            # quant_dir = sim_params["quant-dir"]
            open_cl_model = sim_params["opencl-model"]
            opencl_gui = sim_params["opencl-gui"]
            opencl_gpu = sim_params["opencl-gpu"]
            startDate = sim_params["start-date"]
    except Exception as error:
        print('Error in parameters file format')
        raise error

    # Check the parameters are sensible
    if iterations < 1:
        raise ValueError("Iterations must be > 1. If you want to just initialise the model and then exit,"
                        "set initialise : true")
    if repetitions < 1:
        raise ValueError("Repetitions must be greater than 0")
    if (not output) and output_every_iteration:
        raise ValueError("Can't choose to not output any data (output=False) but also write the data at every "
                        "iteration (output_every_iteration=True)")


    # To fix file path issues, use absolute/full path at all times
    # Pick either: get working directory (if user starts this script in place, or set working directory)
    # Option A: copy current working directory:
    ###### current_working_dir = os.getcwd()  # get current directory
    # TODO: change this working dir because it's not correct and had to add the ".." in the 2 paths under here

    # Check that working directory is as expected
    # path = os.path.join(current_working_dir, "..", Constants.Paths.DATA_FOLDER, Constants.Paths.REGIONAL_DATA_FOLDER)
    # if not os.path.exists(os.path.join(current_working_dir, "..", Constants.Paths.DATA_FOLDER, Constants.Paths.REGIONAL_DATA_FOLDER)):
    if not os.path.exists(os.path.join(Constants.Paths.PROCESSED_DATA.FULL_PATH_FOLDER)):
        raise Exception("Data folder structure not valid. Make sure you are running within correct working directory.")

    # Accessing the cache data (pre-processed data) generated by the module main_initialisation.
    # This is located in the selected study area folder in processed_data
    # The study area is assigned in model_parameters/default.yml in the class "microsim.study-area"
    study_area_folder_in_processed_data = os.path.join(Constants.Paths.PROCESSED_DATA.FULL_PATH_FOLDER,
                                                       study_area)  # this generates the folder name
    print(f"study area folder {study_area_folder_in_processed_data}")
    if not os.path.exists(study_area_folder_in_processed_data):
        raise Exception("Study area folder doesn't exist, check the spelling or the location")

    run_opencl_model(iterations,
                     study_area,
                     opencl_gui,
                     opencl_gpu,
                     initialise,
                     calibration_params,
                     disease_params,
                     parameters_file,
                     use_lockdown)


def run_opencl_model(iterations,
                     # regional_data_dir_full_path,
                     study_area,
                     use_gui,
                     use_gpu,
                     initialise,
                     calibration_params,
                     disease_params,
                     parameters_file,
                     use_lockdown):
    study_area_folder_in_processed_data = os.path.join(Constants.Paths.PROCESSED_DATA.FULL_PATH_FOLDER,
                                                       study_area)
    snapshot_cache_filepath = os.path.join(study_area_folder_in_processed_data, "snapshot", "cache.npz")

    # Choose whether to load snapshot file from cache, or create a snapshot from population data
    if not os.path.exists(snapshot_cache_filepath):
        print("\nGenerating Snapshot for OpenCL model")
        cache = InitialisationCache(cache_dir=study_area_folder_in_processed_data)
        if cache.is_empty():
            raise Exception(f'You will need to run the main_initialisation module because the cache is empty')
        print("Loading data from previous cache")
        individuals, activity_locations, lockdown_file = cache.read_from_cache()

        if use_lockdown:
            print(f"Loading the lockdown scenario")
            time_activity_multiplier = lockdown_file.change
            time_activity_multiplier = time_activity_multiplier[startDate:len(time_activity_multiplier)] # offset file to start date
            time_activity_multiplier.index = range(len(time_activity_multiplier))
        else:
            time_activity_multiplier = np.ones(2000)

        snapshot_converter = SnapshotConvertor(individuals,
                                               activity_locations,
                                               time_activity_multiplier,
                                               study_area_folder_in_processed_data)
        snapshot = snapshot_converter.generate_snapshot()
        if not os.path.exists(os.path.join(study_area_folder_in_processed_data, "snapshot")):
            os.makedirs(os.path.join(study_area_folder_in_processed_data, "snapshot"))
        snapshot.save(snapshot_cache_filepath)  # store snapshot in cache so we can load later
    else:  # load cached snapshot
        snapshot = Snapshot.load_full_snapshot(path=snapshot_cache_filepath)

    # set the random seed of the model
    snapshot.seed_prngs(42)

    # set params
    if calibration_params is not None and disease_params is not None:
        snapshot.update_params(create_params(calibration_params, disease_params))

        if disease_params["improve_health"]:
            print("Switching to healthier population")
            snapshot.switch_to_healthier_population()
    if initialise:
        print("Have finished initialising model. -init flag is set so not running it. Exiting")
        return

    run_mode = "GUI" if use_gui else "headless"
    print(f"\nRunning OpenCL model in {run_mode} mode")
    run_opencl(snapshot,
               study_area,
               parameters_file,
               iterations,
               use_gui,
               use_gpu,
               quiet=False
               )


# def run_python_model(individuals_df, activity_locations_df, time_activity_multiplier, msim_args, iterations,
#                      repetitions, parameters_file):
#     print("\nRunning Python / R model")
#
#     # Create a microsim object
#     m = MicrosimModel(individuals_df, activity_locations_df, time_activity_multiplier, **msim_args)
#     copyfile(parameters_file, os.path.join(m.SCEN_DIR, "parameters.yml"))# use: copyfile(microsim,destination)
#
#     # Run the Python / R model
#     if repetitions == 1:
#         m.run(iterations, 0)
#     elif repetitions >= 1:  # Run it multiple times on lots of cores
#         try:
#             with multiprocessing.Pool(processes=int(os.cpu_count())) as pool:
#                 # Copy the model instance so we don't have to re-read the data each time
#                 # (Use a generator so we don't need to store all the models in memory at once).
#                 models = (MicrosimModel._make_a_copy(m) for _ in range(repetitions))
#                 pickle_out = open(os.path.join("Models_m.pickle"), "wb")
#                 pickle.dump(m, pickle_out)
#                 pickle_out.close()
#                 # models = ( Microsim(msim_args) for _ in range(repetitions))
#                 # Also need a list giving the number of iterations for each model (same for each model)
#                 iters = (iterations for _ in range(repetitions))
#                 repnr = (r for r in range(repetitions))
#                 # Run the models by passing each model and the number of iterations
#                 pool.starmap(_run_multicore, zip(models, iters, repnr))
#         finally:  # Make sure they get closed (shouldn't be necessary)
#             pool.close()


def _run_multicore(m, iter, rep):
    return m.run(iter, rep)


def create_params(calibration_params, disease_params):
    current_risk_beta = disease_params["current_risk_beta"]

    # NB: OpenCL model incorporates the current risk beta by pre-multiplying the hazard multipliers with it
    location_hazard_multipliers = LocationHazardMultipliers(
        retail=calibration_params["hazard_location_multipliers"]["Retail"] * current_risk_beta,
        nightclubs=calibration_params["hazard_location_multipliers"]["Nightclubs"] * current_risk_beta,
        primary_school=calibration_params["hazard_location_multipliers"]["PrimarySchool"] * current_risk_beta,
        secondary_school=calibration_params["hazard_location_multipliers"]["SecondarySchool"] * current_risk_beta,
        home=calibration_params["hazard_location_multipliers"]["Home"] * current_risk_beta,
        work=calibration_params["hazard_location_multipliers"]["Work"] * current_risk_beta,
    )

    individual_hazard_multipliers = IndividualHazardMultipliers(
        presymptomatic=calibration_params["hazard_individual_multipliers"]["presymptomatic"],
        asymptomatic=calibration_params["hazard_individual_multipliers"]["asymptomatic"],
        symptomatic=calibration_params["hazard_individual_multipliers"]["symptomatic"]
    )

    obesity_multipliers = [disease_params["overweight"], disease_params["obesity_30"], disease_params["obesity_35"],
                           disease_params["obesity_40"]]

    return Params(
        location_hazard_multipliers=location_hazard_multipliers,
        individual_hazard_multipliers=individual_hazard_multipliers,
        obesity_multipliers=obesity_multipliers,
        cvd_multiplier=disease_params["cvd"],
        diabetes_multiplier=disease_params["diabetes"],
        bloodpressure_multiplier=disease_params["bloodpressure"],
    )

if __name__ == "__main__":
    main()
    print("End of program")
