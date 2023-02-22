#source("SPC_loadWorkspace.R")

# Select year
#date <- 2012
date <- 2020
#date <- 2022
#date <- 2032
#date <- 2039

# Select lad
lad <- "E06000002"
lad <- "E06000017"
lad <- "E09000002"
lad <- "W06000015"
lad <- "S"

lads <- sort(unique(lu$LAD20CD[lu$Country == "Wales"]))
lads <- lads[c(1,3:13,15:22)]
  
for(i in lads){
  lad <- lads[i]
  source("SPC_pipelineLAD.R")
}

#source("SPC_pipelineLAD.R")
#system.time(source("SPC_pipelineLAD.R"))



