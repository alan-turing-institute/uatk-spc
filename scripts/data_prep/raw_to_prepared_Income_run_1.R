library(parallel)
library(readxl)

# folderIn <- "Data/dl/"
# folderOut <- "Data/prepData/"
options(timeout=600)

# This needs to be downloaded from Azure (or have been created by raw_to_prepared.R)
lu <- read.csv(paste(folderOut,"lookUp-GB.csv",sep = ""))

regions <- c("East Midlands","London","North East","North West","South East","South West","West Midlands","Yorkshire and The Humber","East")
type <- c("FFT","FPT","MFT","MPT")

xAx <- c(10,20,25,30,40,50,60,70,75,80,90)

set.seed(12345)


#################################################
####### (2.) ADD TO DATA (no age rescale) #######
#################################################


# Draw income for a specific individual; apply minimum wage rules
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