library(parallel)
library(readxl)

sig_figs = 6
folderIn <- "Data/dl/"
folderOut <- "Data/prepData/"
options(timeout=600)

# This needs to be downloaded from Azure (or have been created by raw_to_prepared.R)
lu <- read.csv(paste(folderOut,"lookUp-GB.csv",sep = ""))

regions <- c("East Midlands","London","North East","North West","South East","South West","West Midlands","Yorkshire and The Humber","East")
type <- c("FFT","FPT","MFT","MPT")

xAx <- c(10,20,25,30,40,50,60,70,75,80,90)

set.seed(12345)


#############################
####### Sub-functions #######
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


#####################################################
####### 1. EXTRACT COEFS OF FITS FOR EACH SOC #######
#####################################################


print("Downloading and cleaning hourly salary data")

file_name = paste(folderIn,"incomeData.zip",sep = "")
if(!file.exists(file_name)){
  download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fregionbyoccupation4digitsoc2010ashetable15%2f2020revised/table152020revised.zip", 
                destfile = paste(folderIn,"incomeData.zip",sep = ""))
} else{
  print(paste(file_name," already exists, not downloading again",sep = ""))
}
unzip(paste(folderIn,"incomeData.zip",sep = ""),exdir = paste(folderIn,"incomeData",sep = ""))

# Load and clean
loadnClean <- function(type,regions){ # <--- type = "Male Full-Time", "Male Part-Time", "Female Full-Time", "Female Part-Time"
  refInc <- read_excel(paste(folderIn,"incomeData/","Work Region Occupation SOC10 (4) Table 15.5a   Hourly pay - Gross 2020.xls",sep = ""), sheet = type, skip = 4)
  # Basic cleaning
  refInc <- as.data.frame(refInc)
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

refFFT <- loadnClean("Female Full-Time",regions)
refFPT <- loadnClean("Female Part-Time",regions)
refMFT <- loadnClean("Male Full-Time",regions)
refMPT <- loadnClean("Male Part-Time",regions)

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

print("Calculating coefficients for Female Full-Time")
coefFFT <- coefTable(refFFT,0.01) %>% mutate_at(vars(inter,coef1,coef2,coef3,ceilingVal), function(x) signif(x, sig_figs))
print("Calculating coefficients for Female Part-Time")
coefFPT <- coefTable(refFPT,0.01) %>% mutate_at(vars(inter,coef1,coef2,coef3,ceilingVal), function(x) signif(x, sig_figs))
print("Calculating coefficients for Male Full-Time")
coefMFT <- coefTable(refMFT,0.01) %>% mutate_at(vars(inter,coef1,coef2,coef3,ceilingVal), function(x) signif(x, sig_figs))
print("Calculating coefficients for Male Part-Time")
coefMPT <- coefTable(refMPT,0.01) %>% mutate_at(vars(inter,coef1,coef2,coef3,ceilingVal), function(x) signif(x, sig_figs))

print("Writing modelled coefficients")
write.table(coefFFT,paste(folderOut,"coefFFT.csv",sep = ""),row.names = F,sep = ",")
write.table(coefFPT,paste(folderOut,"coefFPT.csv",sep = ""),row.names = F,sep = ",")
write.table(coefMFT,paste(folderOut,"coefMFT.csv",sep = ""),row.names = F,sep = ",")
write.table(coefMPT,paste(folderOut,"coefMPT.csv",sep = ""),row.names = F,sep = ",")



########################################
####### 5. MODELLED WORKED HOURS #######
########################################


print("Calculating number of worked hours")

# Due to less data available and generally more homogeneous results, we use a simplified approach.
# The supported data is Table 15.9a   Paid hours worked - Total - For all employee jobsa: United Kingdom, 2020, processed as before.

getWorkedHoursData <- function(type){
  refHours <- read_excel(paste(folderIn,"incomeData/","Work Region Occupation SOC10 (4) Table 15.9a   Paid hours worked - Total 2020.xls",sep = ""), sheet = type, skip = 4)
  refHours <- as.data.frame(refHours)
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

print("Cleaning supporting data")
options(warn = -1)
resMFT <- getWorkedHoursData("Male Full-Time")
resMPT <- getWorkedHoursData("Male Part-Time")
resFFT <- getWorkedHoursData("Female Full-Time")
resFPT <- getWorkedHoursData("Female Part-Time")
options(warn = 0)

distribHoursMFT <- resMFT[[1]]
distribHoursMPT <- resMPT[[1]]
distribHoursFFT <- resFFT[[1]]
distribHoursFPT <- resFPT[[1]]

meanHoursMFT <- resMFT[[2]]
meanHoursMFT$mean <- as.numeric(meanHoursMFT$mean)
meanHoursMPT <- resMPT[[2]]
meanHoursMPT$mean <- as.numeric(meanHoursMPT$mean)
meanHoursFFT <- resFFT[[2]]
meanHoursFFT$mean <- as.numeric(meanHoursFFT$mean)
meanHoursFPT <- resFPT[[2]]
meanHoursFPT$mean <- as.numeric(meanHoursFPT$mean)

distribHours <- data.frame(MFT = distribHoursMFT, MPT = distribHoursMPT,
                          FFT = distribHoursFFT, FPT = distribHoursFPT)
distribHours <- distribHours  %>% mutate_all(function(x) signif(x, sig_figs))
print("Writing outputs...")
write.table(distribHours,paste(folderOut,"distribHours.csv",sep = ""),row.names = F,sep = ",")

write.table(meanHoursMFT,paste(folderOut,"meanHoursMFT.csv",sep = ""),row.names = F,sep = ",")
write.table(meanHoursMPT,paste(folderOut,"meanHoursMPT.csv",sep = ""),row.names = F,sep = ",")
write.table(meanHoursFFT,paste(folderOut,"meanHoursFFT.csv",sep = ""),row.names = F,sep = ",")
write.table(meanHoursFPT,paste(folderOut,"meanHoursFPT.csv",sep = ""),row.names = F,sep = ",")

print("End of raw_to_prepared_Income")