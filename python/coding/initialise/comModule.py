#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Commuting module for the RAMP-UA model.

Created on Wed Sep 01 2021

@author: Hadrien
"""

import pandas as pd
import numpy as np
from numpy.random import choice
from coding.constants import Constants
from sklearn.metrics.pairwise import haversine_distances

class Commuting:

    def __init__(self,
                 population,
                 threshold):

        br_file_with_path = Constants.Paths.BUSINESSREGISTRY.FULL_PATH_FILE
        print(f"Reading business registry from {br_file_with_path}.")
        business_registry = pd.read_csv(br_file_with_path)

        [reg,pop,useSic] = Commuting.trimData(self,business_registry,population,threshold)
        [origIndiv,destWork] = Commuting.getCommuting(self,reg,pop,useSic)

        self.reg = reg
        self.origIndiv = origIndiv
        self.destWork = destWork

        return


    def trimData(self,
                 business_registry,
                 population,
                 threshold):

        useSic = True

        print("Preparing commuting data.")

        population = population[population['pwork'] > 0]
        popLoc = population['MSOA11CD'].unique()
        # We only care about entries with an MSOA where we have somebody who works
        business_registry = business_registry[business_registry['MSOA11CD'].isin(popLoc)]

        # All the sic1d07's that're both in the registry and somebody in the population has
        ref = list(set(business_registry['sic1d07'].unique()) & set(population['sic1d07'].unique()))

        # Just the first match?
        business_registry_temp = business_registry[business_registry['sic1d07'] == ref[0]]
        # Each business also has a size. For the first SIC only, repeat each matching business base on size
        business_registry_conc = business_registry_temp.loc[business_registry_temp.index.repeat(business_registry_temp['size'])]
        # And find the population with this match
        population_conc = population[(population['sic1d07'] == ref[0])]

        total_job = len(business_registry_conc)
        total_population = len(population_conc)

        # Less jobs than people? Repeatedly sample people
        if total_job < total_population:
            population_conc = population_conc.sample(n=total_job)

        # Repeatedly sample jobs...
        if total_job > total_population:
            business_registry_conc = business_registry_conc.sample(n=total_population)

        if len(ref) > 1:
            # For every other SIC
            for i in ref[1:len(ref)]:
                # Do the same thing
                business_registry_temp = business_registry[business_registry['sic1d07'] == i]
                business_registry_temp = business_registry_temp.loc[business_registry_temp.index.repeat(business_registry_temp['size'])]
                population_temp = population[(population['sic1d07'] == i)]
                total_job = len(business_registry_temp)
                total_population = len(population_temp)

                if total_job < total_population:
                    population_temp = population_temp.sample(n=total_job)

                if total_job > total_population:
                    business_registry_temp = business_registry_temp.sample(n=total_population)

                business_registry_conc = business_registry_conc.append(business_registry_temp)
                population_conc = population_conc.append(population_temp)

        # threshold is sicThresh from default.yml, 0 by default
        # "min proportion of the population that must be preserved when using the sic1d07 classification for commuting modelling"
        if len(population_conc)/len(population[population['pwork'] > 0]) < threshold:
            # Give up on using per SIC repeating, because not enough matching jobs? Not sure
            useSic = False

            business_registry_conc = business_registry.loc[business_registry.index.repeat(business_registry['size'])]
            # Still just people that work
            population_conc = population

            total_job = len(business_registry_conc)
            total_population = len(population_conc)

            if(total_job < total_population):
                population_conc = population_conc.sample(n=total_job)

            if(total_job > total_population):
                business_registry_conc = business_registry_conc.sample(n=total_population)

        business_registry_conc.loc[:,'size'] = 1
        business_registry_conc = pd.merge(business_registry_conc[['id','size']].groupby('id').sum(), business_registry_conc.drop('size',axis=1), how="left", on=["id"])
        business_registry_conc = business_registry_conc.drop_duplicates()
        business_registry_conc.index = range(len(business_registry_conc))

        return [business_registry_conc,population_conc,useSic]


    # reg is a business, which has lat/lng
    # pop is a person
    def commutingDistance(self,
                          reg,
                          pop
                          ):

        regCoords = [np.radians(reg['lat']),np.radians(reg['lng'])]
        latrad = np.radians(pop['lat'])
        lngrad = np.radians(pop['lng'])
        dist = [haversine_distances([regCoords],[[latrad[_],lngrad[_]]])[0][0] for _ in latrad.index] # Warning: the distance unit is the earth radius

        return(dist)


    # Each person is assigned 0 or 1 work venues, so the flow is just [1.0]
    def getCommuting(self,
                     reg,
                     pop,
                     useSic
                     ):

        print("Calculating commuting flows...")

        origIndiv = []
        destWork = []

        if useSic:
            ref = list(set(reg['sic1d07'].unique()) & set(pop['sic1d07'].unique()))

            for i in ref:
                # So per SIC, we find all the matching people and businesses
                currentReg = reg[reg['sic1d07'] == i]
                currentPop = pop[pop['sic1d07'] == i]

                for j in currentReg.index:
                    # Per business, we're going to assign people
                    dist = Commuting.commutingDistance(self,currentReg.loc[j,:],currentPop)
                    probDistrib = np.ones(len(dist)) / dist / dist

                    size = currentReg.loc[j,'size']
                    # idp is something like E02006317_000001.. I think it's just yet another globally unique ID for a person
                    draw = choice(currentPop['idp'],size,p=probDistrib/sum(probDistrib),replace = False)
                    origIndiv += list(draw)
                    destWork += list(np.repeat(currentReg.loc[j,'id'],size))

                    currentPop = currentPop[~currentPop['idp'].isin(draw)]

            return [origIndiv,destWork]

        else:
            for j in range(len(reg)):
                # Ignore SIC, just assign everyone who works to a business and weight only by distance
                dist = Commuting.commutingDistance(self,reg.loc[j,:],pop)

                probDistrib = np.ones(len(dist)) / dist / dist

                size = reg.loc[j,'size']
                draw = choice(pop['idp'],size,p=probDistrib/sum(probDistrib),replace = False)
                origIndiv += list(draw)
                destWork += list(np.repeat(reg.loc[j,'id'],size))

                pop = pop[~pop['idp'].isin(draw)]

            return [origIndiv,destWork]

    def getCommutingData(self):
        if self.reg is None:
            raise Exception("Failed")
        if self.origIndiv is None:
            raise Exception("Failed")
        if self.destWork is None:
            raise Exception("Failed")
        return [self.reg,self.origIndiv,self.destWork]


