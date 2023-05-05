library(dplyr)
library(janitor)
library(readr)
library(tidyr)
library(foreign)
library(sp)
library(rgdal)
library(rgeos)
library(raster)
library(fitdistrplus)
library(reshape2)
library(readxl)
#library(ggplot2)

folderIn <- "Data/dl/"
folderOut <- "Data/prepData/"

set.seed(12345)

source("raw_to_prepared_Income.R")
source("raw_to_prepared_Workplaces.R")


#######################
##### Health data #####
#######################

print("Working on health data")
### Load raw for all 3 countries (downloaded from UK Data Service, requires registration: 10.5255/UKDA-SN-8860-1; 10.5255/UKDA-SN-8090-1; 10.5255/UKDA-SN-8737-1)
HSE <- read.table(paste(folderIn,"hse_2019_eul_20211006.tab",sep = ""), sep="\t", header=TRUE)
HSWa <- read.table(paste(folderIn,"whs_2015_adult_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSWc <- read.table(paste(folderIn,"whs_2015_child_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSS <- read.table(paste(folderIn,"shes19i_eul.tab",sep = ""), sep="\t", header=TRUE)


### Normalisation

# England
HSE <- data.frame(id_HS = HSE$SerialA, sex = HSE$Sex, age35g = HSE$Age35g, nssec5 = HSE$nssec5,
                  diabetes = HSE$Diabetes, bloodpressure = HSE$bp1, cvd = HSE$CardioTakg2,
                  NMedicines = HSE$MedsNumG8, selfAssessed = HSE$GenHelf, lifeSat = HSE$LifeSatG)
for(i in 1:nrow(HSE)){
  if(!(HSE$nssec5[i] %in% 1:5)){
    HSE$nssec5[i] <- 0
  }
  if(!(HSE$diabetes[i] == 1)){
     HSE$diabetes[i] <- 0
  }
  if(!(HSE$bloodpressure[i] == 1)){
    HSE$bloodpressure[i] <- 0
  }
  if(!(HSE$cvd[i] == 1)){
    HSE$cvd[i] <- 0
  }
  if(HSE$NMedicines[i] < 0){
    HSE$NMedicines[i] <- -1
  }
  if(HSE$selfAssessed[i] < 0){
    HSE$selfAssessed[i] <- -1
  }
  if(HSE$lifeSat[i] < 0){
    HSE$lifeSat[i] <- -1
  }
}
HSE$country <- "England"

# Scotland
HSS <- data.frame(id_HS = HSS$CPSerialA, sex = HSS$Sex, age35g = HSS$age, nssec5 = HSS$NSSEC5,
                  diabetes = HSS$diabete2, bloodpressure = HSS$bp1, cvd = HSS$cvddef1,
                  NMedicines = HSS$nummedsB, selfAssessed = HSS$GenHelf, lifeSat = HSS$LifeSat)
for(i in 1:nrow(HSS)){
  if(!(HSS$nssec5[i] %in% 1:5)){
    HSS$nssec5[i] <- 0
  }
  if(!(HSS$diabetes[i] == 1)){
    HSS$diabetes[i] <- 0
  }
  if(!(HSS$bloodpressure[i] == 1)){
    HSS$bloodpressure[i] <- 0
  }
  if(!(HSS$cvd[i] == 1)){
    HSS$cvd[i] <- 0
  }
  if(HSS$selfAssessed[i] < 0){
    HSS$selfAssessed[i] <- -1
  }
  if(HSS$selfAssessed[i] < 0){
    HSS$selfAssessed[i] <- -1
  }
}
for(i in 1:nrow(HSS)){
  if(HSS$lifeSat[i] %in% 0:4){
    HSS$lifeSat[i] <- 1
  }else if(HSS$lifeSat[i] %in% 5:6){
    HSS$lifeSat[i] <- 2
  }else if(HSS$lifeSat[i] %in% 7:8){
    HSS$lifeSat[i] <- 3
  }else if(HSS$lifeSat[i] %in% 9:10){
    HSS$lifeSat[i] <- 4
  }else{
    HSS$lifeSat[i] <- -1
  }
}
for(i in 1:nrow(HSS)){
  a <- HSS$age35g[i]
  if(a == 0 | a == 1){
    a <- 1
  }else if(a %in% 2:4){
    a <- 2
  }else if(a %in% 5:7){
    a <- 3
  }else if(a %in% 8:10){
    a <- 4
  }else if(a %in% 11:12){
    a <- 5
  }else if(a %in% 13:15){
    a <- 6
  }else if(a %in% 16:19){
    a <- 7
  }else if(a %in% 20:24){
    a <- 8
  }else if(a %in% 25:29){
    a <- 9
  }else if(a %in% 30:34){
    a <- 10
  }else if(a %in% 35:39){
    a <- 11
  } else if(a %in% 40:44){
    a <- 12
  } else if(a %in% 45:49){
    a <- 13
  } else if(a %in% 50:54){
    a <- 14
  } else if(a %in% 55:59){
    a <-15
  } else if(a %in% 60:64){
    a <- 16
  } else if(a %in% 65:69){
    a <- 17
  } else if(a %in% 70:74){
    a <- 18
  } else if(a %in% 75:79){
    a <- 19
  } else if(a %in% 80:84){
    a <- 20
  } else if(a %in% 85:89){
    a <- 21
  }else {
    a <- 22
  }
  HSS$age35g[i] <- a
}
HSS$country <- "Scotland"

# Wales
HSWa <- data.frame(id_HS = HSWa$archpsn, sex = HSWa$sex, age35g = HSWa$age5yrm, nssec5 = HSWa$nssec5,
                   diabetes = HSWa$diab, bloodpressure = HSWa$hbp, cvd = HSWa$heart,
                   NMedicines = HSWa$prescmbi, selfAssessed = HSWa$genhlth, lifeSat = HSWa$wbsatis) # For Wales, blood pressure is only if treated
for(i in 1:nrow(HSWa)){
  if(!(HSWa$nssec5[i] %in% 1:5)){
    HSWa$nssec5[i] <- 0
  }
  if(!(HSWa$diabetes[i] == 1)){
    HSWa$diabetes[i] <- 0
  }
  if(!(HSWa$bloodpressure[i] == 1)){
    HSWa$bloodpressure[i] <- 0
  }
  if(!(HSWa$cvd[i] == 1)){
    HSWa$cvd[i] <- 0
  }
  if(HSWa$NMedicines[i] < 0){
    HSWa$NMedicines[i] <- -1
  }
}
for(i in 1:nrow(HSWa)){
  if(HSWa$selfAssessed[i] == 1){
    HSWa$selfAssessed[i] <- 2
  }
}
HSWa$selfAssessed <- HSWa$selfAssessed - 1
for(i in 1:nrow(HSWa)){
  if(HSWa$selfAssessed[i] < 0){
    HSWa$selfAssessed[i] <- -1
  }
}
for(i in 1:nrow(HSWa)){
  if(HSWa$lifeSat[i] %in% 0:4){
    HSWa$lifeSat[i] <- 1
  }else if(HSWa$lifeSat[i] %in% 5:6){
    HSWa$lifeSat[i] <- 2
  }else if(HSWa$lifeSat[i] %in% 7:8){
    HSWa$lifeSat[i] <- 3
  }else if(HSWa$lifeSat[i] %in% 9:10){
    HSWa$lifeSat[i] <- 4
  }else{
    HSWa$lifeSat[i] <- -1
  }
}
HSWa$age35g <- HSWa$age35g + 6
HSWa$country <- "Wales"

HSWc <- data.frame(id_HS = HSWc$archpsn, sex = HSWc$sex, age35g = HSWc$childage, nssec5 = 0,
                   diabetes = 0, bloodpressure = 0, cvd = 0,
                   NMedicines = HSWc$gppresc, selfAssessed = HSWc$genhlth, lifeSat = -1)
for(i in 1:nrow(HSWc)){
  a <- HSWc$age35g[i]
  if(a == 1){
    a <- sample(c(1,2), size = 1)
  }else if(a == 2){
    a <- sample(c(2,3,3,3,4,4,4,5,5), size = 1)
  }else if(a == 3){
    a <- 6
  }
  HSWc$age35g[i] <- a
}
HSWc$NMedicines <- HSWc$NMedicines - 1
for(i in 1:nrow(HSWc)){
  if(HSWc$NMedicines[i] < 0){
    HSWc$NMedicines[i] <- -1
  }
  if(HSWc$selfAssessed[i] < 0){
    HSWc$selfAssessed[i] <- -1
  }
}
HSWc$country <- "Wales"


### Output single file
HS <- rbind(HSE,HSS,HSWa,HSWc)
print("Writing outputs...")
write.table(HS,paste(folderOut,"HSComplete.csv",sep = ""),row.names = F, sep = ",")


####################
##### BMI data #####
####################

print("Working on BMI data")

# Uses same base data as Health data above
# Load Health Survey for England
HSE <- read.table(paste(folderIn,"hse_2019_eul_20211006.tab",sep = ""), sep="\t", header=TRUE)

subset <- data.frame(age = HSE$Age35g, sex = HSE$Sex, origin = HSE$origin2,
                     weight = HSE$Weight, height = HSE$Height, bmi = HSE$BMI)


# preparation
subsubset <- subset[subset$origin > 0 & subset$bmi > 0,] #remove non recorded values
subsubset$origin <- factor(subsubset$origin)
subsubset$sex <- factor(subsubset$sex)
subsetF <- subsubset[subsubset$sex == 2,]
subsetM <- subsubset[subsubset$sex == 1,]


### Spread per sex and 4 ethnic categories (last two merged)
orig <- 1:5
for(i in orig){
  aF <- subsetF$age[subsetF$origin == i]
  for(j in 1:length(aF)){
    if(aF[j] == 7){
      aF[j] <- 17.5
    }else{
      aF[j] <- 22+(aF[j]-8)*5
    }
  }
  aM <- subsetM$age[subsetM$origin == i]
  for(j in 1:length(aM)){
    if(aM[j] == 7){
      aM[j] <- 17.5
    }else{
      aM[j] <- 22+(aM[j]-8)*5
    }
  }
  bF <- subsetF$bmi[subsetF$origin == i]
  bM <- subsetM$bmi[subsetM$origin == i]
  assign(paste("xF",i,sep = ""),aF)
  assign(paste("xM",i,sep = ""),aM)
  assign(paste("yF",i,sep = ""),bF)
  assign(paste("yM",i,sep = ""),bM)
  assign(paste("fitF",i,sep = ""),lm(bF ~ poly(aF, 3, raw=TRUE)))
  assign(paste("fitM",i,sep = ""),lm(bM ~ poly(aM, 3, raw=TRUE)))
}

xF4 <- c(xF4,xF5)
xM4 <- c(xM4,xM5)
yF4 <- c(yF4,yF5)
yM4 <- c(yM4,yM5)

fitF4 <- lm(yF4 ~ poly(xF4, 3, raw=TRUE))
fitM4 <- lm(yM4 ~ poly(xM4, 3, raw=TRUE))

# Functions giving shape and rate of the gamma fit vs age
#     findFits fits the coefficients per age with an order 3 polynomial
#     findFits2 fits the coefficients per age with an order 1 polynomial
findFits <- function(xF,yF){
  u <- sort(unique(xF), decr = F)
  l <- length(u)
  shapeF <- rep(NA,l)
  rateF <- rep(NA,l)
  for(i in 1:l){
    y <- yF[which(xF == u[i])]
    if(length(y) > 10){
      fit <- fitdist(y, distr = "gamma", method = "mle")
      shapeF[i] <- fit$estimate[1]
      rateF[i] <- fit$estimate[2]
    }
  }
  fitS <- lm(shapeF ~ poly(u, 3, raw=TRUE))
  fitR <- lm(rateF ~ poly(u, 3, raw=TRUE))
  return(list(u,shapeF,rateF,fitS,fitR))
}
findFits2 <- function(xF,yF){
  u <- sort(unique(xF), decr = F)
  l <- length(u)
  shapeF <- rep(NA,l)
  rateF <- rep(NA,l)
  for(i in 1:l){
    y <- yF[which(xF == u[i])]
    if(length(y) > 10){
      fit <- fitdist(y, distr = "gamma", method = "mle")
      shapeF[i] <- fit$estimate[1]
      rateF[i] <- fit$estimate[2]
    }
  }
  fitS <- lm(shapeF ~ poly(u, 1, raw=TRUE))
  fitR <- lm(rateF ~ poly(u, 1, raw=TRUE))
  return(list(u,shapeF,rateF,fitS,fitR))
}

### Extraction of the coefficients to draw the BMI
#     mean is given by the first fitting per sex and 4 ethnic categories (see "Spread per sex and 4 ethnic categories (last two merged)")
#     variance is given by the global gamma distribution (see "More detailed analysis of variance per age (in year)")
test <- findFits(c(xF1,xF2,xF3,xF4),c(yF1,yF2,yF3,yF4))
test2 <- findFits2(c(xM1,xM2,xM3,xM4),c(yM1,yM2,yM3,yM4))

dVariance <- data.frame(ref = c("shape_inter","shape_coef1","shape_coef2","shape_coef3","rate_inter","rate_coef1","rate_coef2","rate_coef3"),
                        male = c(unname(test2[[4]]$coefficients),0,0,unname(test2[[5]]$coefficients),0,0),
                        female = c(unname(test[[4]]$coefficients),unname(test[[5]]$coefficients))
)
dMean <- data.frame(F1 = unname(fitF1$coefficients),F2 = unname(fitF2$coefficients),F3 = unname(fitF3$coefficients),F4 = unname(fitF4$coefficients),
                    M1 = unname(fitM1$coefficients),M2 = unname(fitM2$coefficients),M3 = unname(fitM3$coefficients),M4 = unname(fitM4$coefficients)
)

print("Writing outputs...")
write.table(dMean,paste(folderOut,"BMIdMean.csv",sep = ""),row.names = F, sep = ",")

varData <- rep(NA,8)
subsubset$origin[subsubset$origin == 5] <- 4
for(i in 1:2){
  for(j in 1:4){
    varData[(i-1)*4+j] <- var(subsubset$bmi[subsubset$sex == i & subsubset$origin == j],na.rm = T)
  }
}
varData

### BMIdiff.csv


######################
##### NSSEC data #####
######################


# SOURCE:
# DC6114EW - NS-SeC by sex and age at MSOA level (England and Wales)
# DC6206SC - NS-SeC by sex / age / ethnnicity at Country level (Scotland)

print("Working on NSSEC")

# /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
#  Please note that the links to the nomis API below must currently include "date=latest". This means that those links will eventually stop pointing to the correct data
# /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\

### England and Wales
downloadNSSEC <- function(age,sex){
  URLB <- "https://www.nomisweb.co.uk/api/v01/dataset/NM_796_1.data.csv?date=latest&geography="
  URL1 <- "1245710776...1245710790,1245712478...1245712543,1245710706...1245710716,1245715055,1245710717...1245710734,1245714957,1245713863...1245713902,1245710735...1245710751,1245714958,1245715056,1245710752...1245710775,1245709926...1245709950,1245714987,1245714988,1245709951...1245709978,1245715039,1245709979...1245710067,1245710832...1245710868,1245712005...1245712034,1245712047...1245712067,1245711988...1245712004,1245712035...1245712046,1245712068...1245712085,1245710791...1245710831,1245712159...1245712222,1245709240...1245709350,1245715048,1245715058...1245715063,1245709351...1245709382,1245715006,1245709383...1245709577,1245713352...1245713362,1245715027,1245713363...1245713411,1245715017,1245713412...1245713456,1245715030,1245713457...1245713502,1245709578...1245709655,1245715077...1245715079,1245709679...1245709716,1245709656...1245709678,1245709717...1245709758,1245710900...1245710939,1245714960,1245715037,1245715038,1245710869...1245710899,1245714959,1245710940...1245711009,1245713903...1245713953,1245715016,1245713954...1245713977,1245709759...1245709925,1245714949,1245714989,1245714990,1245715014,1245715015,1245710411...1245710660,1245714998,1245715007,1245715021,1245715022,1245710661...1245710705,1245711010...1245711072,1245714961,1245714963,1245714965,1245714996,1245714997,1245711078...1245711112,1245714980,1245715050,1245715051,1245711073...1245711077,1245712223...1245712237,1245714973"
  URL2 <- "1245712238...1245712284,1245714974,1245712285...1245712294,1245715018,1245712295...1245712306,1245714950,1245712307...1245712316,1245715065,1245715066,1245713503...1245713513,1245714966,1245713514...1245713544,1245714962,1245713545...1245713581,1245714964,1245715057,1245713582...1245713587,1245715010,1245715011,1245713588...1245713627,1245715012,1245715013,1245713628...1245713665,1245713774...1245713779,1245715008,1245715009,1245713780...1245713862,1245713978...1245714006,1245715049,1245714007...1245714019,1245715052,1245714020...1245714033,1245714981,1245714034...1245714074,1245711113...1245711135,1245714160...1245714198,1245711159...1245711192,1245711136...1245711158,1245714270...1245714378,1245714616...1245714638,1245714952,1245714639...1245714680,1245710068...1245710190,1245714953,1245714955,1245715041...1245715047,1245710191...1245710231,1245714951,1245710232...1245710311,1245714956,1245710312...1245710339,1245714954,1245710340...1245710410,1245715040,1245714843...1245714927,1245711814...1245711833,1245711797...1245711813,1245711834...1245711849,1245711458...1245711478,1245711438...1245711457,1245715023,1245715024,1245711479...1245711512,1245715005,1245715071,1245711915...1245711936,1245714971,1245711937...1245711987,1245715019,1245715020,1245712611...1245712711,1245715068,1245712712...1245712784,1245713023...1245713175,1245713666...1245713758,1245715053,1245715054,1245713759...1245713773"
  URL3 <- "1245714379...1245714395,1245714972,1245714396...1245714467,1245708449...1245708476,1245708289,1245708620...1245708645,1245715064,1245715067,1245708646...1245708705,1245714941,1245708822...1245708865,1245708886...1245708919,1245714947,1245708920...1245708952,1245714930,1245714931,1245714944,1245708978...1245709014,1245709066...1245709097,1245714948,1245709121...1245709150,1245714999,1245715000,1245709179...1245709239,1245708290...1245708310,1245714945,1245708311...1245708378,1245714932,1245708379...1245708448,1245714929,1245714934,1245714936,1245708477...1245708519,1245714935,1245708520...1245708557,1245714938,1245708558...1245708592,1245714940,1245708593...1245708619,1245714933,1245715072...1245715076,1245708706...1245708733,1245714942,1245715028,1245708734...1245708794,1245714943,1245708795...1245708821,1245714939,1245708866...1245708885,1245708953...1245708977,1245709015...1245709042,1245714946,1245715069,1245715070,1245709043...1245709065,1245709098...1245709120,1245714982,1245709151...1245709178,1245711551...1245711565,1245711690...1245711722,1245711779...1245711796,1245711513...1245711550,1245711658...1245711689,1245711723...1245711746,1245714967,1245711588...1245711619,1245711747...1245711778,1245711566...1245711587,1245711620...1245711657,1245711850...1245711884,1245714969,1245711885...1245711914,1245714970,1245712544...1245712554,1245715003,1245715004,1245712555...1245712610"
  URL4 <- "1245712860...1245712894,1245714975,1245714984,1245712895...1245712958,1245714968,1245714976,1245714977,1245712959...1245713022,1245713176...1245713206,1245715001,1245715002,1245713207...1245713279,1245714978,1245713280...1245713291,1245715025,1245715026,1245713292...1245713337,1245714979,1245713338...1245713351,1245714075...1245714144,1245715032,1245714145...1245714159,1245714468...1245714493,1245714983,1245714494...1245714587,1245714937,1245714588...1245714603,1245714985,1245714604...1245714615,1245714681...1245714780,1245711193...1245711219,1245711375...1245711395,1245715029,1245715031,1245711220...1245711270,1245715033...1245715036,1245712086...1245712158,1245714928,1245711271...1245711294,1245714991,1245714992,1245711327...1245711358,1245711396...1245711413,1245711295...1245711326,1245711414...1245711437,1245714993...1245714995,1245711359...1245711374,1245714986,1245714781...1245714842,1245712317...1245712477,1245712785...1245712859,1245714199...1245714269,1245715080...1245715134,1245715485,1245715135...1245715171,1245715486,1245715172...1245715188,1245715480,1245715482,1245715189...1245715196,1245715487,1245715197...1245715236,1245715484,1245715237...1245715285,1245715483,1245715286...1245715319,1245715434...1245715479,1245715488,1245715489,1245715320...1245715356,1245715481,1245715357...1245715433"
  URLE <- paste("&c_sex=",sex,"&c_nssec=1,4...10,13&c_age=",age,"&measures=20100&select=geography_code,c_nssec_name,obs_value",sep="")
  download.file(paste(URLB,URL1,URLE,sep = ""),destfile = paste(folderIn,"data1.csv",sep=""))
  download.file(paste(URLB,URL2,URLE,sep = ""),destfile = paste(folderIn,"data2.csv",sep=""))
  download.file(paste(URLB,URL3,URLE,sep = ""),destfile = paste(folderIn,"data3.csv",sep=""))
  download.file(paste(URLB,URL4,URLE,sep = ""),destfile = paste(folderIn,"data4.csv",sep=""))
  data1 <- read.csv(paste(folderIn,"data1.csv",sep=""))
  data2 <- read.csv(paste(folderIn,"data2.csv",sep=""))
  data3 <- read.csv(paste(folderIn,"data3.csv",sep=""))
  data4 <- read.csv(paste(folderIn,"data4.csv",sep=""))
  data <- rbind(data1,data2,data3,data4)
  data$C_NSSEC_NAME <- substr(as.character(data$C_NSSEC_NAME),1,1)
  data$C_NSSEC_NAME[data$C_NSSEC_NAME == "L"] <- 9
  data$C_NSSEC_NAME <- as.numeric(data$C_NSSEC_NAME)
  colnames(data) <- c("MSOA11CD","nssec8","number")
  return(data)
}
print("Writing outputs for England and Wales...")
writeNSSECTables <- function(age,sex){
  ref <- matrix(c("M_16-24","M_25-34","M_35-49","M_50-64","M_65p",
                  "F_16-24","F_25-34","F_35-49","F_50-64","F_65p"),
                ncol = 2)
  NSSEC <- downloadNSSEC(age,sex)
  NSSEC <- spread(NSSEC, nssec8, number)
  colnames(NSSEC) <- c("MSOA11CD","N1","N2","N3","N4","N5","N6","N7","N8","Student")
  write.table(NSSEC,paste(folderOut,"NSSEC8_EW_",ref[age,sex],"_CLEAN.csv",sep = ""),row.names = F, sep = ",")
}

for(i in 1:5){
  for(j in 1:2){
    writeNSSECTables(i,j)
  }
}


### Scotland

download.file("https://www.scotlandscensus.gov.uk/media/lewawhbl/scotland-std.zip",paste(folderIn,"scotland-std.zip",sep = ""))
unzip(paste(folderIn,"scotland-std.zip",sep = ""),exdir=folderIn)

NSSEC <- read.csv(paste(folderIn,"DC6206SC.csv",sep = ""),skip = 3)
NSSEC <- NSSEC[c(62:100,112:150),2:10]
rownames(NSSEC) <- 1:nrow(NSSEC)

NSSEC$sex <- substr(NSSEC$X.1,1,1)
NSSEC$sex[NSSEC$sex == "M"] <- 1
NSSEC$sex[NSSEC$sex == "F"] <- 2

NSSEC$nssec8 <- substr(NSSEC$X.2,1,1)
NSSEC$nssec8[NSSEC$nssec8 == "L"] <- 9
NSSEC <- NSSEC[-which(NSSEC$nssec8 == "T"),]
rownames(NSSEC) <- 1:nrow(NSSEC)

NSSEC$age <- rep(c(rep(1,9),rep(2,9),rep(3,9),rep(4,9)),2)
NSSEC <- NSSEC[,c(10,12,11,4:9)]

NSSEC$white <- as.numeric(gsub(",",".",NSSEC$White))
NSSEC$black <- as.numeric(gsub(",",".",NSSEC$African)) + as.numeric(gsub(",",".",NSSEC$Caribbean.or.Black))
NSSEC$asian <- as.numeric(gsub(",",".",NSSEC$Asian..Asian.Scottish.or.Asian.British))
NSSEC$mixed <- as.numeric(gsub(",",".",NSSEC$Mixed.or.multiple.ethnic.groups))
NSSEC$other <- as.numeric(gsub(",",".",NSSEC$Other.ethnic.groups))

NSSEC$black[is.na(NSSEC$black)] <- 0
NSSEC <- NSSEC[,c(1:3,10:14)]

print("Writing outputs for Scotland...")
write.table(NSSEC,paste(folderOut,"NSSECS_CLEAN.csv",sep = ""),row.names = F, sep = ",")


####################
##### TUS data #####
####################


print("Working on TUS data")


###
### Personal information from TUS
###


# Reference data (downloaded from UK Data Service, requires registration: 10.5255/UKDA-SN-8128-1)
indivTUS <- read.table(paste(folderIn,"uktus15_individual.tab",sep = ""), sep="\t", header=TRUE)

indivTUS <- data.frame(id_TUS = indivTUS$serial, pnum = indivTUS$pnum, sex =indivTUS$DMSex, age = indivTUS$DVAge, age35g = NA, nssec8 = indivTUS$dnssec8,
                       pwkstat = indivTUS$deconact, soc2010 = indivTUS$XSOC2010, sic1d2007 = NA, sic2d2007 = indivTUS$SIC2007,
                       netPayWeekly = indivTUS$NetWkly, workedHoursWeekly = indivTUS$HrWkUS)

indivTUS <- indivTUS[indivTUS$pwkstat >= 0,]
indivTUS <- indivTUS[!is.na(indivTUS$nssec8),]
indivTUS <- indivTUS[indivTUS$nssec8 >= -1,]

createsic1d <- function(sic){
  if(sic < 0){
    res <- as.character(sic)
  }else if(sic %in% 1:3){
    res <- "A"
  } else if(sic %in% 5:9){
    res <- "B"
  } else if(sic %in% 10:33){
    res <- "C"
  } else if(sic == 35){
    res <- "D"
  } else if(sic %in% 36:39){
    res <- "E"
  } else if(sic %in% 41:43){
    res <- "F"
  } else if(sic %in% 45:47){
    res <- "G"
  } else if(sic %in% 49:53){
    res <- "H"
  } else if(sic %in% 55:56){
    res <- "I"
  } else if(sic %in% 58:63){
    res <- "J"
  } else if(sic %in% 65:66){
    res <- "K"
  } else if(sic == 68){
    res <- "L"
  } else if(sic %in% 69:75){
    res <- "M"
  } else if(sic %in% 77:82){
    res <- "N"
  } else if(sic == 84){
    res <- "O"
  } else if(sic == 85){
    res <- "P"
  } else if(sic %in% 86:88){
    res <- "Q"
  } else if(sic %in% 90:93){
    res <- "R"
  } else if(sic %in% 94:96){
    res <- "S"
  } else if(sic %in% 97:98){
    res <- "T"
  } else if(sic == 99){
    res <- "U"
  } else {
    res <- -1
  }
  return(res)
}
transformAge <- function(a){
  if(a == 0 | a == 1){
    a <- 1
  }else if(a %in% 2:4){
    a <- 2
  }else if(a %in% 5:7){
    a <- 3
  }else if(a %in% 8:10){
    a <- 4
  }else if(a %in% 11:12){
    a <- 5
  }else if(a %in% 13:15){
    a <- 6
  }else if(a %in% 16:19){
    a <- 7
  }else if(a %in% 20:24){
    a <- 8
  }else if(a %in% 25:29){
    a <- 9
  }else if(a %in% 30:34){
    a <- 10
  }else if(a %in% 35:39){
    a <- 11
  } else if(a %in% 40:44){
    a <- 12
  } else if(a %in% 45:49){
    a <- 13
  } else if(a %in% 50:54){
    a <- 14
  } else if(a %in% 55:59){
    a <-15
  } else if(a %in% 60:64){
    a <- 16
  } else if(a %in% 65:69){
    a <- 17
  } else if(a %in% 70:74){
    a <- 18
  } else if(a %in% 75:79){
    a <- 19
  } else if(a %in% 80:84){
    a <- 20
  } else if(a %in% 85:89){
    a <- 21
  }else if(a %in% 90:94){
    a <- 22
  }else{
    a <- 23
  }
  return(a)
}
transformPwkstat <- function(pwk){
  if(pwk == 1 | pwk == 2 | pwk == 8){
    res <- pwk
  }else if(pwk == 3){
    res <- 4
  }else if(pwk == 5){
    res <- 3
  }else if(pwk == 6){
    res <- 5
  }else if(pwk == 7){
      res <- 6
  }else if(pwk == 9){
    res <- 7
  }else if(pwk == 10){
    res <- 9
  }else if(pwk == 11){
    res <- 10
  }else if(pwk == 13){
    res <- 0
  }
}

indivTUS$sic1d2007 <- sapply(indivTUS$sic2d2007, createsic1d)
indivTUS$age35g <- sapply(indivTUS$age, transformAge)
indivTUS$pwkstat <- sapply(indivTUS$pwkstat, transformPwkstat)
indivTUS$soc2010[which(indivTUS$soc2010 == 0)] <- -1
indivTUS$workedHoursWeekly[which(indivTUS$workedHoursWeekly < 0)] <- -1

# Output
write.table(indivTUS,paste(folderOut,"indivTUS.csv",sep = ""),row.names = F, sep = ",")


###
### Create diaries reference file
###

# Load main reference file listing all sampled diaries (downloaded from UK Data Service, requires registration https://beta.ukdataservice.ac.uk/datacatalogue/studies/study?id=8128)
TUS <- read.table(paste(folderIn,"Data/uktus15_dv_time_vars.tab",sep = ""), sep="\t", header=TRUE)

# Basic cleaning
TUS <- data.frame(id_TUS_hh = TUS$serial, id_TUS_p = TUS$pnum, weekday = TUS$DiaryDay_Act, dayType = TUS$KindOfDay, month = TUS$dmonth,
                  dml1_1 = TUS$dml1_1, dml3_910 = TUS$dml3_910, dml1_2 = TUS$dml1_2, dml2_21 = TUS$dml2_21, dml1_0 = TUS$dml1_0,
                  dml1_3 = TUS$dml1_3, dml1_7 = TUS$dml1_7, dml1_8 = TUS$dml1_8, dml3_361 = TUS$dml3_361, dml3_362 = TUS$dml3_362,
                  dml3_363 = TUS$dml3_363, dml1_4 = TUS$dml1_4, dml1_5 = TUS$dml1_5, dml1_6 = TUS$dml1_6, dml3_923 = TUS$dml3_923,
                  dml1_9a = TUS$dml1_9a)
changeWeekDay <- function(day){
  if(day == 1 | day == 7){
    res <- 0
  }else{
    res <- 1
  }
}
TUS$weekday <- sapply(TUS$weekday, changeWeekDay)
TUS$uniqueID <- paste(TUS$id_TUS_hh,TUS$id_TUS_p,TUS$weekday,sep = "_")
TUS <- TUS[!duplicated(TUS$uniqueID),]

# Reference file with more details about the content of each activity to extract types of mobility used
TUSlong <- read.table("Data/uktus15_diary_ep_long.tab", sep="\t", header=TRUE)
TUSlong$weekday <- sapply(TUSlong$DiaryDay_Act, changeWeekDay)
TUSlong$uniqueID <- paste(TUSlong$serial,TUSlong$pnum,TUSlong$weekday,sep = "_")
TUSlong <- TUSlong[,c(52,33,34,38)]

# Extract type of mobility used and duration
extractProp <- function(x){
  res1 <- rep(0,5)
  res2 <- NA
  base <- TUSlong[which(TUSlong$uniqueID == x),]
  pmtot <- sum(base$eptime[which(base$WhereWhen %in% c(30:49,90))])
  pmwalk <- sum(base$eptime[which(base$WhereWhen == 31)])
  pmcycle <- sum(base$eptime[which(base$WhereWhen == 32)])
  pmprivate <- sum(base$eptime[which(base$WhereWhen %in% 30:39)])
  pmpublic <- sum(base$eptime[which(base$WhereWhen %in% 40:49)])
  pmunknown <- sum(base$eptime[which(base$WhereWhen == 90)])
  if(pmtot > 0){
    res1 <- round(c(pmwalk,pmcycle,pmprivate,pmpublic,pmunknown)/pmtot,5)
  }
  job <- c(4110,1100,1110,1210,1120,1220)
  pworktot <- sum(base$eptime[base$whatdoing %in% job])
  pworkhome <- sum(base$eptime[base$whatdoing %in% job & base$WhereWhen == 11])
  if(pworktot > 0){
    res2 <- round(pworkhome / pworktot,5)
  }
  return(c(x,res1,res2))
}
other <- sapply(TUS$uniqueID,extractProp)

# Extract time spent doing each activity
createTIMESPENT <- function(x){
  work <- TUS$dml1_1[x]
  school <- TUS$dml2_21[x]
  home1 <- TUS$dml1_0[x]
  home2 <- TUS$dml1_3[x]
  home3 <- TUS$dml1_7[x]
  home4 <- TUS$dml1_8[x]
  shop <- TUS$dml3_361[x]
  services1 <- TUS$dml3_362[x]
  services2 <- TUS$dml3_363[x]
  leisure1 <- TUS$dml1_4[x]
  leisure2 <- TUS$dml1_5[x]
  leisure3 <- TUS$dml1_6[x]
  escort <- TUS$dml3_923[x]
  transport <- TUS$dml1_9a[x]
  work1 <- 0
  work2 <- work
  if(!is.na(other[7,x])){
    work1 <- work * as.numeric(other[7,x])
    work2 <- work * (1 - as.numeric(other[7,x]))
  }
  res <- round(c(work1,home1+home2+home3+home4,work2,school,shop,services1+services2,leisure1+leisure2+leisure3,escort,transport) / (24 * 60),5)
  diff <- round(1 - sum(res),5)
  if(diff < 0){
    res[2] <- res[2] + diff
    if(res[2] < 0){
      res <- rep(NA,length(res))
    }
  }
  diff <- round(1 - sum(res),5)
  return(c(res,sum(res[1:2]),sum(res[3:9]),diff,as.numeric(other[2:6,x])))
}
test <- sapply(1:nrow(TUS), createTIMESPENT)

# Final gathering of all the extracted data
TUS$pworkhome <- test[1,]
TUS$phomeother <- test[2,]
TUS$pwork <- test[3,]
TUS$pschool <- test[4,]
TUS$pshop <- test[5,]
TUS$pservices <- test[6,]
TUS$pleisure <- test[7,]
TUS$pescort <- test[8,]
TUS$ptransport <- test[9,]
TUS$phomeTOT <- test[10,]
TUS$pnothomeTOT <- test[11,]
TUS$punknownTOT <- test[12,]

TUS$pmwalk <- test[13,]
TUS$pmcycle <- test[14,]
TUS$pmprivate <- test[15,]
TUS$pmpublic <- test[16,]
TUS$pmunknown <- test[17,]

TUS <- TUS[,c(22,3:5,23:39)]

# Merge with indivTUS to get demographics
test <- indivTUS[,1:7]
test$uniqueID <- paste(test$id_TUS,test$pnum, sep = "_") 
TUS$uniqueIDb <- substr(b$uniqueID,1,10)
TUS <- merge(TUS,test, by.x = "uniqueIDb", by.y = "uniqueID", all.x = T)
TUS <- TUS[!is.na(TUS$age),]
row.names(TUS) <- 1:nrow(TUS)

# Output
write.table(TUS,paste(folderOut,"diariesRef.csv",sep = ""),row.names = F, sep = ",")

print("Outputs written")


###########################################
##### Google mobility and new Look-Up #####
###########################################


print("Working on mobility data...")

### Google mobility

# Assumption: if percent value for a County is NA -> change value to national average

# Download latest file from google mobility
options(timeout=600)
download.file("https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv", 
              destfile = paste(folderIn,"Google_Global_Mobility_Report.csv",sep = ""))
gm <- read_csv(paste(folderIn,"Google_Global_Mobility_Report.csv",sep = "")) %>% 
  filter(country_region == "United Kingdom" & !is.na(sub_region_1))
gm <- gm %>% dplyr::select( c(sub_region_1,date,residential_percent_change_from_baseline))
colnames(gm) <- c("GoogleCTY_CNC","date","change")
gm$day <- as.numeric(gm$date)-min(as.numeric(gm$date))

# Aggregate CTY/date
gm <- gm[,c(1,2,4,3)]
gm <- aggregate(gm$change, by = list(gm$GoogleCTY_CNC,gm$date,gm$day),FUN = mean)
colnames(gm) <- c("GoogleCTY_CNC","date","day","change")

M <- matrix(nrow = length(unique(gm$GoogleCTY_CNC)),ncol = length(unique(gm$day)),NA)
rownames(M) <- unique(gm$GoogleCTY_CNC)
colnames(M) <- unique(gm$day)
base <- melt(M)

gm <- merge(base, gm, by.x = c("Var1","Var2"), by.y = c("GoogleCTY_CNC","day"), all=T)
gm <- gm[,c(1,4,2,5)]
colnames(gm) <- c("GoogleCTY_CNC","date","day","change")

# Change NA values to national average
nat <- aggregate(gm$change, by = list(gm$day), FUN = mean, na.rm = TRUE)$x
gm$change[is.na(gm$change)] <- nat[gm$day[is.na(gm$change)]+1]

# Restore missing dates
ref <- as.Date(0:max(gm$day) , origin = min(gm$date,na.rm = T))
gm$date[is.na(gm$date)] <- ref[gm$day[is.na(gm$date)] + 1]

# Output file
gm$change <- round(gm$change/100 + 1,2)
print("Writing outputs...")
write.table(gm,paste(folderOut,"timeAtHomeIncreaseCTY.csv",sep = ""),row.names = F,sep=",")

# Updated list of areas to build the look-up
#googleCTY_CNC <- unique(gm$GoogleCTY_CNC)
#write.table(googleCTY_CNC,paste(folderOut,"googleCTY_CNC_list.csv",sep = ""),row.names = F,sep=",")


### New look-up

print("Working on the look-up")

# Old European NUTS geographies, now renamed "ITL"
download.file("https://www.arcgis.com/sharing/rest/content/items/cdb629f13c8f4ebc86f30e8fe3cddda4/data",destfile = paste(folderIn,"LAD20_LAU121_ITL321_ITL221_ITL121_UK_LU_v2.csv",sep = ""))

itlRef <- read.csv(paste(folderIn,"LAD20_LAU121_ITL321_ITL221_ITL121_UK_LU_v2.csv",sep = ""))
itlRef <- itlRef[,c(1,5:10)]
itlRef <- itlRef[!duplicated(itlRef),]

itlRef <- itlRef[!duplicated(itlRef$LAD20CD),] # Necessary due to two ITL321 not overlapping properly with councils


###
### England and Wales
###


download.file("https://opendata.arcgis.com/api/v3/datasets/e8fef92ac4114c249ffc1ff3ccf22e12_0/downloads/data?format=csv&spatialRefId=4326&where=1%3D1",destfile = paste(folderIn,"Output_Area_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Authority_District_(December_2020)_Lookup_in_England_and_Wales.csv",sep = ""))

oatoOtherEW <- read.csv(paste(folderIn,"Output_Area_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Authority_District_(December_2020)_Lookup_in_England_and_Wales.csv",sep = ""))
oatoOtherEW$Country <- NA
oatoOtherEW$Country[grep("E",oatoOtherEW$MSOA11CD)] <- "England"
oatoOtherEW$Country[grep("W",oatoOtherEW$MSOA11CD)] <- "Wales"
oatoOtherEW <- merge(oatoOtherEW,itlRef, by.x = "LAD20CD", by.y = "LAD20CD", all.x = T)
lu2 <- data.frame(MSOA11CD = lu$MSOA11CD, GoogleMob = lu$GoogleMob, OSM = lu$OSM, AzureRef = lu$NewTU)
oatoOtherEW <- merge(oatoOtherEW,lu2, by.x = "MSOA11CD", by.y = "MSOA11CD", all.x = T)

wales <- which(is.na(oatoOtherEW$OSM))
oatoOtherEW$OSM[wales] <- "https://download.geofabrik.de/europe/great-britain/wales-latest-free.shp.zip"

test <- oatoOtherEW[wales,]
test$track <- 1:nrow(test)
temp1 <- unique(test$LAD20NM)
googleNamesW <- data.frame(ons = temp1,
                           googleCTY_CNC = c("Isle of Anglesey","Gwynedd","Conwy Principal Area","Denbighshire","Flintshire","Wrexham Principal Area","Powys",
                                             "Ceredigion","Pembrokeshire","Carmarthenshire","Swansea","Neath Port Talbot Principle Area","Bridgend County Borough",
                                             "Vale of Glamorgan","Rhondda Cynon Taff","Merthyr Tydfil County Borough","Caerphilly County Borough","Blaenau Gwent",
                                             "Torfaen Principal Area","Monmouthshire","Newport","Cardiff")
                           )
test <- merge(test,googleNamesW,by.x = "LAD20NM", by.y = "ons",all.x = T)
test <- test[order(test$track),]
rownames(test) <- 1:nrow(test)
oatoOtherEW$GoogleMob[wales] <- test$googleCTY_CNC
oatoOtherEW$AzureRef[wales] <- test$ITL321NM
oatoOtherEW$AzureRef[wales] <- tolower(oatoOtherEW$AzureRef[wales])
oatoOtherEW$AzureRef[wales] <- gsub(" ","-",oatoOtherEW$AzureRef[wales])
oatoOtherEW$RGN20CD[wales] <- NA
oatoOtherEW$RGN20NM[wales] <- NA

oatoOtherEW$RGN20NM[oatoOtherEW$RGN20NM == "East of England"] <- "East"

oatoOtherEW <- oatoOtherEW[order(oatoOtherEW$LSOA11CD),c(4:6,1,7,2,8,12:20,9:11)]
rownames(oatoOtherS) <- 1:nrow(oatoOtherS)


###
### Scotland
###


# Basic look-up table
download.file("https://www.nrscotland.gov.uk/files//geography/2011-census/OA_DZ_IZ_2011.xlsx",destfile = paste(folderIn,"OA_DZ_IZ_2011.xlsx",sep = ""))
# More details (codes, names, other geographies)
download.file("https://statistics.gov.scot/downloads/file?id=13360f3a-ca68-4f3e-8b7f-caffed8712eb%2FDataZone2011lookup_2022-05-31.csv",destfile = paste(folderIn,"DataZone2011lookup_2022-05-31.csv",sep = ""))

oatoOtherS1 <- read_excel(paste(folderIn,"OA_DZ_IZ_2011.xlsx",sep = ""), sheet = 1)
oatoOtherS1 <- as.data.frame(oatoOtherS1)
oatoOtherS2 <- read.csv(paste(folderIn,"DataZone2011lookup_2022-05-31.csv",sep = ""))

oatoOtherS <- merge(oatoOtherS1,oatoOtherS2,by.x = "DataZone2011Code",by.y = "DZ2011_Code",all.x = T)
oatoOtherS <- data.frame(OA11CD = oatoOtherS$OutputArea2011Code, LSOA11CD = oatoOtherS$DataZone2011Code, LSOA11NM = oatoOtherS$DZ2011_Name,
                         MSOA11CD = oatoOtherS$IZ2011_Code, MSOA11NM = oatoOtherS$IZ2011_Name,
                         LAD20CD = oatoOtherS$LA_Code, LAD20NM = oatoOtherS$LA_Name,
                         GoogleMob = NA, OSM = "https://download.geofabrik.de/europe/great-britain/scotland-latest-free.shp.zip", AzureRef = oatoOtherS$SPD_Name,
                         RGN20CD = NA, RGN20NM = NA, Country = oatoOtherS$Country_Name)
oatoOtherS$AzureRef <- tolower(oatoOtherS$AzureRef)
oatoOtherS$AzureRef <- gsub(" ","-",oatoOtherS$AzureRef)

temp1 <- sort(as.character(unique(oatoOtherS$LAD20NM)),decr = F)

googleNamesS <- data.frame(ons = temp1,
                           googleCTY_CNC = c("Aberdeen City","Aberdeenshire","Angus Council","Argyll and Bute Council","Clackmannanshire","Dumfries and Galloway",
                                             "Dundee City Council","East Ayrshire Council","East Dunbartonshire Council","East Lothian Council","East Renfrewshire Council","Edinburgh",   
                                             "Na h-Eileanan an Iar","Falkirk","Fife","Glasgow City","Highland Council","Inverclyde",         
                                             "Midlothian","Moray","North Ayrshire Council","North Lanarkshire","Orkney","Perth and Kinross",    
                                             "Renfrewshire","Scottish Borders","Shetland Islands","South Ayrshire Council","South Lanarkshire","Stirling",            
                                             "West Dunbartonshire Council","West Lothian")
                           )
                           
oatoOtherS <- merge(oatoOtherS,googleNamesS,by.x = "LAD20NM", by.y = "ons", all.x = T)
oatoOtherS$GoogleMob <- oatoOtherS$googleCTY_CNC

oatoOtherS <- merge(oatoOtherS,itlRef,by.x = "LAD20CD", by.y = "LAD20CD", all.x = T)

oatoOtherS <- oatoOtherS[order(oatoOtherS$LSOA11CD),c(3:7,1:2,15:20,8:13)]
rownames(oatoOtherS) <- 1:nrow(oatoOtherS)


###
###
###


oatoOther <- rbind(oatoOtherEW,oatoOtherS)
rownames(oatoOther) <- 1:nrow(oatoOther)

# Output
print("Writing outputs...")
write.table(oatoOther,paste(folderOut,"lookUp-GB.csv",sep = ""),row.names = F, sep = ",")


###
### OA centroids
###


download.file("https://stg-arcgisazurecdataprod1.az.arcgis.com/exportfiles-1559-14679/Output_Areas_Dec_2011_PWC_2022_4250323215893203467.csv?sv=2018-03-28&sr=b&sig=lXtKu1VuADphReJfFvfgqHHWm4CtHnk3iusPMruCxO0%3D&se=2023-04-24T18%3A30%3A56Z&sp=r",destfile = paste(folderIn,"Output_Areas_Dec_2011_PWC_2022_4250323215893203467.csv",sep = ""))
OACoords <- read.csv(paste(folderIn,"Output_Areas_Dec_2011_PWC_2022_4250323215893203467.csv",sep = ""))

ukgrid = "+init=epsg:27700"
latlong = "+init=epsg:4326"

coords <- cbind(Easting = as.numeric(as.character(OACoords$x)), Northing = as.numeric(as.character(OACoords$y)))
coords_SP <- SpatialPointsDataFrame(coords, data = data.frame(OACoords$OA11CD,OACoords$OBJECTID), proj4string = CRS("+init=epsg:27700"))

coords2 <- spTransform(coords_SP, CRS(latlong))
coords2 <- coords2@coords

OACoordsF <- data.frame(OA11CD = OACoords$OA11CD, easting = OACoords$x, northing = OACoords$y, lng = coords2[,1], lat = coords2[,2])

write.table(OACoordsF,paste(folderOut,"OACentroids.csv",sep = ""),row.names = F, sep = ",")


print("End of raw_to_prepared")