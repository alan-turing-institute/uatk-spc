
county <- "east-yorkshire-with-hull"
date <- 2020

###### !!!!!! TEST ONLY
lads <- "E09000002"
luInd <- which(lu$LAD20CD == lads)
msoas <- lu$MSOA11CD[luInd]


###### Pre-requisites

source("SPC_functions.R")
source("BMIStuff.R")
source("IncomeStuff.R")
source("EventsStuff.R")

library(stringr)
library(rgdal)
library(tidyverse)

set.seed(12345)

inputFolder <- "Data/prepData/"
spenserFolder <- "Data/SPENSER/"

# Source Data

inputHS <- read.table(paste(inputFolder,"HSComplete.csv",sep = ""), sep=",", header=TRUE)
inputTUS

lu <- read.csv(paste(inputFolder,"lookUp.csv",sep = ""))


###### Retrieve MSAOAs, Countries, etc.

luInd <- which(lu$NewTU == county)
msoas <- lu$MSOA11CD[luInd]
country <- unique(lu$Country[luInd])
country2 = country
nCountry <- length(country)

if(nCountry < 1 | nCountry > 3){
  stop("Area not in bounds")
}

lads <- unique(lu$LAD20CD[luInd])


###### Load and glue SPENSER

merge <- NULL
for(i in 1:length(lads)){
  pop <- read.csv(paste(spenserFolder,"ass_",lads[i],"_MSOA11_",date,".csv",sep = ""))
  house <- read.csv(paste(spenserFolder,"ass_hh_",lads[i],"_OA11_",date,".csv",sep = ""))
  mergeNew <- merge(pop,house,by.x = "HID",by.y="HID",all.x = T)
  mergeNew <- data.frame(pid = NA, hid = mergeNew$HID,
                         MSOA11CD = mergeNew$Area.x, OA11CD = mergeNew$Area.y,
                         sex = mergeNew$DC1117EW_C_SEX, age = mergeNew$DC1117EW_C_AGE, ethnicity = mergeNew$DC2101EW_C_ETHPUK11, HOUSE_nssec8 = mergeNew$LC4605_C_NSSEC,
                         HOUSE_type = mergeNew$LC4402_C_TYPACCOM, HOUSE_typeCommunal = mergeNew$QS420_CELL, HOUSE_NRooms = mergeNew$LC4404_C_ROOMS, HOUSE_centralHeat = mergeNew$LC4402_C_CENHEATHUK11,
                         HOUSE_tenure = mergeNew$LC4402_C_TENHUK11, HOUSE_NCars = mergeNew$LC4202_C_CARSNO)
  mergeNew$HOUSE_nssec8[which(mergeNew$HOUSE_nssec8 == 9)] <- -1
  mergeNew <- mergeNew[order(mergeNew$MSOA11CD,mergeNew$hid,-mergeNew$age),]
  rownames(mergeNew) <- 1:nrow(mergeNew)
  for(j in msoas){
    ind = which(mergeNew$MSOA11CD == j)
    ref <- unique(mergeNew$hid[ind])
    newHID <- sapply(mergeNew$hid[ind], function(x){which(ref == x)})
    mergeNew$hid[ind] <- paste(j,str_pad(newHID,5,pad = "0"),sep="_")
    ref <- unname(table(newHID))
    newPID <- unlist(sapply(ref, function(x){1:x}))
    mergeNew$pid[ind] <- paste(j,str_pad(newHID,5,pad = "0"),str_pad(newPID,3,pad = "0"),sep="_")
  }
  merge <- rbind(merge,mergeNew)
}

merge$HOUSE_typeCommunal[merge$HOUSE_typeCommunal < 0] <- -1
merge$HOUSE_type <- merge$HOUSE_type - 1
merge$HOUSE_type[merge$HOUSE_type < 0] <- -1
merge$HOUSE_centralHeat <- merge$HOUSE_centralHeat - 1
merge$HOUSE_tenured <- merge$HOUSE_tenured - 1
merge$HOUSE_tenured[merge$HOUSE_tenured < 0] <- -1

# Ethnicity transform
newEth <- function(eth){
  if(eth == 2 | eth == 3 | eth ==4){
    res <- 1
  }else if(eth == 7){
    res <- 2
  }else if(eth == 6){
    res <- 3
  }else if(eth == 5){
    res <- 4
  }else if(eth == 8){
    res <- 5
  }
  return(res)
}

merge$ethnicity <- sapply(merge$ethnicity, newEth)



###### Add HSE

# transformAge <- function(a){
#   if(a == 0 | a == 1){
#     a <- 1
#   }else if(a %in% 2:4){
#     a <- 2
#   }else if(a %in% 5:7){
#     a <- 3
#   }else if(a %in% 8:10){
#     a <- 4
#   }else if(a %in% 11:12){
#     a <- 5
#   }else if(a %in% 13:15){
#     a <- 6
#   }else if(a %in% 16:19){
#     a <- 7
#   }else if(a %in% 20:24){
#     a <- 8
#   }else if(a %in% 25:29){
#     a <- 9
#   }else if(a %in% 30:34){
#     a <- 10
#   }else if(a %in% 35:39){
#     a <- 11
#   } else if(a %in% 40:44){
#     a <- 12
#   } else if(a %in% 45:49){
#     a <- 13
#   } else if(a %in% 50:54){
#     a <- 14
#   } else if(a %in% 55:59){
#     a <-15
#   } else if(a %in% 60:64){
#     a <- 16
#   } else if(a %in% 65:69){
#     a <- 17
#   } else if(a %in% 70:74){
#     a <- 18
#   } else if(a %in% 75:79){
#     a <- 19
#   } else if(a %in% 80:84){
#     a <- 20
#   } else if(a %in% 85:89){
#     a <- 21
#   }else {
#     a <- 22
#   }
#   return(a)
# }

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

