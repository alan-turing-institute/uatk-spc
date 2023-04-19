library(dplyr)
library(tidyr)
library(foreign)


folderIn <- "Data/raw/"

outputFolder <- "Data/prepData/"
set.seed(12345)


####################
##### HSE data #####
####################


### Load raw for all 3 countries (downloaded from UK Data Service, requires registration)
folderIn2 <- "hs/"
HSE <- read.table(paste(folderIn,folderIn2,"hse_2019_eul_20211006.tab",sep = ""), sep="\t", header=TRUE)
HSWa <- read.table(paste(folderIn,folderIn2,"whs_2015_adult_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSWc <- read.table(paste(folderIn,folderIn2,"whs_2015_child_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSS <- read.table(paste(folderIn,folderIn2,"shes19i_eul.tab",sep = ""), sep="\t", header=TRUE)


### Normalisation

# England
HSE <- data.frame(id_HS = HSE$SerialA, sex = HSE$Sex, age35g = HSE$Age35g, nssec5 = HSE$nssec5,
                  diabetes = HSE$Diabetes, bloodpressure = HSE$bp1, cvd = HSE$CardioTakg2)
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
}
HSE$country <- "England"

# Scotland
HSS <- data.frame(id_HS = HSS$CPSerialA, sex = HSS$Sex, age35g = HSS$age, nssec5 = HSS$NSSEC5,
                  diabetes = HSS$diabete2, bloodpressure = HSS$bp1, cvd = HSS$cvddef1)
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
                   diabetes = HSWa$diab, bloodpressure = HSWa$hbp, cvd = HSWa$heart) # For Wales, blood pressure is only if treated
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
}
HSWa$age35g <- HSWa$age35g + 6
HSWa$country <- "Wales"

HSWc <- data.frame(id_HS = HSWc$archpsn, sex = HSWc$sex, age35g = HSWc$childage, nssec5 = 0,
                   diabetes = 0, bloodpressure = 0, cvd = 0)
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
HSWc$country <- "Wales"


### Output single file
HS <- rbind(HSE,HSS,HSWa,HSWc)
write.table(HS,paste(outputFolder,"HSComplete.csv",sep = ""),row.names = F, sep = ",")


######################
##### NSSEC data #####
######################


# SOURCE:
# DC6114EW - NS-SeC by sex and age at MSOA level (England and Wales)
# DC6206SC - NS-SeC by sex / age / ethnnicity at Country level (Scotland)


