# Add unique national household identifier
addIdH <- function(msoa,dataM,dataH){
  ind = which(dataM == msoa)
  ref <- unique(dataH[ind])
  idh <- paste(dataM[ind],str_pad(sapply(dataH[ind], function(x){which(ref == x)}),4,pad = "0"), sep = "_")
  return(idh)
}

# Add unique national person identifier
addIdP <- function(idh){
  ref <- unname(table(idh))
  idp <- paste(idh,str_pad(unlist(sapply(ref, function(x){1:x})),3,pad = "0"), sep = "_")
  return(idp)
}

# Transform ethnicity
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

# Create age35g age groups
createAge35g <- function(a){
  ifelse(a > 99, 23,
         ifelse(a > 19, 8 + floor( (a - 20) / 5),
                ifelse(a == 0 | a == 1, 1,
                       ifelse(a > 1 & a < 11, 2 + floor((a - 2) / 3),
                              ifelse(a == 11 | a == 12, 5,
                                     ifelse(a > 12 & a < 16, 6, 7))))))
}

# Match with HSE

findHSEMatch <- function(i,sex,age35g,HS){
  age <- age35g[i]
  if(age == 23){
    age <- 22
  }
  ind <- sample(which(HS$age35g == age & HS$sex == sex[i]),1)
  return(ind)
}

### Estimate BMI

# Fit an order 3 polynomial to a vector from 4 coefficients
fitted3 <- function(x,a0,a1,a2,a3){
  coef <- c(a0,a1,a2,a3)
  coef[is.na(coef)] <- 0
  res <- sapply(x,function(y){coef[1]+coef[2]*y+coef[3]*y*y+coef[4]*y*y*y})
  return(unname(res))
}

# Find BMI depending on age, sex and ethnicity
findBMI <- function(age,sex,origin,dMean,varData){
  if(age < 16){
    # Return NA and do not calculate further
    return(NA)
  }else{
    if(sex == 2){
      coef <- coefF[createAge35g(age)]
      if(origin == 1){
        m <- fitted3(age,dMean$F1[1],dMean$F1[2],dMean$F1[3],dMean$F1[4])
        v <- varData[5]
      }else if(origin == 2){
        m <- fitted3(age,dMean$F2[1],dMean$F2[2],dMean$F2[3],dMean$F2[4])
        v <- varData[6]
      }else if(origin == 3){
        m <- fitted3(age,dMean$F3[1],dMean$F3[2],dMean$F3[3],dMean$F3[4])
        v <- varData[7]
      }else if(origin == 4 | origin == 5){
        m <- fitted3(age,dMean$F4[1],dMean$F4[2],dMean$F4[3],dMean$F4[4])
        v <- varData[8]
      }
    }else {
      coef <- coefM[createAge35g(age)]
      if(origin == 1){
        m <- fitted3(age,dMean$M1[1],dMean$M1[2],dMean$M1[3],dMean$M1[4])
        v <- varData[1]
      }else if(origin == 2){
        m <- fitted3(age,dMean$M2[1],dMean$M2[2],dMean$M2[3],dMean$M2[4])
        v <- varData[2]
      }else if(origin == 3){
        m <- fitted3(age,dMean$M3[1],dMean$M3[2],dMean$M3[3],dMean$M3[4])
        v <- varData[3]
      }else if(origin == 4 | origin == 5){
        m <- fitted3(age,dMean$M4[1],dMean$M4[2],dMean$M4[3],dMean$M4[4])
        v <- varData[4]
      }
    }
    res <- rgamma(1,m*m/v,m/v) # The gamma fit is scaled so that the mean is equal to the expected mean for that ethnicity, sex and age according to the global distribution and variance for ethnicity and sex only
  }
  return(res * coef)
}

# Run over dataset
applyBMI <- function(i,inputData,dMean,varData){
  age <- inputData$age[i]
  sex <- inputData$sex[i]
  origin <- inputData$ethnicity[i]
  return(findBMI(age,sex,origin,dMean,varData))
}