merge$age35g <- sapply(merge$age, transformAge)

findHSEMatch <- function(i,merge,HS){
  age <- merge$age35g[i]
  if(age == 23){
    age <- 22
  }
  sex <- merge$sex[i]
  ind <- sample(which(HS$age35g == age & HS$sex == sex),1)
  return(c(HS$id_HS[ind],HS$diabetes[ind],HS$bloodpressure[ind],HS$cvd[ind]))
}

HS2 <- HS %>% filter(country == country2)
findHSEMatch(1,merge,HS2)

res <- sapply(1:nrow(merge), function(x){findHSEMatch(x,merge,HS2)})
res <- t(res)

merge$id_HS <- res[,1]
merge$diabetes <- res[,2]
merge$bloodpressure <- res[,3]
merge$cvd <- res[,4]

###### Add BMI

# England
merge$bmi <- sapply(1:nrow(merge), function(x){applyBMI(x,merge,dMean,varData)})
merge$bmi[which(merge$bmi < minBMI)] <- minBMI


###### Add TUS

# Personal nssec

# !!!!!! NEED to ESTABLISH CORRESPONDENCE WITH LAD2020

refHID <- unique(merge$hid)

length(refHID)

NSSEC <- read.table(paste(inputFolder,"nssec.csv",sep = ""), sep=",", header=TRUE)

merge$nssec8 <- merge$HOUSE_nssec8

merge <- merge[,c(1:6,20,7,21,8:19)]

#expand
NSSEC2 <- NSSEC[which(NSSEC$LAD11CD == lads[1]),]
row.names(NSSEC2) <- 1:nrow(NSSEC2)

for(i in refHID){
  ind <- which(merge$hid == i)
  if(length(ind) > 1){
    for(k in 2:length(ind)){
      j <- ind[k]
      age <- merge$age35g[j]
      sex <- merge$sex[j]
      if(age < 7 | age > 18){
        merge$nssec8[j] <- -1
      }else{
        ind2 <- sex + (age - 7) * 2
        weights <- NSSEC2[ind2,5:13]
        merge$nssec8[j] <- sample(c(1:8,-1), 1, prob = weights)
      }
    }
  }
  print(i)
}

findTUSMatch <- function(i,merge,indivTUS){
  age <- merge$age35g[i]
  sex <- merge$sex[i]
  nssec <- merge$nssec8[i]
  base <- which(indivTUS$age35g == age & indivTUS$sex == sex & indivTUS$nssec8 == nssec)
  if(length(base) < 1){
    base <- which(indivTUS$age35g == age & indivTUS$sex == sex)
  }
  ind <- sample(base,1)
  return(c(indivTUS$id_TUS[ind],indivTUS$pnum[ind],indivTUS$pwkstat[ind],indivTUS$soc2010[ind],indivTUS$sic1d2007[ind],
           indivTUS$sic2d2007[ind],indivTUS$netPayWeekly[ind],indivTUS$workedHoursWeekly[ind]))
}

res <- sapply(1:nrow(merge), function(x){findTUSMatch(x,merge,indivTUS)})
res <- t(res)

merge$id_TUS_hh <- res[,1]
merge$id_TUS_p <- res[,2]
merge$pwkstat <- as.numeric(res[,3])
merge$soc2010 <- as.numeric(res[,4])
merge$sic1d2007 <- res[,5]
merge$sic2d2007 <- as.numeric(res[,6])
merge$netPayWeekly<- as.numeric(res[,7])
merge$workedHoursWeekly <- as.numeric(res[,8])


###### Add Income

#ft <- mean(indivTUS$workedHoursWeekly[indivTUS$workedHoursWeekly > 0 & indivTUS$pwkstat == 1])
#pt <- mean(indivTUS$workedHoursWeekly[indivTUS$workedHoursWeekly > 0 & indivTUS$pwkstat == 2])

merge <- addToData2(merge,"London",coefFFT,coefFPT,coefMFT,coefMPT)


###### Add Proba events

merge <- addSport(merge)
merge <- addConcert(merge)
merge <- addMuseum(merge)


###### Add Coordinates

OACoords <- read.csv("data/Output_Areas_(December_2011)_Population_Weighted_Centroids.csv")

ukgrid = "+init=epsg:27700"
latlong = "+init=epsg:4326"

coords <- cbind(Easting = as.numeric(as.character(OACoords$X)), Northing = as.numeric(as.character(OACoords$Y)))
coords_SP <- SpatialPointsDataFrame(coords, data = data.frame(OACoords$OA11CD,OACoords$OBJECTID), proj4string = CRS("+init=epsg:27700"))

coords2 <- spTransform(coords_SP, CRS(latlong))
coords2 <- coords2@coords

OACoordsF <- data.frame(OA11CD = OACoords$OA11CD, easting = OACoords$X, northing = OACoords$Y, lng = coords2[,1], lat = coords2[,2])

mergeSave <- merge
merge <- merge(merge,OACoordsF,by.x = "OA11CD",by.y = "OA11CD")
merge <- merge[,c(2:4,1,5:44)]



###### Final steps

merge <- merge[order(merge$pid),c(1:6,8:44)]
row.names(merge) <- 1:nrow(merge)

write.table(merge,paste("Outputs/",lads[1],".csv",sep=""),sep = ",",row.names = F)
