library(parallel)

# This needs to be downloaded from Azure (or can be found in raw_data/referencedata after the model is run once)
lookUp <- read.csv("data/lookUp.csv")

regions <- c("East Midlands","London","North East","North West","South East","South West","West Midlands","Yorkshire and The Humber","East")
countyList <- unique(lookUp$NewTU)
type <- c("FFT","FPT","MFT","MPT")

xAx <- c(10,20,25,30,40,50,60,70,75,80,90)

#####################################################
#####################################################
####### 1. EXTRACT COEFS OF FITS FOR EACH SOC #######
#####################################################
#####################################################


options(timeout=600)
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fregionbyoccupation4digitsoc2010ashetable15%2f2020revised/table152020revised.zip", 
              destfile = "base.xls")
# This will only download the file as a multi-page xls file, as provided by ONS. The 'Male Full-Time', 'Male Part-Time', etc. tabs of the "Hourly pay - Gross" file
# need to be saved as individual CSVs and named as below, after making sure the 'Use 1000 Separator (,)' option is turned off.
# No other pre-processing should be necessary.

# Load and clean

loadnClean <- function(type,regions){ # <--- type = FFT for 'Female full-time', etc.
  refInc <- read.csv(paste("data/",type,"Hourly.csv",sep=""),skip = 4)
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

set.seed(1234)

drawIncome <- function(soc,sex,age,fulltime,coefFFTR,coefFPTR,coefMFTR,coefMPTR){
  perc <- floor(runif(1,1,100))
  if(sex == 0 & fulltime == T){ # 0 = female, 1 = male, consistent with TUS_HSE dataset
    coefs <- as.numeric(coefFFTR[coefFFTR$soc == soc,3:8])
  } else if(sex == 0 & fulltime == F){
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

fillIncome <- function(idx,data,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR){
  pwkst <- as.numeric(substr(pwkstat[idx],1,2))
  soc <- data$soc2010[idx]
  sex <- data$sex[idx]
  age <- data$age[idx]
  incomeH <- NA
  incomeHAsIf <- NA
  incomeY <- NA
  incomeYAsIf <- NA
  if(!is.na(soc)){
    if(pwkst == 1){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      inc <- drawIncome(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * time
    } else if(pwkst == 2){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      inc <- drawIncome(soc,sex,age,F,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * time
    } else if(pwkst == 3 | pwkst == 4){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      inc <- drawIncome(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeHAsIf <- inc
      incomeYAsIf <- inc * time
    }
  }
  return(cbind(incomeH,incomeY,incomeHAsIf,incomeYAsIf))
}


# Add new columns

addToData <- function(county,lookUp,coefFFT,coefFPT,coefMFT,coefMPT){
  new <- read.csv(paste("/Users/hsalat/RAMP-UA_Misc/TUOutput/processed/tus_hse_",county,".csv",sep = ""))
  ref <- unique(lookUp$OldTU[which(lookUp$NewTU == county)])
  ref <- ref[!is.na(ref)]
  n <- length(ref)
  old <- read.csv(paste("/Users/hsalat/RAMP-UA_Misc/TUInput/lad_tus_hse_",ref[1],".txt",sep = ""))
  if(n > 1){
    for(i in 2:n){
      old2 <- read.csv(paste("/Users/hsalat/RAMP-UA_Misc/TUInput/lad_tus_hse_",ref[i],".txt",sep = ""))
      old <- rbind(old,old2)
    }
  }
  if(nrow(new) != nrow(old)) stop('Mismatch between the two datasets')
  old3 <- old[order(old$area,old$hid,-old$age),]
  pwkstat <- old3$pwkstat
  region <- unique(lookUp$ITL121NM[which(lookUp$MSOA11CD == new$MSOA11CD[1])])
  region <- regions[sapply(regions,function(x) {grepl(x, region)})][1]
  coefFFTR <- coefFFT[which(coefFFT$region == region),]
  coefFPTR <- coefFPT[which(coefFFT$region == region),]
  coefMFTR <- coefMFT[which(coefFFT$region == region),]
  coefMPTR <- coefMPT[which(coefFFT$region == region),]
  incs <- mcmapply(function(x){fillIncome(x,new,pwkstat,coefFFTR,coefFPTR,coefMFTR,coefMPTR)}, 1:nrow(new), mc.cores = detectCores())
  new$pwkstat <- pwkstat
  new$incomeH <- incs[1,]
  new$incomeY <- incs[2,]
  new$incomeHAsIf <- incs[3,]
  new$incomeYAsIf <- incs[4,]
  return(new)
}


# Loop over all counties (for reference only, requires legacy data)

i = countyList[1]
temp <- addToData(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
write.table(temp,paste("output/tus_hse_",i,".csv",sep=","))
checkRes <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
                       pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)

for(i in countyList[2:length(countyList)]){
  temp <- read.csv(paste("output/tus_hse_",i,".csv",sep=""),sep = " ")
  checkRes2 <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
                          pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)
  checkRes <- rbind(checkRes,checkRes2)
}


##########################################################
##########################################################
####### 3. CHECK PREDICTED VS RAW (no age rescale) #######
##########################################################
##########################################################


checkRes$pwkstat <- as.numeric(substr(checkRes$pwkstat,1,2))
checkResF <- checkRes[checkRes$pwkstat == 1 | checkRes$pwkstat == 2,]
#checkResF <- read.csv("checkResF.csv")

### Numbers
# All
length(checkResF$incomeH)
length(checkResF$incomeH[checkResF$pwkstat == 1])
length(checkResF$incomeH[checkResF$pwkstat == 2])
# M
length(checkResF$incomeH[checkResF$sex == 1])
length(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 1)])
length(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 2)])
# F
length(checkResF$incomeH[checkResF$sex == 0])
length(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 1)])
length(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 2)])
# All
length(checkResF$incomeY[checkResF$incomeY > 0])
length(checkResF$incomeY[which(checkResF$pwkstat == 1 & checkResF$incomeY > 0)])
length(checkResF$incomeY[which(checkResF$pwkstat == 2 & checkResF$incomeY > 0)])
# M
length(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$incomeY > 0)])
length(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)])
length(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)])
# F
length(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$incomeY > 0)])
length(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)])
length(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)])

