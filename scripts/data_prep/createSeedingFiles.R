library(dplyr)
library(janitor)
library(readr)
library(tidyr)
library(reshape2)

### REQUIRED: Weekly cases by specimen date at MSOA level from https://coronavirus.data.gov.uk/details/download
### REQUIRED: Infection Survey from: https://www.ons.gov.uk/surveys/informationforhouseholdsandindividuals/householdandindividualsurveys/covid19infectionsurvey

##### Reported COVID-19 cases at MSOA level (05/03/20 to 22/04/21)

test <- read.csv("data/data_2021-04-27.csv") # <--- Weekly cases by specimen date at MSOA level
# a <- sum(test$newCasesBySpecimenDateRollingSum)/(max(as.numeric(as.Date(test$date))) - min(as.numeric(as.Date(test$date))) + 1)


##### Estimated true case counts (04/05/20 to 13/04/2021)

posEstim <- read.csv("data/covid19infectionsurveydatasets20210430eng1.csv",skip = 4) # <--- Infection survey
posEstim <- posEstim[1:53,1:7]
posEstim$Ndays <- 14
posEstim$Ndays[12:53] <- 7
colnames(posEstim) <- c("From","popPCCovid","Conf95PCLow","Conf95PCHigh","popCountCovid","Conf95CountLow","Conf95CountHigh","Ndays")
posEstim <- posEstim[-c(1,2,12),c(1,8,2:7)]
row.names(posEstim) <- 1:nrow(posEstim)
posEstim$From <- as.Date(c("2020-04-27","2020-05-04","2020-05-11","2020-05-17","2020-05-25","2020-05-31","2020-06-08","2020-06-14",
                   "2020-06-22","2020-07-06","2020-07-20","2020-07-20","2020-07-27","2020-08-03","2020-08-07","2020-08-14",
                   "2020-08-19","2020-08-30","2020-09-04","2020-09-13","2020-09-18","2020-09-25","2020-10-02","2020-10-10",
                   "2020-10-17","2020-10-25","2020-10-31","2020-11-08","2020-11-15","2020-11-22","2020-11-29","2020-12-06",
                   "2020-12-12","2020-12-17","2020-12-27","2021-01-03","2021-01-10","2021-01-17","2021-01-24","2021-01-31",
                   "2021-02-06","2021-02-13","2021-02-21","2021-02-28","2021-03-07","2021-03-14","2021-03-21","2021-03-28",
                   "2021-04-04","2021-04-10"))
posEstim$popPCCovid <- as.numeric(gsub("%","",posEstim$popPCCovid))
posEstim$Conf95PCLow <- as.numeric(gsub("%","",posEstim$Conf95PCLow))
posEstim$Conf95PCHigh <- as.numeric(gsub("%","",posEstim$Conf95PCHigh))
posEstim$popCountCovid <- as.numeric(gsub(",","",posEstim$popCountCovid))
posEstim$Conf95CountLow <- as.numeric(gsub(",","",posEstim$Conf95CountLow))
posEstim$Conf95CountHigh <- as.numeric(gsub(",","",posEstim$Conf95CountHigh))

# from overlapping weeks to daily 
x <- (as.numeric(posEstim$From) - min(as.numeric(posEstim$From)))+3
x[1:length(which(posEstim$Ndays == 14))] <- x[1:length(which(posEstim$Ndays == 14))] + 4

ref <- 1:351
for(i in 1:(length(x)-1)){
  for(j in x[i]:x[i+1]){
    ref[j] <- (posEstim$popCountCovid[i+1]-posEstim$popCountCovid[i])/(x[i+1]-x[i])*(j - x[i]) + posEstim$popCountCovid[i]
  }
}

curve <- data.frame(day = as.Date(7:351,format = "%Y-%m-%d",origin = "2020-04-27"),case = ref[7:351])

#plot(curve$day,curve$case)
# b <- sum(ref)/(351 - 7 + 1)
# b/a

# Placeholder reported case counts from 05/03/20 to 03/05/20
refD <- as.Date(seq(0,59,by=7),format = "%Y-%m-%d",origin = "2020-03-05")

y <- 1:length(refD)
for(i in 1:length(refD)){
  y[i] <- sum(test$newCasesBySpecimenDateRollingSum[which(test$date == as.character(refD[i]))])/7
}

x2 <- (as.numeric(refD) - min(as.numeric(refD)))

as.Date(x2,format = "%Y-%m-%d",origin = "2020-03-05")

z <- 1:length(refD)
for(i in 1:(length(y)-1)){
  for(j in x2[i]:x2[i+1]){
    z[j+1] <- (y[i+1]-y[i])/(x2[i+1]-x2[i])*(j - x2[i]) + y[i]
  }
}

for(i in 1:4){
  z[length(z)+1] <- 2*z[length(z)] - z[length(z)-1]
}

# Junction
z <- z*(curve$case[1]/z[length(z)])
z <- z[1:(length(z)-1)]

curve0 <- data.frame(day = as.Date(0:59,format = "%Y-%m-%d",origin = "2020-03-05"), case = z)

curve <- rbind(curve0,curve)
curve$case <- round(curve$case)

# plot(curve$day,curve$case)

write.table(curve,"output/nationalInfected.csv",row.names = F,sep=",")


##### Cases per MSOA per day

M <- matrix(0,nrow = length(unique(test$areaCode))+1, ncol = nrow(curve))
colnames(M) <- paste("D",0:(nrow(curve)-1),sep="")

df <- data.frame(MSOA11CD = c(sort(unique(test$areaCode)),"E02006781"))

df <- cbind(df,as.data.frame(M))
df <- df[order(df$MSOA11CD),]
rownames(df) <- 1:nrow(df)

for(i in 1:nrow(curve)){
  date <- curve$day[i]
  dateRef <- unique(test$date)[which.min(abs(as.numeric(as.Date(unique(test$date)))-as.numeric(date)))]
  refRep <- which(test$date == dateRef)
  places <- test$areaCode[refRep]
  reported <- test$newCasesBySpecimenDateRollingSum[refRep]
  for(j in 1:length(places)){
    df[which(df$MSOA11CD == places[j]),i+1] <- round(curve$case[i]/sum(reported)*reported[j])
  }
}

write.table(df,"output/england_initial_cases_MSOAs.csv",row.names = F,sep=",")