### England and Wales
downloadNSSEC <- function(age,sex){
  URLB <- "https://www.nomisweb.co.uk/api/v01/dataset/NM_796_1.data.csv?date=latest&geography="
  URL1 <- "1245710776...1245710790,1245712478...1245712543,1245710706...1245710716,1245715055,1245710717...1245710734,1245714957,1245713863...1245713902,1245710735...1245710751,1245714958,1245715056,1245710752...1245710775,1245709926...1245709950,1245714987,1245714988,1245709951...1245709978,1245715039,1245709979...1245710067,1245710832...1245710868,1245712005...1245712034,1245712047...1245712067,1245711988...1245712004,1245712035...1245712046,1245712068...1245712085,1245710791...1245710831,1245712159...1245712222,1245709240...1245709350,1245715048,1245715058...1245715063,1245709351...1245709382,1245715006,1245709383...1245709577,1245713352...1245713362,1245715027,1245713363...1245713411,1245715017,1245713412...1245713456,1245715030,1245713457...1245713502,1245709578...1245709655,1245715077...1245715079,1245709679...1245709716,1245709656...1245709678,1245709717...1245709758,1245710900...1245710939,1245714960,1245715037,1245715038,1245710869...1245710899,1245714959,1245710940...1245711009,1245713903...1245713953,1245715016,1245713954...1245713977,1245709759...1245709925,1245714949,1245714989,1245714990,1245715014,1245715015,1245710411...1245710660,1245714998,1245715007,1245715021,1245715022,1245710661...1245710705,1245711010...1245711072,1245714961,1245714963,1245714965,1245714996,1245714997,1245711078...1245711112,1245714980,1245715050,1245715051,1245711073...1245711077,1245712223...1245712237,1245714973"
  URL2 <- "1245712238...1245712284,1245714974,1245712285...1245712294,1245715018,1245712295...1245712306,1245714950,1245712307...1245712316,1245715065,1245715066,1245713503...1245713513,1245714966,1245713514...1245713544,1245714962,1245713545...1245713581,1245714964,1245715057,1245713582...1245713587,1245715010,1245715011,1245713588...1245713627,1245715012,1245715013,1245713628...1245713665,1245713774...1245713779,1245715008,1245715009,1245713780...1245713862,1245713978...1245714006,1245715049,1245714007...1245714019,1245715052,1245714020...1245714033,1245714981,1245714034...1245714074,1245711113...1245711135,1245714160...1245714198,1245711159...1245711192,1245711136...1245711158,1245714270...1245714378,1245714616...1245714638,1245714952,1245714639...1245714680,1245710068...1245710190,1245714953,1245714955,1245715041...1245715047,1245710191...1245710231,1245714951,1245710232...1245710311,1245714956,1245710312...1245710339,1245714954,1245710340...1245710410,1245715040,1245714843...1245714927,1245711814...1245711833,1245711797...1245711813,1245711834...1245711849,1245711458...1245711478,1245711438...1245711457,1245715023,1245715024,1245711479...1245711512,1245715005,1245715071,1245711915...1245711936,1245714971,1245711937...1245711987,1245715019,1245715020,1245712611...1245712711,1245715068,1245712712...1245712784,1245713023...1245713175,1245713666...1245713758,1245715053,1245715054,1245713759...1245713773"
  URL3 <- "1245714379...1245714395,1245714972,1245714396...1245714467,1245708449...1245708476,1245708289,1245708620...1245708645,1245715064,1245715067,1245708646...1245708705,1245714941,1245708822...1245708865,1245708886...1245708919,1245714947,1245708920...1245708952,1245714930,1245714931,1245714944,1245708978...1245709014,1245709066...1245709097,1245714948,1245709121...1245709150,1245714999,1245715000,1245709179...1245709239,1245708290...1245708310,1245714945,1245708311...1245708378,1245714932,1245708379...1245708448,1245714929,1245714934,1245714936,1245708477...1245708519,1245714935,1245708520...1245708557,1245714938,1245708558...1245708592,1245714940,1245708593...1245708619,1245714933,1245715072...1245715076,1245708706...1245708733,1245714942,1245715028,1245708734...1245708794,1245714943,1245708795...1245708821,1245714939,1245708866...1245708885,1245708953...1245708977,1245709015...1245709042,1245714946,1245715069,1245715070,1245709043...1245709065,1245709098...1245709120,1245714982,1245709151...1245709178,1245711551...1245711565,1245711690...1245711722,1245711779...1245711796,1245711513...1245711550,1245711658...1245711689,1245711723...1245711746,1245714967,1245711588...1245711619,1245711747...1245711778,1245711566...1245711587,1245711620...1245711657,1245711850...1245711884,1245714969,1245711885...1245711914,1245714970,1245712544...1245712554,1245715003,1245715004,1245712555...1245712610"
  URL4 <- "1245712860...1245712894,1245714975,1245714984,1245712895...1245712958,1245714968,1245714976,1245714977,1245712959...1245713022,1245713176...1245713206,1245715001,1245715002,1245713207...1245713279,1245714978,1245713280...1245713291,1245715025,1245715026,1245713292...1245713337,1245714979,1245713338...1245713351,1245714075...1245714144,1245715032,1245714145...1245714159,1245714468...1245714493,1245714983,1245714494...1245714587,1245714937,1245714588...1245714603,1245714985,1245714604...1245714615,1245714681...1245714780,1245711193...1245711219,1245711375...1245711395,1245715029,1245715031,1245711220...1245711270,1245715033...1245715036,1245712086...1245712158,1245714928,1245711271...1245711294,1245714991,1245714992,1245711327...1245711358,1245711396...1245711413,1245711295...1245711326,1245711414...1245711437,1245714993...1245714995,1245711359...1245711374,1245714986,1245714781...1245714842,1245712317...1245712477,1245712785...1245712859,1245714199...1245714269,1245715080...1245715134,1245715485,1245715135...1245715171,1245715486,1245715172...1245715188,1245715480,1245715482,1245715189...1245715196,1245715487,1245715197...1245715236,1245715484,1245715237...1245715285,1245715483,1245715286...1245715319,1245715434...1245715479,1245715488,1245715489,1245715320...1245715356,1245715481,1245715357...1245715433"
  URLE <- paste("&c_sex=",sex,"&c_nssec=1,4...10,13&c_age=",age,"&measures=20100&select=geography_code,c_nssec_name,obs_value",sep="")
  download.file(paste(URLB,URL1,URLE,sep = ""),destfile = "Data/dl/data1.csv")
  download.file(paste(URLB,URL2,URLE,sep = ""),destfile = "Data/dl/data2.csv")
  download.file(paste(URLB,URL3,URLE,sep = ""),destfile = "Data/dl/data3.csv")
  download.file(paste(URLB,URL4,URLE,sep = ""),destfile = "Data/dl/data4.csv")
  data1 <- read.csv("Data/dl/data1.csv")
  data2 <- read.csv("Data/dl/data2.csv")
  data3 <- read.csv("Data/dl/data3.csv")
  data4 <- read.csv("Data/dl/data4.csv")
  data <- rbind(data1,data2,data3,data4)
  data$C_NSSEC_NAME <- substr(as.character(data$C_NSSEC_NAME),1,1)
  data$C_NSSEC_NAME[data$C_NSSEC_NAME == "L"] <- 9
  data$C_NSSEC_NAME <- as.numeric(data$C_NSSEC_NAME)
  colnames(data) <- c("MSOA11CD","nssec8","number")
  return(data)
}
writeNSSECTables <- function(age,sex){
  ref <- matrix(c("M_16-24","M_25-34","M_35-49","M_50-64","M_65p",
                  "F_16-24","F_25-34","F_35-49","F_50-64","F_65p"),
                ncol = 2)
  NSSEC <- downloadNSSEC(age,sex)
  NSSEC <- spread(NSSEC, nssec8, number)
  colnames(NSSEC) <- c("MSOA11CD","N1","N2","N3","N4","N5","N6","N7","N8","Student")
  write.table(NSSEC,paste(outputFolder,"NSSEC8_EW_",ref[age,sex],"_CLEAN.csv",sep = ""),row.names = F, sep = ",")
}

