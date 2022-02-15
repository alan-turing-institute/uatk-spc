import os


# INIT_DATA_MSOAS_RISK = "initial_cases.csv"
# INIT_DATA_CASES = "msoas.csv"

#### NOTE: Please leave the following checks commented out, do not delete until fully tested
#print(f"*** check 1 \n {os.getcwd()}")
# print(f"*** check 2 \n {os.path.dirname(__file__)}")
# not needed anymore: # os.chdir(os.path.dirname(__file__)) # change dir to the current file's path
# print(f"*** check 3 \n {os.getcwd()}")

abspath = os.getcwd() # this one works when starting from working the project folder
# NOTE: in PyCharm in run configurations:
# Parameters: -p model_parameters/default.yml
# Working directory: your project location
parameters_folder = "model_parameters"
# /ramp/
code_folder = "ramp"
initialise_folder = "initialise"
r_python_model_folder = "microsim"
opencl_fonts_folder = "fonts"
opencl_kernels_folder = "kernels"
opencl_shaders_folder = "shaders"
# /data/
data_folder = "data"
raw_data_folder = "raw_data"
processed_data_folder = "processed_data"
reference_data_folder = "reference_data"
national_data_folder = "national_data"
quant_data_folder = "QUANT_RAMP"
msoas_shp_folder = "MSOAS_shp"
county_data_folder = "county_data"
osm_data_folder = "OSM"
# /output/
output_folder = "output"