### Hourly
# All
mean(checkResF$incomeH,na.rm = T)
median(checkResF$incomeH,na.rm = T)
mean(checkResF$incomeH[checkResF$pwkstat == 1],na.rm = T)
median(checkResF$incomeH[checkResF$pwkstat == 1],na.rm = T)
mean(checkResF$incomeH[which(checkResF$pwkstat == 2)],na.rm = T)
median(checkResF$incomeH[which(checkResF$pwkstat == 2)],na.rm = T)
# M
mean(checkResF$incomeH[which(checkResF$sex == 1)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 1)],na.rm = T)
mean(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 1)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 1)],na.rm = T)
mean(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 2)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 1 & checkResF$pwkstat == 2)],na.rm = T)
# F
mean(checkResF$incomeH[which(checkResF$sex == 0)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 0)],na.rm = T)
mean(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 1)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 1)],na.rm = T)
mean(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 2)],na.rm = T)
median(checkResF$incomeH[which(checkResF$sex == 0 & checkResF$pwkstat == 2)],na.rm = T)

### Annual
# All
mean(checkResF$incomeY[checkResF$incomeY > 0],na.rm = T)
median(checkResF$incomeY[checkResF$incomeY > 0],na.rm = T)
mean(checkResF$incomeY[checkResF$pwkstat == 1 & checkResF$incomeY > 0],na.rm = T)
median(checkResF$incomeY[checkResF$pwkstat == 1 & checkResF$incomeY > 0],na.rm = T)
mean(checkResF$incomeY[which(checkResF$pwkstat == 2 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$pwkstat == 2 &  checkResF$incomeY > 0)],na.rm = T)
# M
mean(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$incomeY > 0)],na.rm = T)
mean(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)],na.rm = T)
mean(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 1 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)],na.rm = T)
# F
mean(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$incomeY > 0)],na.rm = T)
mean(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 1 & checkResF$incomeY > 0)],na.rm = T)
mean(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)],na.rm = T)
median(checkResF$incomeY[which(checkResF$sex == 0 & checkResF$pwkstat == 2 & checkResF$incomeY > 0)],na.rm = T)

### Region

# add regions
temp <- checkResF$MSOA11CD
comp1 <- lookUp$ITL121NM
comp2 <- lookUp$MSOA11CD
addReg <- function(x){
  region <- unique(comp1[which(comp2 == temp[x])])
  region <- regions[sapply(regions,function(x) {grepl(x, region)})][1]
  return(region)
}

a <- 2300000
regionCol1 <- mcmapply(function(x){addReg(x)}, 1:a, mc.cores = detectCores())
regionCol2 <- mcmapply(function(x){addReg(x)}, (a+1):(2*a), mc.cores = detectCores())
regionCol3 <- mcmapply(function(x){addReg(x)}, (2*a+1):(3*a), mc.cores = detectCores())
regionCol4 <- mcmapply(function(x){addReg(x)}, (3*a+1):(4*a), mc.cores = detectCores())
regionCol5 <- mcmapply(function(x){addReg(x)}, (4*a+1):(5*a), mc.cores = detectCores())
regionCol6 <- mcmapply(function(x){addReg(x)}, (5*a+1):(6*a), mc.cores = detectCores())
regionCol7 <- mcmapply(function(x){addReg(x)}, (6*a+1):(7*a), mc.cores = detectCores())
regionCol8 <- mcmapply(function(x){addReg(x)}, (7*a+1):(8*a), mc.cores = detectCores())
regionCol9 <- mcmapply(function(x){addReg(x)}, (8*a+1):(9*a), mc.cores = detectCores())
regionCol10 <- mcmapply(function(x){addReg(x)}, (9*a+1):nrow(checkResF), mc.cores = detectCores())
regionCol <- c(regionCol1,regionCol2,regionCol3,regionCol4,regionCol5,
               regionCol6,regionCol7,regionCol8,regionCol9,regionCol10)
checkResF$region <- regionCol

# Original data
meanRaw <- c(16.74,15.87,23.78,15.69,16.36,17.88,16.36,16.34,15.76)
medianRaw <- c(13.28,12.65,18.30,12.40,12.90,14.33,12.74,12.92,12.46)