for(i in 1:5){
  for(j in 1:2){
    writeNSSECTables(i,j)
  }
}


### Scotland
NSSEC <- read.csv(paste(inputFolder,"NSSEC8_S_Country_Age-Sex-Eth.csv",sep = ""),skip = 3)
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

write.table(NSSEC,paste(outputFolder,"NSSECS_CLEAN.csv",sep = ""),row.names = F, sep = ",")


####################
##### TUS data #####
####################


###
### Personal information from TUS
###

# Reference data
indivTUS <- read.table("Data/uktus15_individual.tab", sep="\t", header=TRUE)

# Save
#indivTUSO <- indivTUS

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
write.table(indivTUS,paste(outputFolder,"indivTUS.csv",sep = ""),row.names = F, sep = ",")


###
### Create diaries reference file
###

# Load main reference file listing all sampled diaries
TUS <- read.table("Data/uktus15_dv_time_vars.tab", sep="\t", header=TRUE)


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

# Merge with indivTUS to get demographic de
test <- indivTUS[,1:7]
test$uniqueID <- paste(test$id_TUS,test$pnum, sep = "_") 
TUS$uniqueIDb <- substr(b$uniqueID,1,10)
TUS <- merge(TUS,test, by.x = "uniqueIDb", by.y = "uniqueID", all.x = T)
TUS <- TUS[!is.na(TUS$age),]
row.names(TUS) <- 1:nrow(TUS)

TUS <- TUS[,c(2:22,25:29)]

TUS[nrow(TUS)+1,] <- c("00000000_1_0",0)

TUS[1,]


#00000000_1_0
#00000000_1_1
#00000000_1_0
#00000000_1_0
colnames(TUS)

# Output
write.table(TUS,paste("Outputs/","diariesRef.csv",sep = ""),row.names = F, sep = ",")


df <- data.frame(pschool = TUS$pschool, pwkstat = TUS$pwkstat, age = TUS$age)
df <- df[df$pschool > 0,]


#######################
##### New Look-Up #####
#######################


ladsRef <- read.csv("/Users/hsalat/SPC_Extension/Data/geographies/new_lad_list.csv") # Checking consistency: OK