# Fill new NSSEC8
assignNSSEC_EW <- function(msoa,merge){
  indMSOA <- which(merge$MSOA11CD == msoa)
  indRefP <- intersect(indMSOA,which(!duplicated(merge$hid)))
  indNotRefP <- intersect(indMSOA,which(duplicated(merge$hid)))
  
  indM16to24 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 15 & merge$age < 25))
  probM16to24 <- NSSECM_16to24[NSSECM_16to24$MSOA11CD == msoa,2:10]
  indM25to34 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 24 & merge$age < 35))
  probM25to34 <- NSSECM_25to34[NSSECM_25to34$MSOA11CD == msoa,2:10]
  indM35to49 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 34 & merge$age < 50))
  probM35to49 <- NSSECM_35to49[NSSECM_35to49$MSOA11CD == msoa,2:10]
  indM50to64 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 49 & merge$age < 65))
  probM50to64 <- NSSECM_50to64[NSSECM_50to64$MSOA11CD == msoa,2:10]
  indM65to74 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 64 & merge$age < 75))
  probM65to74 <- NSSECM_65to74[NSSECM_65to74$MSOA11CD == msoa,2:10]
  indF16to24 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 15 & merge$age < 25))
  probF16to24 <- NSSECF_16to24[NSSECF_16to24$MSOA11CD == msoa,2:10]
  indF25to34 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 24 & merge$age < 35))
  probF25to34 <- NSSECF_25to34[NSSECF_25to34$MSOA11CD == msoa,2:10]
  indF35to49 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 34 & merge$age < 50))
  probF35to49 <- NSSECF_35to49[NSSECF_35to49$MSOA11CD == msoa,2:10]
  indF50to64 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 49 & merge$age < 65))
  probF50to64 <- NSSECF_50to64[NSSECF_50to64$MSOA11CD == msoa,2:10]
  indF65to74 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 64 & merge$age < 75))
  probF65to74 <- NSSECF_65to74[NSSECF_65to74$MSOA11CD == msoa,2:10]
  
  merge$nssec8[indRefP] <- merge$HOUSE_nssec8[indRefP]
  
  merge$nssec8[indM16to24] <- sample(nssecRef,length(indM16to24), prob = probM16to24, replace = T)
  merge$nssec8[indM25to34] <- sample(nssecRef,length(indM25to34), prob = probM25to34, replace = T)
  merge$nssec8[indM35to49] <- sample(nssecRef,length(indM35to49), prob = probM35to49, replace = T)
  merge$nssec8[indM50to64] <- sample(nssecRef,length(indM50to64), prob = probM50to64, replace = T)
  merge$nssec8[indM65to74] <- sample(nssecRef,length(indM65to74), prob = probM65to74, replace = T)
  merge$nssec8[indF16to24] <- sample(nssecRef,length(indF16to24), prob = probF16to24, replace = T)
  merge$nssec8[indF25to34] <- sample(nssecRef,length(indF25to34), prob = probF25to34, replace = T)
  merge$nssec8[indF35to49] <- sample(nssecRef,length(indF35to49), prob = probF35to49, replace = T)
  merge$nssec8[indF50to64] <- sample(nssecRef,length(indF50to64), prob = probF50to64, replace = T)
  merge$nssec8[indF65to74] <- sample(nssecRef,length(indF65to74), prob = probF65to74, replace = T)
  
  return(merge)
}
assignNSSEC_S <- function(eth,merge){
  indETH <- which(merge$ethnicity == eth)
  indRefP <- intersect(indETH,which(!duplicated(merge$hid)))
  indNotRefP <- intersect(indETH,which(duplicated(merge$hid)))
  
  indM16to24 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 15 & merge$age < 25))
  probM16to24 <- NSSECS[NSSECS$age == 1 & NSSECS$sex == 1, eth + 3]
  indM25to49 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 24 & merge$age < 50))
  probM25to49 <- NSSECS[NSSECS$age == 2 & NSSECS$sex == 1, eth + 3]
  indM50to64 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 49 & merge$age < 65))
  probM50to64 <- NSSECS[NSSECS$age == 3 & NSSECS$sex == 1, eth + 3]
  indM65to74 <- intersect(indNotRefP,which(merge$sex == 1 & merge$age > 64 & merge$age < 75))
  probM65to74 <- NSSECS[NSSECS$age == 4 & NSSECS$sex == 1, eth + 3]
  
  indF16to24 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 15 & merge$age < 25))
  probF16to24 <- NSSECS[NSSECS$age == 1 & NSSECS$sex == 2, eth + 3]
  indF25to49 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 24 & merge$age < 50))
  probF25to49 <- NSSECS[NSSECS$age == 2 & NSSECS$sex == 2, eth + 3]
  indF50to64 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 49 & merge$age < 65))
  probF50to64 <- NSSECS[NSSECS$age == 3 & NSSECS$sex == 2, eth + 3]
  indF65to74 <- intersect(indNotRefP,which(merge$sex == 2 & merge$age > 64 & merge$age < 75))
  probF65to74 <- NSSECS[NSSECS$age == 4 & NSSECS$sex == 2, eth + 3]
  
  merge$nssec8[indRefP] <- merge$HOUSE_nssec8[indRefP]
  
  merge$nssec8[indM16to24] <- sample(nssecRef,length(indM16to24), prob = probM16to24, replace = T)
  merge$nssec8[indM25to49] <- sample(nssecRef,length(indM25to49), prob = probM25to49, replace = T)
  merge$nssec8[indM50to64] <- sample(nssecRef,length(indM50to64), prob = probM50to64, replace = T)
  merge$nssec8[indM65to74] <- sample(nssecRef,length(indM65to74), prob = probM65to74, replace = T)
  merge$nssec8[indF16to24] <- sample(nssecRef,length(indF16to24), prob = probF16to24, replace = T)
  merge$nssec8[indF25to49] <- sample(nssecRef,length(indF25to49), prob = probF25to49, replace = T)
  merge$nssec8[indF50to64] <- sample(nssecRef,length(indF50to64), prob = probF50to64, replace = T)
  merge$nssec8[indF65to74] <- sample(nssecRef,length(indF65to74), prob = probF65to74, replace = T)
  
  return(merge)
}