# Modelled
meanMod <- c(mean(checkResF$incomeH[checkResF$region == "East"],na.rm = T),mean(checkResF$incomeH[checkResF$region == "East Midlands"],na.rm = T),
             mean(checkResF$incomeH[checkResF$region == "London"],na.rm = T),mean(checkResF$incomeH[checkResF$region == "North East"],na.rm = T),
             mean(checkResF$incomeH[checkResF$region == "North West"],na.rm = T),mean(checkResF$incomeH[checkResF$region == "South East"],na.rm = T),
             mean(checkResF$incomeH[checkResF$region == "South West"],na.rm = T),mean(checkResF$incomeH[checkResF$region == "West Midlands"],na.rm = T),
             mean(checkResF$incomeH[checkResF$region == "Yorkshire and The Humber"],na.rm = T)
             )
medianMod <- c(median(checkResF$incomeH[checkResF$region == "East"],na.rm = T),median(checkResF$incomeH[checkResF$region == "East Midlands"],na.rm = T),
               median(checkResF$incomeH[checkResF$region == "London"],na.rm = T),median(checkResF$incomeH[checkResF$region == "North East"],na.rm = T),
               median(checkResF$incomeH[checkResF$region == "North West"],na.rm = T),median(checkResF$incomeH[checkResF$region == "South East"],na.rm = T),
               median(checkResF$incomeH[checkResF$region == "South West"],na.rm = T),median(checkResF$incomeH[checkResF$region == "West Midlands"],na.rm = T),
               median(checkResF$incomeH[checkResF$region == "Yorkshire and The Humber"],na.rm = T)
)

cor(meanRaw,meanMod)
cor(medianRaw,medianMod)

meanMod
medianMod


### SOC

meanRaw <- c(26.77,23.38,18.29,13.42,13.35,10.87,10.94,12.23,10.77)
medianRaw <- c(20.96,21.34,15.66,11.54,12.04,10.08,9.52,10.93,9.22)

# add simplified SOC
temp <- checkResF$soc2010
addSoc <- function(x){
  soc <- temp[x]
  return(substr(soc,1,1))
}

a <- 2300000
socS1 <- mcmapply(function(x){addSoc(x)}, 1:a, mc.cores = detectCores())
socS2 <- mcmapply(function(x){addSoc(x)}, (a+1):(2*a), mc.cores = detectCores())
socS3 <- mcmapply(function(x){addSoc(x)}, (2*a+1):(3*a), mc.cores = detectCores())
socS4 <- mcmapply(function(x){addSoc(x)}, (3*a+1):(4*a), mc.cores = detectCores())
socS5 <- mcmapply(function(x){addSoc(x)}, (4*a+1):(5*a), mc.cores = detectCores())
socS6 <- mcmapply(function(x){addSoc(x)}, (5*a+1):(6*a), mc.cores = detectCores())
socS7 <- mcmapply(function(x){addSoc(x)}, (6*a+1):(7*a), mc.cores = detectCores())
socS8 <- mcmapply(function(x){addSoc(x)}, (7*a+1):(8*a), mc.cores = detectCores())
socS9 <- mcmapply(function(x){addSoc(x)}, (8*a+1):(9*a), mc.cores = detectCores())
socS10 <- mcmapply(function(x){addSoc(x)}, (9*a+1):nrow(checkResF), mc.cores = detectCores())
socS <- as.numeric(c(socS1,socS2,socS3,socS4,socS5,
                     socS6,socS7,socS8,socS9,socS10))
checkResF$socS <- socS

meanMod <- c(mean(checkResF$incomeH[checkResF$socS == 1],na.rm = T),mean(checkResF$incomeH[checkResF$socS == 2],na.rm = T),
             mean(checkResF$incomeH[checkResF$socS == 3],na.rm = T),mean(checkResF$incomeH[checkResF$socS == 4],na.rm = T),
             mean(checkResF$incomeH[checkResF$socS == 5],na.rm = T),mean(checkResF$incomeH[checkResF$socS == 6],na.rm = T),
             mean(checkResF$incomeH[checkResF$socS == 7],na.rm = T),mean(checkResF$incomeH[checkResF$socS == 8],na.rm = T),
             mean(checkResF$incomeH[checkResF$socS == 9],na.rm = T)
            )
medianMod <- c(median(checkResF$incomeH[checkResF$socS == 1],na.rm = T),median(checkResF$incomeH[checkResF$socS == 2],na.rm = T),
             median(checkResF$incomeH[checkResF$socS == 3],na.rm = T),median(checkResF$incomeH[checkResF$socS == 4],na.rm = T),
             median(checkResF$incomeH[checkResF$socS == 5],na.rm = T),median(checkResF$incomeH[checkResF$socS == 6],na.rm = T),
             median(checkResF$incomeH[checkResF$socS == 7],na.rm = T),median(checkResF$incomeH[checkResF$socS == 8],na.rm = T),
             median(checkResF$incomeH[checkResF$socS == 9],na.rm = T)
            )

cor(meanRaw,meanMod)
cor(medianRaw,medianMod)

meanMod
medianMod


### Age

ageRef <-c(16.5,19.5,25.5,34.5,44.5,54.5,63)

meanRaw <- c(7.21,9.59,14.09,18.13,20.04,19.12,16.32)
medianRaw <- c(6.36,9.00,12.26,15.08,15.89,14.39,12.17)