class Constants:
    """Used to reflect the folder structure expected by the code"""
    class Paths:
        AZURE_URL = "https://ramp0storage.blob.core.windows.net/"
        PROJECT_FOLDER_ABSOLUTE_PATH = abspath
        OUTPUT_FOLDER = ""

        # !!!

        class MSOAS_RISK_FILE:
            FILE = "msoas_risk.csv" #"msoas_risk_west-yorskhire.csv"
            # FULL_PATH_FILE = os.path.join(abspath,
            #                               data_folder,
            #                               raw_data_folder,
            #                               county_data_folder,
            #                               FILE)
        # !!!
        # !!! the parameter below is HARD_CODED !!!
        # class LIST_MSOAS:
        #     FILE = "test_msoalist.csv" #"wy_msoalist.csv" #"devon_msoalist.csv" #"test_msoalist.csv" ## better in parameters! (default.yml)  ## this is only temporaneous
        #     PARAM_FOLDER = "model_parameters/"
        #     FULL_PATH_FILE = os.path.join(abspath,
        #                                   PARAM_FOLDER,
        #                                   FILE)
        # !!!

        class PARAMETERS:
            FOLDER = parameters_folder
            FULL_PATH = os.path.join(abspath,
                                     FOLDER)

        class CODE:
            FOLDER = code_folder
            FULL_PATH = os.path.join(abspath,
                                     FOLDER)
        class DATA:
            FOLDER = data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            FOLDER)
        #--> DATA
        class RAW_DATA:
            FOLDER = raw_data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            FOLDER)
        #-->--> RAW_DATA
        class REFERENCE_DATA:
            FOLDER = reference_data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            FOLDER)
        #-->-->--> REFERENCE_DATA
        class LUT:
            FILE = "lookUp.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          reference_data_folder,
                                          FILE)
        class SEEDING_FILE:
            FILE = "initial_cases.csv" #"england_initial_casesCTY_tbc.csv"  # at the moment is not in reference data !!!!!!!!!!!!
            # instead, we have a file initial_cases for Devon and one for WestYorkshire for trials
            # FULL_PATH_FILE = os.path.join(abspath,
            #                               data_folder,
            #                               raw_data_folder,
            #                               reference_data_folder,
            #                               FILE)
        #<--<--<-- REFERENCE_DATA
        #-->-->--> NATIONAL_DATA
        class NATIONAL_DATA:
            FOLDER = national_data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            FOLDER)
        class TIME_AT_HOME:
            FILE = "timeAtHomeIncreaseCTY.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                         data_folder,
                                         raw_data_folder,
                                         national_data_folder,
                                         FILE)
        class COMMUTING:
            FILE = "commutingOD.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                         data_folder,
                                         raw_data_folder,
                                         national_data_folder,
                                         FILE)
        class BUSINESSREGISTRY:
            FILE = "businessRegistry.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                         data_folder,
                                         raw_data_folder,
                                         national_data_folder,
                                         FILE)
        class NIGHTCLUBS:
            FILE = "nightclubs.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                         data_folder,
                                         raw_data_folder,
                                         national_data_folder,
                                         FILE)
        #-->-->-->-->QUANT
        class QUANT:
            FOLDER = quant_data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            national_data_folder,
                                            FOLDER)
        class PRIMARYSCHOOLS:
            FILE = "primaryZones.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          national_data_folder,
                                          quant_data_folder,
                                          FILE)
        class SECONDARYSCHOOLS:
            FILE = "secondaryZones.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          national_data_folder,
                                          quant_data_folder,
                                          FILE)
        class RETAIL:
            FILE = "retailpointsZones.csv"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          national_data_folder,
                                          quant_data_folder,
                                          FILE)
        #<--<--<--<-- QUANT
        #-->-->-->--> MSOAS_SHAPEFILE
        class MSOAS_FOLDER:
            FOLDER = msoas_shp_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            national_data_folder,
                                            FOLDER)
        class MSOAS_SHP:
            FILE = "msoas.shp" #"bcc21fa2-48d2-42ca-b7b7-0d978761069f2020412-1-12serld.j1f7i.shp"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          national_data_folder,
                                          msoas_shp_folder,
                                          FILE)
        #<--<--<--<-- MSOAS_SHAPEFILE
        #<--<--<-- NATIONAL_DATA
        #-->-->--> COUNTY_DATA
        class COUNTY_DATA:
            FOLDER = "county_data"
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            FOLDER)
        #-->-->-->-->OSM_DATA
        class OSM_FOLDER:
            FOLDER = "OSM"
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            raw_data_folder,
                                            county_data_folder,
                                            FOLDER)
        class OSM_FILE:
            FILE = "gis_osm_buildings_a_free_1.shp"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          county_data_folder,
                                          osm_data_folder,
                                          FILE)
        #-->-->-->--> TU_DATA
        class TU:
            FILE = "tus_hse_"
            FULL_PATH_FILE = os.path.join(abspath,
                                          data_folder,
                                          raw_data_folder,
                                          county_data_folder,
                                          FILE)
        #<--<--<--<-- TU_DATA
        #-->-->-->--> COMMUTING_DATA
        # will be developed in a second moment, not ready yet
        #<--<--<--<-- COMMUTING_DATA
        #<--<--<-- COUNTY_DATA
        #<--<--RAW_DATA
        #>-->--PROCESSED_DATA
        class PROCESSED_DATA:
            FOLDER = processed_data_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            FOLDER)
            CACHE_FILE = "cache.npz"
            BUILDINGS_SHP_FILE = "msoa_building_coordinates.json"
        class SNAPSHOTS:
            FOLDER = "snapshot"
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            data_folder,
                                            processed_data_folder,
                                            FOLDER)
        #<--<--PROCESSED_DATA
        #<-- DATA

        #--> CODE
        class CODING:
            FOLDER = code_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            FOLDER)
        #-->--> INITIALISE
        class INITIALISATION:
            FOLDER = initialise_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            code_folder,
                                            FOLDER)
        #<--<-- INITIALISE
        #-->--> MODEL
        class MODEL:
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            code_folder)
        #-->-->--> R/PYTHon
        class RPTYHON_MODEL:
            FOLDER = r_python_model_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            code_folder,
                                            FOLDER)
        #<--<--<-- R/PYTHon
        #-->-->--> OPENCL
        class OPENCL_MODEL:
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            code_folder)
        class OPENCL_FONTS:
            FOLDER = opencl_fonts_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            code_folder,
                                            FOLDER)
            FONT_DROID = "DroidSans.ttf"
            FULL_PATH_DROID = os.path.join(abspath,
                                           code_folder,
                                           FOLDER,
                                           FONT_DROID)
            FONT_ROBOTO = "RobotoMono.ttf"
            FULL_PATH_ROBOTO = os.path.join(abspath,
                                            code_folder,
                                            FOLDER,
                                            FONT_ROBOTO)
        class OPENCL_SOURCE:
            FULL_PATH_SOURCE = os.path.join(abspath,
                                            code_folder)
            KERNELS_FOLDER = opencl_kernels_folder
            FULL_PATH_KERNEL_FOLDER = os.path.join(abspath,
                                                   code_folder,
                                                   KERNELS_FOLDER)
            # **** IMPORTANT ****
            # The following variable is used only by Simulator module
            # OpenCL kernels are really sensible to the path provided
            # Specifically, you have to start from 'after' the current working directory
            # that currently is abspath/project_folder/ (must be consistent with the  configurations)
            FOLDER_PATH_FOR_KERNEL = os.path.join(code_folder,
                                                  KERNELS_FOLDER)
            KERNEL_FILE = "ramp_ua.cl"
            FULL_PATH_KERNEL_FILE = os.path.join(abspath,
                                                 code_folder,
                                                 KERNELS_FOLDER,
                                                 KERNEL_FILE)
            # **** END ****
            SHADERS_FOLDER = opencl_shaders_folder
            FULL_PATH_SHADERS_FOLDER = os.path.join(abspath,
                                                    code_folder,
                                                    SHADERS_FOLDER)
            # The following variable is used only by shader.py
            # OpenCL kernels are really sensible to the path provided
            # Specifically, you have to start from the current working directory
            # that currently is abspath/project_folder/ramp/ (see configurations)
            FOLDER_PATH_FOR_SHADERS = os.path.join(SHADERS_FOLDER)

        #<--<--<-- OPENCL
        #<-<-- MODEL
        #<-- DATA
        #--> OUTPUT
        class OUTPUT_FOLDER:
            FOLDER = output_folder
            FULL_PATH_FOLDER = os.path.join(abspath,
                                            FOLDER)
        #<-- OUTPUT

    class OnlinePaths:
        pass
   
        
    class Thresholds:
        SCHOOL = 5
        SCHOOL_TYPE = "nr"
        RETAIL = 10
        RETAIL_TYPE = "nr"
        NIGHTCLUB = 10
        NIGHTCLUB_TYPE = "nr"


