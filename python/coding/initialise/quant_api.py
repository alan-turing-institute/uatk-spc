from coding.constants import Constants
import pandas as pd
import numpy as np
import pickle
import os
from tqdm import tqdm

import sys
# This is only needed when testing. I'm so confused about the imports
sys.path.append("microsim")


class QuantRampAPI:
    """
    Class that handles integration of QUANT data into the RAMP microsim model
    QUANT spatial interaction data include probabilities of trips from MSOA 
    or IZ origins to primary schools, secondary schools and retail locations.
    Based on QUANTRampAPI.py provided by UCL
    """

    def __init__(self,
                 quant_dir: str = Constants.Paths.QUANT.FULL_PATH_FOLDER  # "QUANT_RAMP"
                 ):
        """
        Initialiser for QuantRampAPI This reads all of the necessary data.
        ----------
        :param quant_dir: Full path to QUANT files

        """
        self.QUANT_DIR = quant_dir

        # read in and store data
        QuantRampAPI.read_data(self.QUANT_DIR)

    @classmethod
    def read_data(cls, QUANT_DIR):
        """
        reads in all data in provided data directory and creates series of class object attributes
        """
        cls.dfPrimaryPopulation = pd.read_csv(
            os.path.join(QUANT_DIR, 'primaryPopulation.csv'))
        cls.dfPrimaryZones = pd.read_csv(
            os.path.join(QUANT_DIR, 'primaryZones.csv'))
        cls.primary_probPij = pickle.load(
            open(os.path.join(QUANT_DIR, 'primaryProbPij.bin'), 'rb'))

        cls.dfSecondaryPopulation = pd.read_csv(
            os.path.join(QUANT_DIR, 'secondaryPopulation.csv'))
        cls.dfSecondaryZones = pd.read_csv(
            os.path.join(QUANT_DIR, 'secondaryZones.csv'))
        cls.secondary_probPij = pickle.load(
            open(os.path.join(QUANT_DIR, 'secondaryProbPij.bin'), 'rb'))

        cls.dfRetailPointsPopulation = pd.read_csv(
            os.path.join(QUANT_DIR, 'retailpointsPopulation.csv'))
        cls.dfRetailPointsZones = pd.read_csv(
            os.path.join(QUANT_DIR, 'retailpointsZones.csv'))
        cls.retailpoints_probSij = pickle.load(
            open(os.path.join(QUANT_DIR, 'retailpointsProbSij.bin'), 'rb'))

        cls.dfHospitalPopulation = pd.read_csv(
            os.path.join(QUANT_DIR, 'hospitalPopulation.csv'))
        cls.dfHospitalZones = pd.read_csv(
            os.path.join(QUANT_DIR, 'hospitalZones.csv'))
        cls.hospital_probHij = pickle.load(
            open(os.path.join(QUANT_DIR, 'hospitalProbHij.bin'), 'rb'))

    @staticmethod
    def getProbableVenuesByMSOAIZ(dfPopulation, dfZones, probPij, msoa_iz, threshold):
        """
        getProbableVenuesByMSOAIZ
        Given an MSOA area code (England and Wales) or an Intermediate Zone (IZ) 2001 code (Scotland), return
        a list of all the surrounding venues whose probability of being visited by the MSOA_IZ is
        greater than or equal to the threshold.
        @param msoa_iz An MSOA code (England/Wales e.g. E02000001) or an IZ2001 code (Scotland e.g. S02000001)
        @param threshold Probability threshold e.g. 0.5 means return all possible venues with probability>=0.5
        @returns a list of probabilities in the same order as the venues
        """
        result = []
        zonei = int(
            dfPopulation.loc[dfPopulation['msoaiz'] == msoa_iz, 'zonei'])
        m, n = probPij.shape
        for j in range(n):
            p = probPij[zonei, j]
            if p >= threshold:
                result.append(p)
        return result

    @classmethod
    def get_flows(cls, venue, msoa_list, threshold, thresholdtype):
        """
        Prepare RAMP UA compatible data
        """
        # get all probabilities so they sum to at least threshold value
        dic = {}  # appending to dictionary is faster than dataframe
        # tqdm makes loops show a smart progress meter
        for m in tqdm(msoa_list, desc=f"Reading {venue} MSOA flows"):
            # get all probabilities for this MSOA (threshold set to 0)
            if venue == "PrimarySchool":
                result_tmp = QuantRampAPI.getProbableVenuesByMSOAIZ(cls.dfPrimaryPopulation,
                                                                    cls.dfPrimaryZones,
                                                                    cls.primary_probPij,
                                                                    m,
                                                                    0)
            elif venue == "SecondarySchool":
                result_tmp = QuantRampAPI.getProbableVenuesByMSOAIZ(cls.dfSecondaryPopulation,
                                                                    cls.dfSecondaryZones,
                                                                    cls.secondary_probPij,
                                                                    m,
                                                                    0)
            elif venue == "Retail":
                result_tmp = QuantRampAPI.getProbableVenuesByMSOAIZ(cls.dfRetailPointsPopulation,
                                                                    cls.dfRetailPointsZones,
                                                                    cls.retailpoints_probSij,
                                                                    m,
                                                                    0)
            elif venue == "Nightclubs":
                result_tmp = QuantRampAPI.getProbableVenuesByMSOAIZ(cls.dfRetailPointsPopulation,
                                                                    cls.dfRetailPointsZones,
                                                                    cls.retailpoints_probSij,
                                                                    m,
                                                                    0)
            else:
                raise Exception("unknown venue type")
            # keep only values that sum to at least the specified threshold
            # index from lowest to highest value
            sort_index = np.argsort(result_tmp)
            result = [0.0] * len(result_tmp)  # initialise
            i = len(result_tmp)-1  # start with last of sorted (highest prob)
            if thresholdtype == "prob":
                sum_p = 0  # initialise
                while sum_p < threshold:
                    result[sort_index[i]] = result_tmp[sort_index[i]]
                    sum_p = sum_p + result_tmp[sort_index[i]]
                    # print(sum_p)
                    i = i - 1
            elif thresholdtype == "nr":
                for t in range(0, threshold):
                    result[sort_index[i]] = result_tmp[sort_index[i]]
                    i = i - 1
            else:
                raise Exception("unknown threshold type")
            dic[m] = result

        # now turn this into a dataframe with the right columns etc compatible with _flows variable
        nr_venues = len(dic[msoa_list[0]])
        col_names = []
        for n in range(0, nr_venues):
            col_names.append(f"Loc_{n}")
        df = pd.DataFrame.from_dict(dic, orient='index')
        df.columns = col_names
        df.insert(loc=0, column='Area_ID', value=[
                  *range(1, len(msoa_list)+1, 1)])
        df.insert(loc=1, column='Area_Code', value=df.index)
        df.reset_index(drop=True, inplace=True)
        return df


# # to test:
# microsim_data_dir = os.getcwd()
# quant_user_dir = os.path.join("QUANT_RAMP", "model-runs")
#
# qa = QuantRampAPI(microsim_data_dir, quant_user_dir)
#
# threshold = 10 # top 10
# thresholdtype = "nr" # threshold based on nr venues
# study_msoas = ['E02002559', 'E02002560']
# flow_matrix = qa.get_flows("Retail", study_msoas,threshold,thresholdtype)