# add age group
temp <- checkResF$age
addAgeG <- function(x){
  age <- temp[x]
  if(age == 16 | age == 17){
    ag <- 1
  } else if(age > 17 & age < 22){
    ag <- 2
  } else if(age > 21 & age < 30){
    ag <- 3
  } else if(age > 29 & age < 40){
    ag <- 4
  } else if(age > 39 & age < 50){
    ag <- 5
  } else if(age > 49 & age < 60){
    ag <- 6
  } else if(age > 59){
    ag <- 7
  }
  return(ag)
}

a <- 2300000
ageG1 <- mcmapply(function(x){addAgeG(x)}, 1:a, mc.cores = detectCores())
ageG2 <- mcmapply(function(x){addAgeG(x)}, (a+1):(2*a), mc.cores = detectCores())
ageG3 <- mcmapply(function(x){addAgeG(x)}, (2*a+1):(3*a), mc.cores = detectCores())
ageG4 <- mcmapply(function(x){addAgeG(x)}, (3*a+1):(4*a), mc.cores = detectCores())
ageG5 <- mcmapply(function(x){addAgeG(x)}, (4*a+1):(5*a), mc.cores = detectCores())
ageG6 <- mcmapply(function(x){addAgeG(x)}, (5*a+1):(6*a), mc.cores = detectCores())
ageG7 <- mcmapply(function(x){addAgeG(x)}, (6*a+1):(7*a), mc.cores = detectCores())
ageG8 <- mcmapply(function(x){addAgeG(x)}, (7*a+1):(8*a), mc.cores = detectCores())
ageG9 <- mcmapply(function(x){addAgeG(x)}, (8*a+1):(9*a), mc.cores = detectCores())
ageG10 <- mcmapply(function(x){addAgeG(x)}, (9*a+1):nrow(checkResF), mc.cores = detectCores())
ageG <- as.numeric(c(ageG1,ageG2,ageG3,ageG4,ageG5,
                     ageG6,ageG7,ageG8,ageG9,ageG10))
checkResF$ageG <- ageG

#ageG <- mcmapply(function(x){addAgeG(x)}, 1:nrow(checkResF), mc.cores = detectCores())

meanMod <- c(mean(checkResF$incomeH[checkResF$ageG == 1],na.rm = T),mean(checkResF$incomeH[checkResF$ageG == 2],na.rm = T),
             mean(checkResF$incomeH[checkResF$ageG == 3],na.rm = T),mean(checkResF$incomeH[checkResF$ageG == 4],na.rm = T),
             mean(checkResF$incomeH[checkResF$ageG == 5],na.rm = T),mean(checkResF$incomeH[checkResF$ageG == 6],na.rm = T),
             mean(checkResF$incomeH[checkResF$ageG == 7],na.rm = T)
            )
medianMod <- c(median(checkResF$incomeH[checkResF$ageG == 1],na.rm = T),median(checkResF$incomeH[checkResF$ageG == 2],na.rm = T),
               median(checkResF$incomeH[checkResF$ageG == 3],na.rm = T),median(checkResF$incomeH[checkResF$ageG == 4],na.rm = T),
               median(checkResF$incomeH[checkResF$ageG == 5],na.rm = T),median(checkResF$incomeH[checkResF$ageG == 6],na.rm = T),
               median(checkResF$incomeH[checkResF$ageG == 7],na.rm = T)
              )

cor(meanRaw,meanMod)
cor(medianRaw,medianMod)

meanMod
medianMod

plot(ageRef,meanMod,ylim = c(0,20))
lines(ageRef,meanMod)
points(ageRef,meanRaw,col=2)
lines(ageRef,meanRaw,col=2)


###################################
###################################
########  4. AGE RESCALING ########
###################################
###################################


# !!! ---> Ages above 67 are treated as 67 due to lack of data

# Read raw data from ONS
options(timeout=600)
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fagegroupashetable6%2f2020revised/table62020revised.zip", 
              destfile = "base.xls")
# Preparation as before

ageMFT <- read.csv("data/ageMFT.csv",skip = 4)
ageMFT <- ageMFT[c(1:8),c(1,3:17)]
ageMPT <- read.csv("data/ageMPT.csv",skip = 4)
ageMPT <- ageMPT[c(1:8),c(1,3:17)]
ageFFT <- read.csv("data/ageFFT.csv",skip = 4)
ageFFT <- ageFFT[c(1:8),c(1,3:17)]
ageFPT <- read.csv("data/ageFPT.csv",skip = 4)
ageFPT <- ageFPT[c(1:8),c(1,3:17)]

# Prepare data to read results of the previous modelling
checkResMFT <- checkResF[checkResF$sex == 1 & checkResF$pwkstat == 1,]
checkResMPT <- checkResF[checkResF$sex == 1 & checkResF$pwkstat == 2,]
checkResFFT <- checkResF[checkResF$sex == 0 & checkResF$pwkstat == 1,]
checkResFPT <- checkResF[checkResF$sex == 0 & checkResF$pwkstat == 2,]

checkageMFT <- checkResMFT$age
checkageMPT <- checkResMPT$age
checkageFFT <- checkResFFT$age
checkageFPT <- checkResFPT$age