class ColumnNames:
    """Used to record standard dataframe column names used throughout"""
    MSOAsID = "MSOA11CD" # "area" for West Yorkshire
    TIME_ACTIVITY_MULTIPLIER = "timeout_multiplier" # for Devon data, "change" in the new data generated from raw_data_handler... check this to gove the correct old name!
    MSOAS_SHP_POP = "pop"
    LOCKDOWN_CTY_NAME = "CTY20"
    LOCATION_DANGER = "Danger"  # Danger associated with a location
    LOCATION_NAME = "Location_Name"  # Name of a location
    LOCATION_ID = "ID"  # Unique ID for each location

    # # Define the different types of activities/locations that the model can represent
    class Activities:
        RETAIL = "Retail"
        PRIMARY = "PrimarySchool"
        SECONDARY = "SecondarySchool"
        HOME = "Home"
        WORK = "Work"
        NIGHTCLUBS = "Nightclubs"
        ALL = [RETAIL, PRIMARY, SECONDARY, HOME, WORK, NIGHTCLUBS]

    ACTIVITY_VENUES = "_Venues"  # Venues an individual may visit. Appended to activity type, e.g. 'Retail_Venues'
    ACTIVITY_FLOWS = "_Flows"  # Flows to a venue for an individual. Appended to activity type, e.g. 'Retail_Flows'
    ACTIVITY_RISK = "_Risk"  # Risk associated with a particular activity for each individual. E.g. 'Retail_Risk'
    ACTIVITY_DURATION = "_Duration" # Column to record proportion of the day that individuals do the activity
    ACTIVITY_DURATION_INITIAL = "_Duration_Initial"  # Amount of time on the activity at the start (might change)

    # Standard columns for time spent travelling in different modes
    TRAVEL_CAR = "Car"
    TRAVEL_BUS = "Bus"
    TRAVEL_TRAIN = "Train"
    TRAVEL_WALK = "Walk"

    INDIVIDUAL_AGE = "DC1117EW_C_AGE" # Age column in the table of individuals
    INDIVIDUAL_SEX = "DC1117EW_C_SEX"  # Sex column in the table of individuals
    INDIVIDUAL_ETH = "DC2101EW_C_ETHPUK11"  # Ethnicity column in the table of individuals

    # Columns for information about the disease. These are needed for estimating the disease status

    # Disease status is one of the following:
    class DiseaseStatuses:
        SUSCEPTIBLE = 0
        EXPOSED = 1
        PRESYMPTOMATIC = 2
        SYMPTOMATIC = 3
        ASYMPTOMATIC = 4
        RECOVERED = 5
        DEAD = 6
        ALL = [SUSCEPTIBLE, EXPOSED, PRESYMPTOMATIC, SYMPTOMATIC, ASYMPTOMATIC, RECOVERED, DEAD]
        assert len(ALL) == 7

    DISEASE_STATUS = "disease_status"  # Which one it is
    DISEASE_STATUS_CHANGED = "status_changed"  # Whether it has changed between the current iteration and the last
    DISEASE_PRESYMP = "presymp_days"
    DISEASE_SYMP_DAYS = "symp_days"
    DISEASE_EXPOSED_DAYS = "exposed_days"

    #DAYS_WITH_STATUS = "Days_With_Status"  # The number of days that have elapsed with this status
    CURRENT_RISK = "current_risk"  # This is the risk that people get when visiting locations.

    # No longer update disease counts per MSOA etc. Not needed
    MSOA_CASES = "MSOA_Cases"  # The number of cases per MSOA
    HID_CASES = "HID_Cases"  # The number of cases in the individual's house