itlRef <- read.csv("/Users/hsalat/SPC_Extension/Data/geographies/LAD20_LAU121_ITL321_ITL221_ITL121_UK_LU_v2.csv")
itlRef <- itlRef[,c(1,5:10)]
itlRef <- itlRef[!duplicated(itlRef),]

itlRef <- itlRef[!duplicated(itlRef$LAD20CD),] # Necessary due to two ITL321 not overlapping properly with councils


###
### England and Wales
###


oatoOtherEW <- read.csv("/Users/hsalat/SPC_Extension/Data/geographies/Output_Area_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Authority_District_(December_2020)_Lookup_in_England_and_Wales.csv")
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

oatoOtherEW <- oatoOtherEW[order(oatoOtherEW$LSOA11CD),c(4:6,1,7,2,8,12:20,9:11)]
rownames(oatoOtherS) <- 1:nrow(oatoOtherS)


###
### Scotland
###


oatoOtherS1 <- read.csv("/Users/hsalat/SPC_Extension/Data/geographies/OA_DZ_IZ_2011.csv")
oatoOtherS2 <- read.csv("/Users/hsalat/SPC_Extension/Data/geographies/DataZone2011lookup_2022-05-31.csv")

oatoOtherS <- merge(oatoOtherS1,oatoOtherS2,by.x = "DataZone2011Code",by.y = "DZ2011_Code",all.x = T)
oatoOtherS <- data.frame(OA11CD = oatoOtherS$OutputArea2011Code, LSOA11CD = oatoOtherS$DataZone2011Code, LSOA11NM = oatoOtherS$DZ2011_Name,
                         MSOA11CD = oatoOtherS$IZ2011_Code, MSOA11NM = oatoOtherS$IZ2011_Name,
                         LAD20CD = oatoOtherS$LA_Code, LAD20NM = oatoOtherS$LA_Name,
                         GoogleMob = NA, OSM = "https://download.geofabrik.de/europe/great-britain/scotland-latest-free.shp.zip", AzureRef = oatoOtherS$SPD_Name,
                         RGN20CD = NA, RGN20NM = NA, Country = oatoOtherS$Country_Name)
oatoOtherS$AzureRef <- tolower(oatoOtherS$AzureRef)
oatoOtherS$AzureRef <- gsub(" ","-",oatoOtherS$AzureRef)

temp1 <- as.character(unique(oatoOtherS$LAD20NM))
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
write.table(oatoOther,paste("Outputs/","lookUp-GB.csv",sep = ""),row.names = F, sep = ",")


###
###
###


library(ggplot2)
library(dplyr)
library(rgdal)
library(rgeos)
library(raster)
library(sp)
library(foreign)
#library(reshape2)


oldBR <- read.csv("/Users/hsalat/SPC_Extension/Data/businessRegistry/businessRegistryOld.csv")


### REQUIRED: UK Business Counts - local units by industry and employment size band (https://www.nomisweb.co.uk/datasets/idbrlu)
### REQUIRED: Employment survey (https://www.nomisweb.co.uk/datasets/apsnew)
### OUTDATED? Look Up tables for employment specific geographies


######################################################################
####### #Employees per business unit at national level (NOMIS) #######
######################################################################


####### Data is per industry sic2017 "section" (21 categories), summing all (checks only)

totW <- read.csv("/Users/hsalat/SPC_Extension/Data/businessRegistry/WalesAll.csv",skip = 8)
totS <- read.csv("/Users/hsalat/SPC_Extension/Data/businessRegistry/ScotlandAll.csv",skip = 8)

nat <- data.frame(realW = rowSums(totW[1:9,3:23]), realS = rowSums(totS[1:9,3:23]))
nat$mid <- c((4-0)/2,5+(9-5)/2,10+(19-10)/2,20+(49-20)/2,50+(99-50)/2,100+(249-100)/2,250+(499-250)/2,500+(999-500)/2,1000+(2000-1000)/2) # 2000 as upper limit is arbitrary

# 1/x fit
fitW <- lm(log(nat$realW[1:8]) ~ log(nat$mid[1:8]))
fitS <- lm(log(nat$realS[1:9]) ~ log(nat$mid[1:9]))
nat$fitW <-c(exp(fitted(fitW)),1)
nat$fitS <-exp(fitted(fitS))