# Match with TUS
findTUSMatch <- function(i,merge,indivTUS){
  age <- age35g[i]
  sex <- merge$sex[i]
  nssec <- merge$nssec8[i]
  if(nssec == 9){
    base <- which(indivTUS$age35g == age & indivTUS$sex == sex & indivTUS$pwkstat == 8)
    if(length(base) < 1){
      base <- which(indivTUS$age35g == age & indivTUS$sex == sex)
    }
    ind <- sample(base,1)
  }else {
    base <- which(indivTUS$age35g == age & indivTUS$sex == sex & indivTUS$nssec8 == nssec)
    if(length(base) < 1){
      base <- which(indivTUS$age35g == age & indivTUS$sex == sex)
    }
    ind <- sample(base,1)
  }
  return(ind)
}

### Income

drawTime <- function(soc,sex,fulltime,region){
  perc <- floor(runif(1,1,100))
  if(sex == 2 & fulltime == T){
    base <- distribHoursFFT[perc + 1]
    coef <- meanHoursFFT$mean[which(meanHoursFFT$soc == soc & meanHoursFFT$region == region)] / distribHoursFFT[1]
    res <- base * coef
  } else if(sex == 2 & fulltime == F){
    base <- distribHoursFPT[perc + 1]
    coef <- meanHoursFPT$mean[which(meanHoursFPT$soc == soc & meanHoursFPT$region == region)] / distribHoursFPT[1]
    res <- base * coef
  } else if(sex == 1 & fulltime == T){
    base <- distribHoursMFT[perc + 1]
    coef <- meanHoursMFT$mean[which(meanHoursMFT$soc == soc & meanHoursMFT$region == region)] / distribHoursMFT[1]
    res <- base * coef
  } else if(sex == 1 & fulltime == F){
    base <- distribHoursMPT[perc + 1]
    coef <- meanHoursMPT$mean[which(meanHoursMPT$soc == soc & meanHoursMPT$region == region)] / distribHoursMPT[1]
    res <- base * coef
  }
  return(res)
}
drawIncome2 <- function(soc,sex,age,fulltime,coefFFTR,coefFPTR,coefMFTR,coefMPTR){
  perc <- floor(runif(1,1,100))
  if(sex == 2 & fulltime == T){
    age2 <- min(max(1,age - 15),71)
    perc <- ageRescaleFFT[perc,age2]
    coefs <- as.numeric(coefFFTR[coefFFTR$soc == soc,3:8])
  } else if(sex == 2 & fulltime == F){
    age2 <- min(max(1,age - 15),71)
    perc <- ageRescaleFPT[perc,age2]
    coefs <- as.numeric(coefFPTR[coefFPTR$soc == soc,3:8])
  } else if(sex == 1 & fulltime == T){
    age2 <- min(max(1,age - 15),71)
    perc <- ageRescaleMFT[perc,age2]
    coefs <- as.numeric(coefMFTR[coefMFTR$soc == soc,3:8])
  } else if(sex == 1 & fulltime == F){
    age2 <- min(max(1,age - 15),71)
    perc <- ageRescaleMPT[perc,age2]
    coefs <- as.numeric(coefMPTR[coefMPTR$soc == soc,3:8])
  }
  if(perc >= coefs[6]){
    inc <- coefs[5]
  } else {
    inc <- coefs[1] + coefs[2]*perc + coefs[3]*perc*perc + coefs[4]*perc*perc*perc
  }
  if(age < 18 & inc < 4.55){
    inc <- 4.55
  } else if(age < 21 & inc < 6.45){
    inc <- 6.45
  } else if(age < 24 & inc < 8.2){
    inc <- 8.2
  } else if(inc < 8.72){
    inc <- 8.72
  }
  return(inc)
}
fillIncome2 <- function(idx,data,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,region){
  pwkst <- pwkstat[idx]
  soc <- data$soc2010[idx]
  sex <- data$sex[idx]
  age <- data$age[idx]
  incomeH <- NA
  incomeHAsIf <- NA
  incomeY <- NA
  incomeYAsIf <- NA
  if(soc > 0){
    if(pwkst == 1){
      time <- data$workedHoursWeekly[idx]*52
      time2 <- 0
      if(time <= 0){
        time <- NA
        time2 <- drawTime(soc,sex,T,region)*52
      }
      inc <- drawIncome2(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * (time + time2)
    } else if(pwkst == 2){
      time <- data$workedHoursWeekly[idx]*52
      time2 <- 0
      if(time <= 0){
        time <- NA
        time2 <- drawTime(soc,sex,F,region)*52
      }
      inc <- drawIncome2(soc,sex,age,F,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * (time + time2)
    } else if(pwkst == 3 | pwkst == 4){
      time <- data$workedHoursWeekly[idx]*52
      time2 <- 0
      if(time <= 0){
        time <- 0
        time2 <- drawTime(soc,sex,T,region)*52
      }
      inc <- drawIncome2(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeHAsIf <- inc
      incomeYAsIf <- inc * (time + time2)
    }
  }
  return(cbind(incomeH,incomeY,incomeHAsIf,incomeYAsIf))
}
addToData2 <- function(data,region,coefFFT,coefFPT,coefMFT,coefMPT){
  old <- data
  pwkstat <- data$pwkstat
  coefFFTR <- coefFFT[which(coefFFT$region == region),]
  coefFPTR <- coefFPT[which(coefFFT$region == region),]
  coefMFTR <- coefMFT[which(coefFFT$region == region),]
  coefMPTR <- coefMPT[which(coefFFT$region == region),]
  incs <- mcmapply(function(x){fillIncome2(x,old,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,region)}, 1:nrow(old), mc.cores = detectCores(), mc.set.seed = FALSE)
  old$incomeH <- incs[1,]
  old$incomeY <- incs[2,]
  old$incomeHAsIf <- incs[3,]
  old$incomeYAsIf <- incs[4,]
  return(old)
}

### Events

# Sport
addSport <- function(data){
  data$ESport <- sapply(data$age,subSport1)
  data$ERugby <- data$ESport * sapply(data$sex,subSport2) * sapply(data$nssec8,subSport3)
  return(data)
}
subSport1 <- function(age){
  if(age < 16){
    res <- 0.257
  } else if(age < 25){
    res <- 0.257
  } else if(age < 35){
    res <- 0.233
  } else if(age < 45){
    res <- 0.255
  } else if(age < 55){
    res <- 0.279
  } else if(age < 65){
    res <- 0.268
  } else if(age < 75){
    res <- 0.239
  } else if(age < 85){
    res <- 0.188
  } else {
    res <- 0.090
  }
  return(res)
}
# Prob of <16 set to <25 bc dealing with households is too complicated
subSport2 <- function(sex){
  res <- 0.63
  if(sex == 2){
    res <- 0.37
  }
  return(res)
}
subSport3 <- function(nssec8){
  res <- 1
  if(nssec8 %in% 1:3){
    res <- 2
  }
  return(res)
}

# Concerts
addConcert <- function(data){
  data$EConcertF <- sapply(data$age,subConcert1)*sapply(data$sex,subConcert3)
  data$EConcertM <- sapply(data$age,subConcert1)*(100 - sapply(data$sex,subConcert3))
  data$EConcertFS <- sapply(data$age,subConcert2)*sapply(data$sex,subConcert3)
  data$EConcertMS <- sapply(data$age,subConcert2)*(100 - sapply(data$sex,subConcert3))
  return(data)
}
subConcert1 <- function(age){
  res <- dnorm(age, 23.70431, 5.192425)
  return(res)
}
subConcert2 <- function(age){
  res <- dnorm(age, 45.44389, 10.10664)
  return(res)
}
subConcert3 <- function(sex){
  res <- 30
  if(sex == 2){
    res <- 70
  }
  return(res)
}

# Museums
addMuseum <- function(data){
  #data$ETankMuseum <- sapply(data$origin,subMuseum2)*sapply(data$nssec5,subMuseum3)
  data$EMuseum <- sapply(data$age,subMuseum1)*sapply(data$ethnicity,subMuseum2)*sapply(data$nssec8,subMuseum3)
  return(data)
}
subMuseum1 <- function(age){
  if(age < 16){
    res <- 0.45
  } else if(age < 25){
    res <- 0.45
  } else if(age < 45){
    res <- 0.54
  } else if(age < 65){
    res <- 0.55
  } else if(age < 75){
    res <- 0.54
  } else {
    res <- 0.36
  }
  return(res)
}
# Prob of <16 set to <25 bc dealing with households is too complicated
subMuseum2 <- function(origin){
  if(origin == 1){
    res <- 0.53
  } else if(origin == 4){
    res <- 0.63
  } else if(origin == 3){
    res <- 0.46
  } else if(origin == 2){
    res <- 0.28
  } else {
    res <- 0.42
  }
  return(res)
}
subMuseum3 <- function(nssec8){
  res<- 0.45
  if(nssec8 %in% 1:7){
    res <- 0.55
  }
  return(res)
}

# Religion
addReligion <- function(data){
  data$EReligion1 <- 0
  data$EReligion2 <- 0
  for(i in 1:nrow(data)){
    a = runif(1)
    if(a <= 0.38){
      data$EReligion1 <- 1
    }else if(a <= 0.43){
      data$EReligion2 <- 1
    }
  }
}