checkincomeHMFT <- checkResMFT$incomeH
checkincomeHMPT <- checkResMPT$incomeH
checkincomeHFFT <- checkResFFT$incomeH
checkincomeHFPT <- checkResFPT$incomeH

# Ready data to be able to model ONS data for any age
fitCol <- function(col,row,M,ord = 4){
  fit <- lm(M[,col] ~ poly(row,ord, raw=TRUE))
  return(as.numeric(c(fit$coefficients[1],fit$coefficients[2],fit$coefficients[3],fit$coefficients[4],fit$coefficients[5])))
}

outputRefAge <- function(ageData){
  ageData <- as.matrix(ageData[2:8,c(7:11,3,12:16)])
  ageData <- matrix(as.numeric(as.matrix(ageData)),ncol = ncol(ageData))
  coefAgeData <- sapply(1:ncol(ageData),function(x){fitCol(x,ageRef,ageData,4)})
  return(coefAgeData)
}

coefAgeMFT <- outputRefAge(ageMFT)
coefAgeMPT <- outputRefAge(ageMPT)
coefAgeFFT <- outputRefAge(ageFFT)
coefAgeFPT <- outputRefAge(ageFPT)

readCoefAgeData <- function(age,coefAgeData){
  refVal <- rep(NA,ncol(coefAgeData))
  for(i in 1:ncol(coefAgeData)){
    refVal[i] <- coefAgeData[1,i] + coefAgeData[2,i]*age + coefAgeData[3,i]*age^2 + coefAgeData[4,i]*age^3 + coefAgeData[5,i]*age^4
  }
  return(refVal)
}

# Build percentile shrinking / expansion reference table depending on age
makeAgeRow <- function(age,sex,fullTime){
  xAx <- c(10,20,25,30,40,50,60,70,75,80,90)
  # fetch correct global distribution, distribution for specific age and previoulsy modelled distribution
  if(sex == 1 & fullTime == T){
    trueGlob <- as.numeric(ageMFT[1,c(7:11,3,12:16)])
    if(age > 66){
      temp <- checkincomeHMFT[checkageMFT > 66]
      true <- readCoefAgeData(67,coefAgeMFT)
    } else{
      temp <- checkincomeHMFT[checkageMFT == age]
      true <- readCoefAgeData(age,coefAgeMFT)
    }
    mod <- quantile(temp, c(.10,.20,.25,.30,.40,.50,.60,.70,.75,.80,.90),na.rm=T)
  } else if(sex == 1 & fullTime == F){
    trueGlob <- as.numeric(ageMPT[1,c(7:11,3,12:16)])
    if(age > 66){
      temp <- checkincomeHMPT[checkageMPT > 66]
      true <- readCoefAgeData(67,coefAgeMPT)
    } else{
    temp <- checkincomeHMPT[checkageMPT == age]
    true <- readCoefAgeData(age,coefAgeMPT)
    }
    mod <- quantile(temp, c(.10,.20,.25,.30,.40,.50,.60,.70,.75,.80,.90),na.rm=T)
  } else if(sex == 0 & fullTime == T){
    trueGlob <- as.numeric(ageFFT[1,c(7:11,3,12:16)])
    if(age > 66){
      temp <- checkincomeHFFT[checkageFFT > 66]
      true <- readCoefAgeData(67,coefAgeFFT)
    } else{
    temp <- checkincomeHFFT[checkageFFT == age]
    true <- readCoefAgeData(age,coefAgeFFT)
    }
    mod <- quantile(temp, c(.10,.20,.25,.30,.40,.50,.60,.70,.75,.80,.90),na.rm=T)
  } else {
    trueGlob <- as.numeric(ageFPT[1,c(7:11,3,12:16)])
    if(age > 66){
      temp <- checkincomeHFPT[checkageFPT > 66]
      true <- readCoefAgeData(67,coefAgeFPT)
    } else{
    temp <- checkincomeHFPT[checkageFPT == age]
    true <- readCoefAgeData(age,coefAgeFPT)
    }
    mod <- quantile(temp, c(.10,.20,.25,.30,.40,.50,.60,.70,.75,.80,.90),na.rm=T)
  }
  # deduce relevant fittings
  fitTrueGlob <- lm(trueGlob ~ poly(xAx,3, raw=TRUE))
  fitTrue <- lm(true ~ poly(xAx,3, raw=TRUE))
  fitXAxTrueGlob <- lm(xAx ~ poly(trueGlob,3, raw=TRUE))
  fitXAxMod <- lm(xAx ~ poly(mod,3, raw=TRUE))
  # deduce new percentile value (see methods)
  a <- fitted2(fitTrueGlob,1)
  b <- fitted2(fitXAxMod,a)
  c <- fitted2(fitTrue,b)
  newPerc <- min(max(1,as.numeric(round(fitted2(fitXAxTrueGlob,c)))),100)
  for(i in 2:100){
    a <- fitted2(fitTrueGlob,i)
    b <- fitted2(fitXAxMod,a)
    c <- fitted2(fitTrue,b)
    newPerc <- c(newPerc,min(max(1,as.numeric(round(fitted2(fitXAxTrueGlob,c)))),100))
  }
  return(newPerc)
}