# Plot: real values vs 1/x fit
ggplot(nat, aes(x=mid, y=realW)) + geom_line(color="black",size=2,alpha=0.6) + 
  geom_line(aes(x=mid, y=fitW),color = 3) +
  ylab("Number of business units") + xlab("Number of employees") +
  ggtitle("National distribution of business unit sizes")

ggplot(nat, aes(x=mid, y=realS)) + geom_line(color="black",size=2,alpha=0.6) + 
  geom_line(aes(x=mid, y=fitS),color = 4) +
  ylab("Number of business units") + xlab("Number of employees") +
  ggtitle("National distribution of business unit sizes")

####################
####### Data #######
####################

name = "0-9"
country = "Scotland"

####### #Business units per employee size band at MSOA level and per business sic2017 2d division (89 categories)
loadNBus <- function(name,country){
  temp <- read.csv(paste("/Users/hsalat/SPC_Extension/Data/businessRegistry/",country,name,"MSOA.csv",sep=""),skip = 8)  # <--- UK Business Counts
  colnames(temp)[1] <- "X2011.super.output.area...middle.layer"
  temp <- temp[which(!(temp$X2011.super.output.area...middle.layer == "" | temp$X2011.super.output.area...middle.layer == "Column Total")),2:ncol(temp)]
  colnames(temp)[1] <- "MSOA11CD"
  temp <- temp[order(temp$MSOA11CD),]
  rownames(temp) <- 1:nrow(temp)
  return(temp)
}

E0to9W <- loadNBus("0-9","Wales")
E10to49W <- loadNBus("10-49","Wales")
E50to249W <- loadNBus("50-249","Wales")
E250pW <- loadNBus("250p","Wales")

E0to9S <- loadNBus("0-9","Scotland")
E10to49S <- loadNBus("10-49","Scotland")
E50to249S <- loadNBus("50-249","Scotland")
E250pS <- loadNBus("250p","Scotland")

ref <- c("E0to9W" ,"E10to49W","E50to249W","E250pW","E0to9S" ,"E10to49S","E50to249S","E250pS")

# Merging into one dataset
msoaData <- data.frame(catTemp = NA, band = NA, MSOA11CD = NA, refTemp=NA)
for(i in 1:length(ref)){
  temp2 <- get(ref[i])
  for(j in 1:nrow(temp2)){
    for(k in 2:ncol(temp2)){
      if(temp2[j,k]>0){
        temp3 <- data.frame(catTemp = rep(k-1,temp2[j,k]) , band = i, MSOA11CD = temp2$MSOA11CD[j], refTemp = 1:temp2[j,k])
        msoaData <- rbind(msoaData,temp3)
      }
    }
  }
}

#######  #Employees at LSOA level per business sic2017 2d division (89 categories)

loadlsoa <- function(country){
  temp <- read.csv(paste("/Users/hsalat/SPC_Extension/Data/businessRegistry/",country,"LSOA.csv",sep=""),skip = 8) # <--- Employment Survey
  colnames(temp)[1] <- "X2011.super.output.area...lower.layer"
  temp <- temp[which(!(temp$X2011.super.output.area...lower.layer == "" | temp$X2011.super.output.area...lower.layer == "Column Total" | temp$X2011.super.output.area...lower.layer == "*")),2:ncol(temp)]
  colnames(temp)[1] <- "LSOA11CD"
  temp <- temp[order(temp$LSOA11CD),]
  rownames(temp) <- 1:nrow(temp)
  temp <- temp[,c(1,seq(2,177,by=2))]
  return(temp)
}

Wlsoa <- loadlsoa("Wales")
Slsoa <- loadlsoa("Scotland")


# Merging into one dataset
lsoaData <- rbind(Wlsoa,Slsoa)


####### look up tables: MSOA/LSOA and industry sic2017 categories

lookUp <- read.csv("data/Output_Area_to_Local_Authority_District_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Enterprise_Partnership__April_2020__Lookup_in_England.csv")
lookUp <- lookUp[,c("LSOA11CD","MSOA11CD")]
lookUp <- lookUp %>% distinct()

temp <- c(rep(1,3),rep(2,5),rep(3,24),rep(4,1),rep(5,4),rep(6,3),rep(7,3),rep(8,5),rep(9,2),rep(10,6),
          rep(11,3),rep(12,1),rep(13,7),rep(14,6),rep(15,1),rep(16,1),rep(17,3),rep(18,4),rep(19,3),rep(20,2),
          rep(21,1))

