library(parallel)
library(stringr)
library(tidyverse)
library(rgdal)

set.seed(10091989)

cores <- detectCores()

source("age_rescaling/SPC_functions_age_rescaling.R")

# Lookup
lu <- read.csv(paste(folderInOT, "lookUp-GB.csv", sep = ""))

# Income related data // Only necessary for England
coefFFT <- read.csv(paste(folderInOT, "coefFFT.csv", sep = ""))
coefFPT <- read.csv(paste(folderInOT, "coefFPT.csv", sep = ""))
coefMFT <- read.csv(paste(folderInOT, "coefMFT.csv", sep = ""))
coefMPT <- read.csv(paste(folderInOT, "coefMPT.csv", sep = ""))
meanHoursMFT <- read.csv(paste(folderInOT, "meanHoursMFT.csv", sep = ""))
meanHoursMPT <- read.csv(paste(folderInOT, "meanHoursMPT.csv", sep = ""))
meanHoursFFT <- read.csv(paste(folderInOT, "meanHoursFFT.csv", sep = ""))
meanHoursFPT <- read.csv(paste(folderInOT, "meanHoursFPT.csv", sep = ""))
distribHours <- read.csv(paste(folderInOT, "distribHours.csv", sep = ""))
distribHoursMFT <- distribHours$MFT
distribHoursMPT <- distribHours$MPT
distribHoursFFT <- distribHours$FFT
distribHoursFPT <- distribHours$FPT

# Health related data
HST <- read.table(paste(folderInOT, "HSComplete.csv", sep = ""), sep = ",", header = TRUE)
BMIdiff <- read.table(paste(folderInOT, "BMIdiff.csv", sep = ""), sep = ",", header = TRUE)
dMean <- read.table(paste(folderInOT, "BMIdMean.csv", sep = ""), sep = ",", header = TRUE)
varData <- c(37.25736, 42.28994, 37.73406, 42.16856, 48.20913, 44.52134, 39.19527, 55.90769)

# NSSEC8
nssecNames <- c(
  "F_16to24", "F_25to34", "F_35to49", "F_50to64", "F_65to74",
  "M_16to24", "M_25to34", "M_35to49", "M_50to64", "M_65to74"
)
for (i in nssecNames) {
  assign(paste("NSSEC", i, sep = ""), read.csv(paste(folderInOT, "NSSEC8_EW_", i, "_CLEAN.csv", sep = "")))
}
NSSECS <- read.csv(paste(folderInOT, "NSSECS_CLEAN.csv", sep = ""))

# TUS
indivTUS <- read.table(paste(folderInOT, "indivTUS.csv", sep = ""), sep = ",", header = TRUE)

# OA coordinates
OACoords <- read.csv(paste(folderInOT, "OACentroids.csv", sep = ""))