ageRescaleMFT <- mcmapply(function(x){makeAgeRow(x,1,T)}, 16:86, mc.cores = detectCores())
ageRescaleMPT <- mcmapply(function(x){makeAgeRow(x,1,F)}, 16:86, mc.cores = detectCores())
ageRescaleFFT <- mcmapply(function(x){makeAgeRow(x,0,T)}, 16:86, mc.cores = detectCores())
ageRescaleFPT <- mcmapply(function(x){makeAgeRow(x,0,F)}, 16:86, mc.cores = detectCores())

#ageRescaleMFT <- pmin(round(ageRescaleMFT *50.5 / mean(ageRescaleMFT)),100)
#ageRescaleMPT <- pmin(round(ageRescaleMPT *50.5 / mean(ageRescaleMPT)),100)
#ageRescaleFFT <- pmin(round(ageRescaleFFT *50.5 / mean(ageRescaleFFT)),100)
#ageRescaleFPT <- pmin(round(ageRescaleFPT *50.5 / mean(ageRescaleFPT)),100)

mean(ageRescaleMFT)
mean(ageRescaleMPT)
mean(ageRescaleFFT)
mean(ageRescaleFPT)

range(ageRescaleMFT)
range(ageRescaleMPT)
range(ageRescaleFFT)
range(ageRescaleFPT)

test <- colSums(ageRescaleMFT)/100
test2 <- colSums(ageRescaleMPT)/100
test3 <- colSums(ageRescaleFFT)/100
test4 <- colSums(ageRescaleFPT)/100
fit <- lm(meanMod ~ poly(ageRef,4, raw=TRUE))
age <- 16:86
ageX <- fit$coefficients[1] + fit$coefficients[2]*age + fit$coefficients[3]*age^2 + fit$coefficients[4]*age^3 + fit$coefficients[5]*age^4

plot(ageRef,meanRaw,ylim = c(0,22),pch = "")
lines(ageRef,meanRaw,lwd = 2)
lines(ageRef,meanMod)
lines(16:86,ageX)

points(16:86,ageX*test/50,pch=20)
points(16:86,ageX*test2/50,pch=20,col=3)
points(16:86,ageX*test3/50,pch=20,col=2)
points(16:86,ageX*test4/50,pch=20,col=4)

points(ageRef,fitted(fit))


###################################################
###################################################
####### 5. AS IF WITH MODELLED WORKED HOURS #######
###################################################
###################################################


# Due to less data available and generally more homogeneous results, we use a simplified approach.
# The supported data is Table 15.9a   Paid hours worked - Total - For all employee jobsa: United Kingdom, 2020, processed as before.