refIC <- data.frame(sic1d07 = temp, sic2d07 = c(1:3,5:9,10:33,35,36:39,41:43,45:47,49:53,55:56,58:63,64:66,68,69:75,77:82,84,85,86:88,90:93,94:96,97:98,99),
                    sic2d07Ref = 1:88
)


####### Assembling the puzzle: register of business units in England

busPop <- merge(msoaData,refIC,by.x="catTemp",by.y="sic2d07Ref")

# 'id' field

temp1 <- as.character(busPop$sic2d07)
for(i in 1:length(temp1)){
  if(nchar(temp1[i]) < 2){
    temp1[i] <- paste("0",temp1[i],sep="")
  }
}

temp2 <- as.character(busPop$refTemp)
for(i in 1:length(temp2)){
  if(nchar(temp2[i]) == 1){
    temp2[i] <- paste("000",temp2[i],sep="")
  }else if(nchar(temp2[i]) == 2){
    temp2[i] <- paste("00",temp2[i],sep="")
  }else if(nchar(temp2[i]) == 3){
    temp2[i] <- paste("0",temp2[i],sep="")
  }
}

busPop$id <- paste(busPop$MSOA11CD,busPop$band,temp1,temp2,sep="")

busPop <- busPop[,c(7,2,3,5,6)]
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

# 'size' field

BUsizeW <- function(n,band){
  if(band == 1){
    x <- 1:9
  }else if(band == 2){
    x <- 10:49
  }else if(band == 3){
    x <- 50:249
  }else{
    x <- 250:1500
  }
  return(sample(x, n, replace = T, prob = fitW$coefficients[1]*(x^fitW$coefficients[2])))
}

BUsizeS <- function(n,band){
  if(band == 1){
    x <- 1:9
  }else if(band == 2){
    x <- 10:49
  }else if(band == 3){
    x <- 50:249
  }else{
    x <- 250:1500
  }
  return(sample(x, n, replace = T, prob = fitS$coefficients[1]*(x^fitS$coefficients[2])))
}

idw <- grep("W",busPop$MSOA11CD)
ids <- grep("S",busPop$MSOA11CD)

length(ids) + length(idw)

busPop$size[idw] <- mapply(BUsizeW,1,busPop$band[idw])
busPop$size[ids] <- mapply(BUsizeS,1,busPop$band[ids])
busPop <- busPop[,c(1,6,3:5)]



# hist(busPop$size)
# sum(busPop$size)
# sum(lsoaData[2:89])

# 'lsoa' field

busPop2 <- merge(busPop,refIC,by.x="sic2d07",by.y="sic2d07")

lsoatomsoa <- oatoOther[c(grep("W",oatoOther$MSOA11CD),grep("S",oatoOther$MSOA11CD)),c("LSOA11CD","MSOA11CD")]
lsoatomsoa <- lsoatomsoa[!duplicated(lsoatomsoa),]
rownames(lsoatomsoa) <- 1:nrow(lsoatomsoa)
lsoaData2 <- merge(lsoaData,lsoatomsoa,by.x="LSOA11CD",by.y="LSOA11CD")


busPop3 <- busPop2
busPop2 <- busPop3

msoaFilling <- function(name,busPop2){
  lsoa <- lsoaData2 %>% filter(MSOA11CD == name)
  for(i in 1:88){
    ref <- which(busPop2$MSOA11CD == name & busPop2$sic2d07Ref == i)
    weights <- lsoa[,i+1]
    if(sum(weights > 0)){
      busPop2$LSOA11CD[ref] <- sample(lsoa$LSOA11CD, length(ref), replace = T, prob = weights)
    }else{
      busPop2$LSOA11CD[ref] <- sample(lsoa$LSOA11CD, length(ref), replace = T)
    }
  }
  return(busPop2)
}

busPop2$LSOA11CD <- NA

for(i in unique(busPop2$MSOA11CD)){
  busPop2 <- msoaFilling(i,busPop2)
}

# 'lng' and 'lat' fields

coords <- read.dbf("/Users/hsalat/SPC_Extension/Data/businessRegistry/LSOA.dbf")
idw <- grep("W",coords$LSOA11CD)
coords <- coords[c(idw),c("LSOA11CD","LONG","LAT")]
colnames(coords)[2:3] <- c("lng","lat")

