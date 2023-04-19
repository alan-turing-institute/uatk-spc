library(parallel)

inputFolder <- "Data/income/"

# This needs to be downloaded from Azure (or can be found in raw_data/referencedata after the model is run once)
lu <- read.csv(paste(inputFolder,"lookUp.csv",sep = ""))

regions <- c("East Midlands","London","North East","North West","South East","South West","West Midlands","Yorkshire and The Humber","East")
#countyList <- unique(lookUp$NewTU)
type <- c("FFT","FPT","MFT","MPT")

xAx <- c(10,20,25,30,40,50,60,70,75,80,90)


#####################################################
#####################################################
####### 1. EXTRACT COEFS OF FITS FOR EACH SOC #######
#####################################################
#####################################################


#options(timeout=600)
#download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fregionbyoccupation4digitsoc2010ashetable15%2f2020revised/table152020revised.zip", 
#              destfile = "base.xls")
# This will only download the file as a multi-page xls file, as provided by ONS. The 'Male Full-Time', 'Male Part-Time', etc. tabs of the "Hourly pay - Gross" file
# need to be saved as individual CSVs and named as below, after making sure the 'Use 1000 Separator (,)' option is turned off.
# No other pre-processing should be necessary.

# Load and clean

loadnClean <- function(type,regions){ # <--- type = FFT for 'Female full-time', etc.
  refInc <- read.csv(paste(inputFolder,type,"Hourly.csv",sep=""),skip = 4)
  # Basic cleaning
  refInc <- refInc[,1:17]
  colnames(refInc)[c(3,5,7)] <- c("Number","Change_med","Change_mean")
  refInc[which(refInc == "x",arr.ind = T)] <- NA
  refInc[which(refInc == "",arr.ind = T)] <- NA
  refInc[which(refInc == "..",arr.ind = T)] <- NA
  refInc[which(refInc == ":",arr.ind = T)] <- NA
  # Add Region column
  refInc$Region <- NA
  for(i in regions){
    for(j in 1:nrow(refInc)){
      if(grepl(i,refInc$Description[j]) & is.na(refInc$Region[j])){
        refInc$Region[j] <- i
      }
    }
  }
  refInc<- refInc[!is.na(refInc$Region),]
  row.names(refInc) <- 1:nrow(refInc)
  # Replace NA by value of sup category in the SOC hierarchy for mean and median
  for(i in 8:17){
    refInc[,i] <- as.numeric(refInc[,i])
  }
  refInc$Mean <- as.numeric(refInc$Mean)
  refInc$Median <- as.numeric(refInc$Median)
  iter <- refInc$Code
  for(i in 1:length(iter)){
    if(is.na(refInc$Mean[i])){
      if(nchar(iter[i]) == 1){
        b <- which(nchar(iter[1:i])==9)[length(which(nchar(iter[1:i])==9))]
      } else if(nchar(iter[i]) == 2){
        a <- substr(iter[i],1,1)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else if(nchar(iter[i]) == 3){
        a <- substr(iter[i],1,2)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else {
        a <- substr(iter[i],1,3)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      }
      refInc$Mean[i] <- refInc$Mean[b]
    }
    if(is.na(refInc$Median[i])){
      if(nchar(iter[i]) == 1){
        b <- which(nchar(iter[1:i])==9)[length(which(nchar(iter[1:i])==9))]
      } else if(nchar(iter[i]) == 2){
        a <- substr(iter[i],1,1)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else if(nchar(iter[i]) == 3){
        a <- substr(iter[i],1,2)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else {
        a <- substr(iter[i],1,3)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      }
      refInc$Median[i] <- refInc$Median[b]
    }
  }
  #
  return(refInc)
}

refFFT <- loadnClean(type[1],regions)
refFPT <- loadnClean(type[2],regions)
refMFT <- loadnClean(type[3],regions)
refMPT <- loadnClean(type[4],regions)

# Gather the coefs of an order 3 polynomial fit for each SOC; add ceiling if values start to decrease

coefTable <- function(table,t){ # t = max allowed p-value for fitting
  coefs <- data.frame(region = table$Region, soc = table$Code, inter = NA, coef1 = NA, coef2 = NA, coef3 = NA, ceilingVal = NA, ceilingPerc = 101)
  xAx <- c(10,20,25,30,40,50,60,70,75,80,90)
  iter <- table$Code
  for(i in 1:length(iter)){
    y <- as.numeric(table[i,c(8:12,4,13:17)])
    fit <- lm(y ~ poly(xAx,3, raw=TRUE))
    if(is.na(lmp(fit))){
      if(nchar(iter[i]) == 1){
        b <- which(nchar(iter[1:i])==9)[length(which(nchar(iter[1:i])==9))]
      } else if(nchar(iter[i]) == 2){
        a <- substr(iter[i],1,1)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else if(nchar(iter[i]) == 3){
        a <- substr(iter[i],1,2)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else {
        a <- substr(iter[i],1,3)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      }
      coefs[i,3:7] <- coefs[b,3:7]*table$Mean[i]/table$Mean[b]
      coefs[i,8] <- coefs[b,8]
    } else if(lmp(fit) > t){
      if(nchar(iter[i]) == 1){
        b <- which(nchar(iter[1:i])==9)[length(which(nchar(iter[1:i])==9))]
      } else if(nchar(iter[i]) == 2){
        a <- substr(iter[i],1,1)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else if(nchar(iter[i]) == 3){
        a <- substr(iter[i],1,2)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else {
        a <- substr(iter[i],1,3)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      }
      coefs[i,3:7] <- coefs[b,3:7]*table$Mean[i]/table$Mean[b]
      coefs[i,8] <- coefs[b,8]
    } else {
      coefs[i,3:6] <- as.numeric(fit$coefficients[1:4])
      for(j in 1:99){
        if(fitted2(fit,j) > fitted2(fit,j+1)){
          coefs[i,7] <- fitted2(fit,j)
          coefs[i,8] <- j
          break
        }
      }
    }
  }
  return(coefs)
}

coefFFT <- coefTable(refFFT,0.01)
coefFPT <- coefTable(refFPT,0.01)
coefMFT <- coefTable(refMFT,0.01)
coefMPT <- coefTable(refMPT,0.01)


###############################################
###############################################
####### 2. ADD TO DATA (no age rescale) #######
###############################################
###############################################


# Draw income for a specific individual; apply minimum wage rules

set.seed(12345)

drawIncome <- function(soc,sex,age,fulltime,coefFFTR,coefFPTR,coefMFTR,coefMPTR){
  perc <- floor(runif(1,1,100))
  if(sex == 2 & fulltime == T){ # 0 = female, 1 = male, consistent with TUS_HSE dataset
    coefs <- as.numeric(coefFFTR[coefFFTR$soc == soc,3:8])
  } else if(sex == 2 & fulltime == F){
    coefs <- as.numeric(coefFPTR[coefFPTR$soc == soc,3:8])
  } else if(sex == 1 & fulltime == T){
    coefs <- as.numeric(coefMFTR[coefMFTR$soc == soc,3:8])
  } else if(sex == 1 & fulltime == F){
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


# Outputs four types of income (hourly, annual, self-employed as if employed)

fillIncome <- function(idx,data,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,ft,pt){
  pwkst <- pwkstat[idx]
  soc <- data$soc2010[idx]
  sex <- data$sex[idx]
  age <- data$age[idx]
  incomeH <- NA
  incomeHAsIf <- NA
  incomeY <- NA
  incomeYAsIf <- NA
  if(soc > 0){
    time <- data$workedHoursWeekly[idx]*52
    if(time < 0){
      time <- NA
    }
    if(pwkst == 1){
      inc <- drawIncome(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * time
      if(is.na(time)){
        incomeYAsIf <- inc * ft
      }
    } else if(pwkst == 2){
      inc <- drawIncome(soc,sex,age,F,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * time
      if(is.na(time)){
        incomeYAsIf <- inc * pt
      }
    } else if(pwkst == 3 | pwkst == 4){
      inc <- drawIncome(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeHAsIf <- inc
      incomeYAsIf <- inc * time
      if(is.na(time)){
        incomeYAsIf <- inc * ft
      }
    }
  }
  return(cbind(incomeH,incomeY,incomeHAsIf,incomeYAsIf))
}

# Add new columns

addToData <- function(data,region,coefFFT,coefFPT,coefMFT,coefMPT,ft,pt){
  new <- data
  pwkstat <- data$pwkstat
  coefFFTR <- coefFFT[which(coefFFT$region == region),]
  coefFPTR <- coefFPT[which(coefFFT$region == region),]
  coefMFTR <- coefMFT[which(coefFFT$region == region),]
  coefMPTR <- coefMPT[which(coefFFT$region == region),]
  incs <- mcmapply(function(x){fillIncome(x,new,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,ft,pt)}, 1:nrow(new), mc.cores = detectCores())
  new$incomeH <- incs[1,]
  new$incomeY <- incs[2,]
  new$incomeHAsIf <- incs[3,]
  new$incomeYAsIf <- incs[4,]
  return(new)
}

for(i in 1:100){
  fillIncome(i,data,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,ft,pt)
}

# Loop over all counties (for reference only, requires legacy data)

# i = countyList[1]
# temp <- addToData(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
# write.table(temp,paste("output/tus_hse_",i,".csv",sep=","))
# checkRes <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
#                        pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)
# 
# for(i in countyList[2:length(countyList)]){
#   temp <- read.csv(paste("output/tus_hse_",i,".csv",sep=""),sep = " ")
#   checkRes2 <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
#                           pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)
#   checkRes <- rbind(checkRes,checkRes2)
# }


##########################################################
##########################################################
####### 3. CHECK PREDICTED VS RAW (no age rescale) #######
##########################################################
##########################################################

# See previous analysis (createIncome.R)

ageRef <-c(16.5,19.5,25.5,34.5,44.5,54.5,63)


###################################
###################################
########  4. AGE RESCALING ########
###################################
###################################


# !!! ---> Ages above 67 are treated as 67 due to lack of data
### Requires full run over country; uploaded from previous analysis 

ageRescaleMFT <- read.csv(paste(inputFolder,"ageRescaleMFT.csv",sep=""))
ageRescaleMPT <- read.csv(paste(inputFolder,"ageRescaleMPT.csv",sep=""))
ageRescaleFFT <- read.csv(paste(inputFolder,"ageRescaleFFT.csv",sep=""))
ageRescaleFPT <- read.csv(paste(inputFolder,"ageRescaleFPT.csv",sep=""))


###################################################
###################################################
####### 5. AS IF WITH MODELLED WORKED HOURS #######
###################################################
###################################################


# Due to less data available and generally more homogeneous results, we use a simplified approach.
# The supported data is Table 15.9a   Paid hours worked - Total - For all employee jobsa: United Kingdom, 2020, processed as before.

getWorkedHoursData <- function(type){
  refHours <- read.csv(paste(inputFolder,"hours",type,".csv",sep=""),skip = 4)
  ref <- as.numeric(refHours[1,c(8:12,4,13:17)])
  fit <- lm(ref ~ xAx)
  wh <- as.numeric(c(refHours[1,6],fit$coefficients[1] + fit$coefficients[2]*1:100))
  # Basic cleaning
  refHours[which(refHours == "x",arr.ind = T)] <- NA
  refHours[which(refHours == "",arr.ind = T)] <- NA
  refHours[which(refHours == "..",arr.ind = T)] <- NA
  refHours[which(refHours == ":",arr.ind = T)] <- NA
  # Add Region column
  refHours$Region <- NA
  for(i in regions){
    for(j in 1:nrow(refHours)){
      if(grepl(i,refHours$Description[j]) & is.na(refHours$Region[j])){
        refHours$Region[j] <- i
      }
    }
  }
  refHours <- refHours[!is.na(refHours$Region),]
  row.names(refHours) <- 1:nrow(refHours)
  # Data frame of mean per region and SOC
  df <- data.frame(region = refHours$Region,soc = refHours$Code,mean = refHours$Mean)
  # Replace NA by value of sup category in the SOC hierarchy for mean
  iter <- df$soc
  for(i in 1:length(iter)){
    if(is.na(df$mean[i])){
      if(nchar(iter[i]) == 1){
        b <- which(nchar(iter[1:i])==9)[length(which(nchar(iter[1:i])==9))]
      } else if(nchar(iter[i]) == 2){
        a <- substr(iter[i],1,1)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else if(nchar(iter[i]) == 3){
        a <- substr(iter[i],1,2)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      } else {
        a <- substr(iter[i],1,3)
        b <- grep(paste("^",a,"$",sep = ""),iter[1:i])
        b <- b[length(b)]
      }
      df$mean[i] <- df$mean[b]
    }
  }
  return(list(wh,df))
}

distribHoursMFT <- getWorkedHoursData("MFT")[[1]]
distribHoursMPT <- getWorkedHoursData("MPT")[[1]]
distribHoursFFT <- getWorkedHoursData("FFT")[[1]]
distribHoursFPT <- getWorkedHoursData("FPT")[[1]]

meanHoursMFT <- getWorkedHoursData("MFT")[[2]]
meanHoursMFT$mean <- as.numeric(meanHoursMFT$mean)
meanHoursMPT <- getWorkedHoursData("MPT")[[2]]
meanHoursMPT$mean <- as.numeric(meanHoursMPT$mean)
meanHoursFFT <- getWorkedHoursData("FFT")[[2]]
meanHoursFFT$mean <- as.numeric(meanHoursFFT$mean)
meanHoursFPT <- getWorkedHoursData("FPT")[[2]]
meanHoursFPT$mean <- as.numeric(meanHoursFPT$mean)

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


##########################################################################
##########################################################################
####### 6. ADD TO DATA (with age rescaling and as if worked hours) #######
##########################################################################
##########################################################################

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
  incs <- mcmapply(function(x){fillIncome2(x,old,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR,region)}, 1:nrow(old), mc.cores = detectCores())
  old$incomeH <- incs[1,]
  old$incomeY <- incs[2,]
  old$incomeHAsIf <- incs[3,]
  old$incomeYAsIf <- incs[4,]
  return(old)
}


#####################################################################################
#####################################################################################
####### 7. CHECK PREDICTED VS RAW (with age rescaling and as if worked hours) #######
#####################################################################################
#####################################################################################


# checkResOld <- checkResF
checkRes$pwkstat <- as.numeric(substr(checkRes$pwkstat,1,2))
checkResF <- checkRes[checkRes$pwkstat == 1 | checkRes$pwkstat == 2,]
rm(checkRes)
# Then run 3. CHECK PREDICTED VS RAW (no age rescale)


#############################
#############################
####### Sub-functions #######
#############################
#############################


# Extract p-value from lm fit
lmp <- function (modelobject) {
  if (class(modelobject) != "lm") stop("Not an object of class 'lm' ")
  f <- summary(modelobject)$fstatistic
  if(is.null(f)){
    p <- NA
  } else {
    p <- pf(f[1],f[2],f[3],lower.tail=F)
    attributes(p) <- NULL
  }
  return(p)
}

# Returns fitted values from cubic lm fit for vector of values
fitted2 <- function(fit,val){
  i = val[1]
  ret <- fit$coefficients[1] + fit$coefficients[2] * i + fit$coefficients[3] * i^2 + fit$coefficients[4] * i^3
  if(length(val)>1){
    for(i in val[2:length(val)]){
      ret <- c(ret,fit$coefficients[1] + fit$coefficients[2] * i + fit$coefficients[3] * i^2 + fit$coefficients[4] * i^3)
    }
  }
  return(ret)
}