getWorkedHoursData <- function(type){
  refHours <- read.csv(paste("data/hours",type,".csv",sep=""),skip = 4)
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
  if(sex == 0 & fulltime == T){
    base <- distribHoursFFT[perc + 1]
    coef <- meanHoursFFT$mean[which(meanHoursFFT$soc == soc & meanHoursFFT$region == region)] / distribHoursFFT[1]
    res <- base * coef
  } else if(sex == 0 & fulltime == F){
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
  if(sex == 0 & fulltime == T){
    age2 <- min(max(1,age - 15),71)
    perc <- ageRescaleFFT[perc,age2]
    coefs <- as.numeric(coefFFTR[coefFFTR$soc == soc,3:8])
  } else if(sex == 0 & fulltime == F){
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
  pwkst <- as.numeric(substr(pwkstat[idx],1,2))
  soc <- data$soc2010[idx]
  sex <- data$sex[idx]
  age <- data$age[idx]
  incomeH <- NA
  incomeHAsIf <- NA
  incomeY <- NA
  incomeYAsIf <- NA
  if(!is.na(soc)){
    if(pwkst == 1){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      time2 <- 0
      if(time == 0){
        time2 <- drawTime(soc,sex,T,region)*52
      }
      inc <- drawIncome2(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * (time + time2)
    } else if(pwkst == 2){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      time2 <- 0
      if(time == 0){
        time2 <- drawTime(soc,sex,F,region)*52
      }
      inc <- drawIncome2(soc,sex,age,F,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeH <- inc
      incomeHAsIf <- inc
      incomeY <- inc * time
      incomeYAsIf <- inc * (time + time2)
    } else if(pwkst == 3 | pwkst == 4){
      time <- (data$pwork[idx]+data$pworkhome[idx])*24*5*52
      time2 <- 0
      if(time == 0){
        time2 <- drawTime(soc,sex,T,region)*52
      }
      inc <- drawIncome2(soc,sex,age,T,coefFFTR,coefFPTR,coefMFTR,coefMPTR)
      incomeHAsIf <- inc
      incomeYAsIf <- inc * (time + time2)
    }
  }
  return(cbind(incomeH,incomeY,incomeHAsIf,incomeYAsIf))
}

addToData2 <- function(county,lookUp,coefFFT,coefFPT,coefMFT,coefMPT){
  old <- read.csv(paste("output/tus_hse_",county,".csv",sep = ""),sep = " ")
  old <- old[,1:46]
  pwkstat <- old$pwkstat
  region <- unique(lookUp$ITL121NM[which(lookUp$MSOA11CD == old$MSOA11CD[1])])
  region <- regions[sapply(regions,function(x) {grepl(x, region)})][1]
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

# Loop over all counties

i = countyList[1]

temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")

for(i in countyList[2]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

for(i in countyList[3:12]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

for(i in countyList[13:23]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

for(i in countyList[24:35]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

for(i in countyList[36:length(countyList)]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

for(i in countyList[40:length(countyList)]){
  temp <- addToData2(i,lookUp,coefFFT,coefFPT,coefMFT,coefMPT)
  write.table(temp,paste("output/new/tus_hse_",i,".csv",sep=""),sep=",")
}

i <- countyList[1]
temp <- read.csv(paste("output/new/tus_hse_",i,".csv",sep=""))
checkRes <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
                       pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)

for(i in countyList[2:22]){
  temp <- read.csv(paste("output/new/tus_hse_",i,".csv",sep=""))
  checkRes2 <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
                          pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)
  checkRes <- rbind(checkRes,checkRes2)
}

for(i in countyList[23:length(countyList)]){
  temp <- read.csv(paste("output/new/tus_hse_",i,".csv",sep=""))
  checkRes2 <- data.frame(MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
                          pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY)
  checkRes <- rbind(checkRes,checkRes2)
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


###################
###################
####### Bin #######
###################
###################


xAx <- c(10,20,25,30,40,50,60,70,75,80,90)
y1 <- as.numeric(refIncomeF[1,c(8:12,4,13:17)])
y2 <- as.numeric(refIncomeF[2,c(8:12,4,13:17)])
y3 <- as.numeric(refIncomeF[3,c(8:12,4,13:17)])
y33 <- as.numeric(refIncomeF[33,c(8:12,4,13:17)])

plot(xAx,y1)
lines(xAx,y1,lwd = 3)
lines(xAx,fitted(modelGlob),col=5)
points(xAx,y2)
lines(xAx,y2,lwd = 3)
lines(xAx[1:7],fitted(model1),col=6)

colnames(refIncomeF)

modelGlob <- lm(y1 ~ poly(xAx,3, raw=TRUE))

model1 <- lm(y2 ~ poly(xAx,3, raw=TRUE))

model3 <- lm(y3 ~ poly(xAx,3, raw=TRUE))

model33 <- lm(y33 ~ poly(xAx,3, raw=TRUE))


### Age spreads

options(timeout=600)
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fagegroupashetable6%2f2020revised/table62020revised.zip", 
              destfile = "base.xls")
# This will only download the file as a multi-page xls file, as provided by ONS. The 'Male Full-Time' and 'Female Full-Time'
# tabs need to be saved as individual CSVs, after making sure the 'Use 1000 Separator (,)' option is turned off.
# No other pre-processing should be necessary.

# Female

refAgeF <- read.csv("data/AgeGroupFemaleFT.csv",skip = 4)
colnames(refAgeF)[c(3,5,7)] <- c("Number","Change_med","Change_mean")

refAgeF <- refAgeF[1:8,c(1,3:17)]

ages <- c((21+18)/2,(22+29)/2,(30+39)/2,(40+49)/2,(50+59)/2,(60+65)/2)

plot(ages,refAgeF$X10.00[3:8])
plot(ages,refAgeF$X20.00[3:8])
plot(ages,refAgeF$X40.00[3:8])
plot(ages,refAgeF$X60.00[3:8])
plot(ages,refAgeF$X80.00[3:8])
plot(ages,refAgeF$X90.00[3:8])

model10 <- lm(refAgeF$X10.00[3:8] ~ poly(ages,2))
model20 <- lm(refAgeF$X20.00[3:8] ~ poly(ages,2))
model25 <- lm(refAgeF$X25.00[3:8] ~ poly(ages,2))
model30 <- lm(refAgeF$X30.00[3:8] ~ poly(ages,2))
model40 <- lm(refAgeF$X40.00[3:8] ~ poly(ages,2))
model60 <- lm(refAgeF$X60.00[3:8] ~ poly(ages,2))
model70 <- lm(refAgeF$X70.00[3:8] ~ poly(ages,2))
model75 <- lm(refAgeF$X75.00[3:8] ~ poly(ages,2))
model80 <- lm(refAgeF$X80.00[3:8] ~ poly(ages,2))
model90 <- lm(refAgeF$X90.00[4:8] ~ poly(ages[2:6],2))

plot(ages,refAgeF$X10.00[3:8],pch = 20,ylim = c(0,60000))
lines(ages,fitted(model10))
points(ages,refAgeF$X20.00[3:8],pch = 20)
lines(ages,fitted(model20))
points(ages,refAgeF$X40.00[3:8],pch = 20)
lines(ages,fitted(model40))
points(ages,refAgeF$X60.00[3:8],pch = 20)
lines(ages,fitted(model60))
points(ages,refAgeF$X80.00[3:8],pch = 20)
lines(ages,fitted(model80))
points(ages[2:6],refAgeF$X90.00[4:8],pch = 20)
lines(ages[2:6],fitted(model90))
points(ages[2:6],refAgeF$X90.00[4:8],pch = 20)
lines(ages[2:6],fitted(model6))

perc <- c(10,20,25,30,40,60,70,75,80,90)

coef2 <- c(model10$coefficients[2],model20$coefficients[2],model25$coefficients[2],model30$coefficients[2],model40$coefficients[2],
           model60$coefficients[2],model70$coefficients[2],model75$coefficients[2],model80$coefficients[2],model90$coefficients[2])

coef3 <- c(model10$coefficients[3],model20$coefficients[3],model25$coefficients[3],model30$coefficients[3],model40$coefficients[3],
           model60$coefficients[3],model70$coefficients[3],model75$coefficients[3],model80$coefficients[3],model90$coefficients[3])


plot(coef2,coef3,xlim = c(0,15000),ylim = c(-17000,0))

plot(perc,coef2,pch = 20)

modelCoef2 <- lm(coef2[1:9] ~ poly(perc[1:9],3))
modelCoef3 <- lm(coef3[1:9] ~ poly(perc[1:9],3))

plot(perc,coef2,pch = 20)
lines(perc[1:9],fitted(modelCoef2))

plot(perc,coef3,pch = 20)
lines(perc[1:9],fitted(modelCoef3))

# Male

refAgeM <- read.csv("data/AgeGroupMaleFT.csv",skip = 4)
colnames(refAgeM)[c(3,5,7)] <- c("Number","Change_med","Change_mean")

refAgeM <- refAgeM[1:8,c(1,3:17)]

ages <- c((21+18)/2,(22+29)/2,(30+39)/2,(40+49)/2,(50+59)/2,(60+65)/2)

plot(ages,refAgeM$X10.00[3:8])
plot(ages,refAgeM$X20.00[3:8])
plot(ages,refAgeM$X40.00[3:8])
plot(ages,refAgeM$X60.00[3:8])
plot(ages,refAgeM$X80.00[3:8])
plot(ages,refAgeM$X90.00[3:8])

model10 <- lm(refAgeM$X10.00[3:8] ~ poly(ages,2, raw=TRUE))
model20 <- lm(refAgeM$X20.00[3:8] ~ poly(ages,2, raw=TRUE))
model25 <- lm(refAgeM$X25.00[3:8] ~ poly(ages,2, raw=TRUE))
model30 <- lm(refAgeM$X30.00[3:8] ~ poly(ages,2, raw=TRUE))
model40 <- lm(refAgeM$X40.00[3:8] ~ poly(ages,2, raw=TRUE))
model60 <- lm(refAgeM$X60.00[3:8] ~ poly(ages,2, raw=TRUE))
model70 <- lm(refAgeM$X70.00[3:8] ~ poly(ages,2, raw=TRUE))
model75 <- lm(refAgeM$X75.00[3:8] ~ poly(ages,2, raw=TRUE))
model80 <- lm(refAgeM$X80.00[3:8] ~ poly(ages,2, raw=TRUE))
model90 <- lm(refAgeM$X90.00[4:8] ~ poly(ages[2:6],2, raw=TRUE))

plot(ages,refAgeM$X10.00[3:8],pch = 20,ylim = c(0,60000))
lines(ages,fitted(model10))
points(ages,refAgeM$X20.00[3:8],pch = 20)
lines(ages,fitted(model20))
points(ages,refAgeM$X40.00[3:8],pch = 20)
lines(ages,fitted(model40))
points(ages,refAgeM$X60.00[3:8],pch = 20)
lines(ages,fitted(model60))
points(ages,refAgeM$X80.00[3:8],pch = 20)
lines(ages,fitted(model80))
points(ages[2:6],refAgeM$X90.00[4:8],pch = 20)
lines(ages[2:6],fitted(model90))
points(ages[2:6],refAgeM$X90.00[4:8],pch = 20)
lines(ages[2:6],fitted(model6))

perc <- c(10,20,25,30,40,60,70,75,80,90)

coef1M <- c(model10$coefficients[1],model20$coefficients[1],model25$coefficients[1],model30$coefficients[1],model40$coefficients[1],
            model60$coefficients[1],model70$coefficients[1],model75$coefficients[1],model80$coefficients[1],model90$coefficients[1])
coef1M <- unname(coef1M)

coef2M <- c(model10$coefficients[2],model20$coefficients[2],model25$coefficients[2],model30$coefficients[2],model40$coefficients[2],
            model60$coefficients[2],model70$coefficients[2],model75$coefficients[2],model80$coefficients[2],model90$coefficients[2])
coef2M <- unname(coef2M)

coef3M <- c(model10$coefficients[3],model20$coefficients[3],model25$coefficients[3],model30$coefficients[3],model40$coefficients[3],
            model60$coefficients[3],model70$coefficients[3],model75$coefficients[3],model80$coefficients[3],model90$coefficients[3])
coef3M <- unname(coef3M)

plot(coef2M,coef3M,xlim = c(0,15000),ylim = c(-17000,0))

#plot(perc,coef2M,pch = 20)

modelCoef1M <- lm(coef1M[1:9] ~ poly(perc[1:9],3, raw=TRUE))
modelCoef2M <- lm(coef2M[1:9] ~ poly(perc[1:9],3, raw=TRUE))
modelCoef3M <- lm(coef3M[1:9] ~ poly(perc[1:9],3, raw=TRUE))

plot(perc,coef1M,pch = 20)
lines(perc[1:9],fitted(modelCoef1M))

plot(perc,coef2M,pch = 20)
lines(perc[1:9],fitted(modelCoef2M))

plot(perc,coef3M,pch = 20)
lines(perc[1:9],fitted(modelCoef3M))