coords2 <- read.dbf("/Users/hsalat/SPC_Extension/Data/businessRegistry/SG_DataZone_Cent_2011.dbf")
ukgrid = "+init=epsg:27700"
latlong = "+init=epsg:4326"
coords3 <- cbind(Easting = as.numeric(as.character(coords2$Easting)), Northing = as.numeric(as.character(coords2$Northing)))
coords3 <- SpatialPointsDataFrame(coords3, data = data.frame(coords2$DataZone), proj4string = CRS("+init=epsg:27700"))
coords3 <- spTransform(coords3, CRS(latlong))
plot(coords3)
coords3 <- coords3@coords
coords3 <- data.frame(LSOA11CD = coords2$DataZone, lng = coords3[,1], lat = coords3[,2])

refLSOA <- rbind(coords3,coords)

busPop2 <- merge(busPop2,refLSOA,by.x = "LSOA11CD",by.y = "LSOA11CD")

busPop <- busPop2[,c(3,4,5,1,9,10,6,2)]
colnames(busPop)[7] <- "sic1d07"
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

busPop <- rbind(oldBR,busPop)

write.table(busPop,"Outputs/businessRegistry.csv",sep=",",row.names = F)


###
###
###



###############
##### BIN #####
###############


# Failed attempt at guessing where people work (home / not home)
createTIMESPENT <- function(x){
  a1 <- TUS$dml1_1[x]
  a2 <- TUS$dml3_910[x]
  b1 <- TUS$dml1_2[x]
  b2 <- TUS$dml3_921[x]
  c1 <- TUS$dml1_0[x]
  c2 <- TUS$dml1_3[x]
  c3 <- TUS$dml1_7[x]
  c4 <- TUS$dml1_8[x]
  d <- TUS$dml3_361[x]
  e1 <- TUS$dml3_362[x]
  e2 <- TUS$dml3_363[x]
  f1 <- TUS$dml1_4[x]
  f2 <- TUS$dml1_5[x]
  f3 <- TUS$dml1_6[x]
  g <- TUS$dml3_923[x]
  h <- TUS$dml1_9a[x]
  if(a2 == 0){
    a11 <- a1
    a12 <- 0
  }else {
    a11 <- 0
    a12 <- a1
  }
  if(b2 == 0){
    b11 <- b1
    b12 <- 0
  }else {
    b11 <- 0
    b12 <- b1
  }
  res <- c(a11,b11,c1+c2+c3+c4,a12,b12,d,e1+e2,f1+f2+f3,g,h) / (24 * 60)
  res <- 
  return(c(res,sum(res[1:3]),sum(res[4:10]),1 - sum(res)))
}

# Old NSSEC from pre-loaded data: England and Wales
NSSECF <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_F.csv",sep = ""),skip = 8)
NSSECM <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_M.csv",sep = ""),skip = 8)

NSSECM16to24 <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_F_16-24.csv",sep = ""),skip = 8)

NSSEC25to34 <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_25-34.csv",sep = ""),skip = 8)
NSSEC35to49 <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_35-49.csv",sep = ""),skip = 8)
NSSEC50to64 <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_50-64.csv",sep = ""),skip = 8)
NSSEC65P <- read.csv(paste(folderIn,folderIn2,"NSSEC8_EW_MSOA_65Plus.csv",sep = ""),skip = 8)


set = "F_16-24"
cleanNSSEC <- function(set){
  NSSEC <- read.csv(paste("Data/nssec/NSSEC8_EW_MSOA_",set,".csv",sep = ""),skip = 8)
  NSSEC <- NSSEC[,2:11]
  colnames(NSSEC) <- c("MSOA11CD","N1","N2","N3","N4","N5","N6","N7","N8","Student")
  write.table(NSSEC,paste(outputFolder,"NSSEC8_EW_",set,"_CLEAN.csv",sep = ""),row.names = F, sep = ",")
}

cleanNSSEC("F_16-24")
cleanNSSEC("F_25-34")
cleanNSSEC("F_35-49")
cleanNSSEC("F_50-64")
cleanNSSEC("F_65p")
cleanNSSEC("M_16-24")
cleanNSSEC("M_25-34")
cleanNSSEC("M_35-49")
cleanNSSEC("M_50-64")
cleanNSSEC("M_65p")
