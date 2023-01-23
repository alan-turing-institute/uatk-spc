library(dplyr)
library(tidyr)

outputFolder <- "Data/prepData/"
set.seed(12345)

####################
##### HSE data #####
####################

# Load raw for all 3 countries (downloaded from UK Data Service)

inputFolder <- "Data/hs/"

HSE <- read.table(paste(inputFolder,"hse_2019_eul_20211006.tab",sep = ""), sep="\t", header=TRUE)
HSWa <- read.table(paste(inputFolder,"whs_2015_adult_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSWc <- read.table(paste(inputFolder,"whs_2015_child_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSS <- read.table(paste(inputFolder,"shes19i_eul.tab",sep = ""), sep="\t", header=TRUE)

# Normalisation

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
  }else if(a %in% 2:4){
    a <- sample(c(2,3,3,3,4,4,4,5,5), size = 1)
  }else if(a == 3){
    a <- 6
  }
  HSWc$age35g[i] <- a
}
HSWc$country <- "Wales"

HS <- rbind(HSE,HSS,HSWa,HSWc)

# Output single file

write.table(HS,paste(outputFolder,"HSComplete.csv",sep = ""),row.names = F, sep = ",")


######################
##### NSSEC data #####
######################

# NSSEC data: https://www.nomisweb.co.uk/datasets/st042

inputFolder <- "Data/nssec/"

NSSEC <- read.csv(paste(inputFolder,"modified.csv",sep = ""))
NSSEC$sex <- 2
NSSEC$sex[1:(348*15)] <- 1
NSSEC$age <- 7
for(i in 0:10){
  NSSEC$age[(348*(4+i) + 1):(348*(4+i+1))] <- i + 8
  NSSEC$age[(348*(19+i) + 1):(348*(19+i+1))] <- i + 8
}

NSSEC <- aggregate(NSSEC[,3:11], by = list(NSSEC$LAD11NM,NSSEC$LAD11CD,NSSEC$sex,NSSEC$age), FUN = sum)
colnames(NSSEC)[1:4] <- c("LAD11NM","LAD11CD","sex","age")

write.table(NSSEC,paste(outputFolder,"nssec.csv",sep = ""),row.names = F, sep = ",")


####################
##### TUS data #####
####################

indivTUS <- read.table("Data/uktus15_individual.tab", sep="\t", header=TRUE)

indivTUSO <- indivTUS

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

write.table(indivTUS,paste(outputFolder,"indivTUS.csv",sep = ""),row.names = F, sep = ",")

###

###

TUS <- read.table("Data/uktus15_dv_time_vars.tab", sep="\t", header=TRUE)

TUS <- data.frame(id_TUS_hh = TUS$serial, id_TUS_p = TUS$pnum, weekday = TUS$DiaryDay_Act, dayType = TUS$KindOfDay,
                  dml1_1 = TUS$dml1_1, dml3_910 = TUS$dml3_910, dml1_2 = TUS$dml1_2, dml3_921 = TUS$dml3_921, dml1_0 = TUS$dml1_0,
                  dml1_3 = TUS$dml1_3, dml1_7 = TUS$dml1_7, dml1_8 = TUS$dml1_8, dml3_361 = TUS$dml3_361, dml3_362 = TUS$dml3_362,
                  dml3_363 = TUS$dml3_363, dml1_4 = TUS$dml1_4, dml1_5 = TUS$dml1_5, dml1_6 = TUS$dml1_6, dml3_923 = TUS$dml3_923,
                  dml1_9a = TUS$dml1_9a)
TUS$weekday <- sapply(TUS$weekday, changeWeekDay)
TUS$uniqueID <- paste(TUS$id_TUS_hh,TUS$id_TUS_p,TUS$weekday,sep = "_")
TUS <- TUS[!duplicated(TUS$uniqueID),]

TUSlong <- read.table("Data/uktus15_diary_ep_long.tab", sep="\t", header=TRUE)
TUSlong$weekday <- sapply(TUSlong$DiaryDay_Act, changeWeekDay)
TUSlong$uniqueID <- paste(TUSlong$serial,TUSlong$pnum,TUSlong$weekday,sep = "_")

TUSlong <- TUSlong[,c(52,33,34,38)]

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

test2 <- sapply(TUS$uniqueID,extractProp)

#createTIMESPENT <- function(x){
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
} # Failed attempt at guessing where people work (home / not home)

other <- test2

