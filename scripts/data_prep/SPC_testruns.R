# One-time loading
source("SPC_loadWorkspace.R")


unique(lu$LAD20NM[lu$AzureRef == "central-valleys"])
unique(lu$LAD20CD[lu$AzureRef == "central-valleys"])

lad <- "W06000016"
lad <- "W06000024"

date <- 2020
date <- 2012

# Morgannwg Ganol
# 242k in 142 secs


length(unique(lu$OA11CD[lu$AzureRef == "central-valleys"]))
length(unique(lu$OA11CD[lu$LAD20CD == "W06000016"]))
length(unique(lu$OA11CD[lu$LAD20CD == "W06000024"]))

lad <- "E06000002"
lad <- "E09000002"
lad <- "W06000015"
date <- 2020

lad <- "S"


source("SPC_pipelineLAD.R")
system.time(source("SPC_pipelineLAD.R"))