createTIMESPENT <- function(x){
  a <- TUS$dml1_1[x]
  b <- TUS$dml3_921[x]
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
  a11 <- 0
  a12 <- a
  if(!is.na(other[7,x])){
    a11 <- a * as.numeric(other[7,x])
    a12 <- a * (1 - as.numeric(other[7,x]))
  }
  res <- round(c(a11,c1+c2+c3+c4,a12,b,d,e1+e2,f1+f2+f3,g,h) / (24 * 60),5)
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
TUS$pmcylce <- test[14,]
TUS$pmprivate <- test[15,]
TUS$pmpublic <- test[16,]
TUS$pmunknown <- test[17,]

TUS <- TUS[,c(21,3:4,22:38)]

write.table(TUS,paste("Outputs/","diariesRef.csv",sep = ""),row.names = F, sep = ",")


###







TUStemp <- data.frame(id_TUS_hh = TUS$serial, id_TUS_p = TUS$pnum, weekday = TUS$DiaryDay_Act)
TUStemp$weekday <- sapply(TUStemp$weekday, changeWeekDay)

indivTUSOtemp <- data.frame(id_TUS_hh = indivTUSO$serial, id_TUS_p = indivTUSO$pnum,
                            sex =indivTUSO$DMSex, age = indivTUSO$DVAge, age35g = NA, nssec8 = indivTUSO$dnssec8)

indivTUSOtemp$age35g <- sapply(indivTUSOtemp$age, transformAge)
indivTUSOtemp$nssec8[which(indivTUSOtemp$nssec8 < 0)] <- -1

diaryRef <- merge(TUStemp, indivTUSOtemp, all.x = T)

diaryRef$uniqueID <- paste(diaryRef$id_TUS_hh,diaryRef$id_TUS_p,diaryRef$weekday,sep = "_")
diaryRef <- diaryRef[!duplicated(diaryRef$uniqueID),]

diaryRefWD <- diaryRef[which(diaryRef$weekday == 1),]
diaryRefWE <- diaryRef[which(diaryRef$weekday == 0),]

merge(TUStemp)

colnames(TUS)

test <- TUS[,31:367]

test2 <- rowSums(test)

min(test2)

24*60


changeWeekDay <- function(day){
  if(day == 1 | day == 7){
    res <- 0
  }else{
    res <- 1
  }
}

TUS$weekday <- sapply(TUS$weekday, changeWeekDay)

table(TUS$IndOut)



plot(indivTUS$age35g,indivTUS$nssec8)
 
createsic1d(-8)

#strata
#age group
#sic1d

# check other variables

# prepare diaries



unique(indivTUS$sic2d2007)













range(indivTUS$FtPtWk)
range(indivTUS$dagegrp, na.rm = T)

unique(indivTUS$SIC2007)

indivTUS$nssec

TUS <- data.frame(id_TUS = TUS)


a <- sort(unique(TUS$serial, decreasing = T))
b <- sort(unique(inputTUS$serial, decreasing = T))

which(!(a %in% b))
which((a %in% b))

temp <- read.csv("/Users/hsalat/Downloads/censusbits.csv")
table(temp$DC2101EW_C_ETHPUK11)

temp <- read.csv("/Users/hsalat/Downloads/censusbits.csv")
table(temp$DC2101EW_C_ETHPUK11)


temp <- read.csv("/Users/hsalat/microsimulation/data/ssm_E09000001_MSOA11_ppp_2011.csv")
table(temp$DC2101EW_C_ETHPUK11)

temp2 <- read.csv("/Users/hsalat/microsimulation/data/ssm_E09000002_MSOA11_ppp_2011.csv")
table(temp2$DC2101EW_C_ETHPUK11)

temp <- read.csv("/Users/hsalat/microsimulation/data/ssm_hh_E09000001_OA11_2011.csv")
table(temp$DC2101EW_C_ETHPUK11)

temp <- read.csv("/Users/hsalat/microsimulation/data/ass_E09000002_MSOA11_2020.csv")
table(temp$DC2101EW_C_ETHPUK11)

temp2 <- read.csv("/Users/hsalat/microsimulation/data/ssm_E09000002_MSOA11_ppp_2011.csv")
table(temp2$DC2101EW_C_ETHPUK11)

temp3 <- read.csv("/Users/hsalat/microsimulation/data/ssm_E09000002_MSOA11_ppp_2020.csv")
table(temp3$DC2101EW_C_ETHPUK11)

ass_E09000002_MSOA11_2020.csv


temp <- read.csv("/Users/hsalat/Downloads/PSM/PSM_Manchester_Share/ass_E08000003_MSOA11_2020.csv")
table(temp$DC2101EW_C_ETHPUK11)



