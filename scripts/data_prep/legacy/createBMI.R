library(ggplot2)
library(fitdistrplus)

# Health Survey for England 2019 only accessible after registration to the UK data service
hse19 <- read.table("data/UKDA-8860-tab/tab/hse_2019_eul_20211006.tab",head = T,sep = "\t")

subset <- data.frame(age = hse19$Age35g, sex = hse19$Sex, origin = hse19$origin2,
                     soc10 = hse19$HRPSOC10B, nssec = hse19$nssec5, salary = hse19$srcin01d,
                     weight = hse19$Weight, height = hse19$Height, bmi = hse19$BMI)

hist(subset$age)
hist(subset$height)
hist(subset$weight)

# preparation
subset$nssec[subset$nssec == 99] <- 0
subset$sex <- subset$sex - 1

subsubset <- subset[subset$origin > 0 & subset$nssec >= 0 & subset$bmi >0,] #remove non recorded values
subsubset$nssec <- factor(subsubset$nssec)
subsubset$origin <- factor(subsubset$origin)
subsubset$sex <- factor(subsubset$sex)
subsetF <- subsubset[subsubset$sex == 1,] # Note: this is opposite to the SPC
subsetM <- subsubset[subsubset$sex == 0,]


### Spread per sex and 5 ethnic categories
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

gF1 <- ggplot(data.frame(age = xF1,bmi = yF1,fitted = fitted(fitF1)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 2, size = 2)

gF2 <- ggplot(data.frame(age = xF2,bmi = yF2,fitted = fitted(fitF2)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 2, size = 2)

gF3 <- ggplot(data.frame(age = xF3,bmi = yF3,fitted = fitted(fitF3)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 2, size = 2)

gF4 <- ggplot(data.frame(age = xF4,bmi = yF4,fitted = fitted(fitF4)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 2, size = 2)

gF5 <- ggplot(data.frame(age = xF5,bmi = yF5,fitted = fitted(fitF5)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 2, size = 2)

gM1 <- ggplot(data.frame(age = xM1,bmi = yM1,fitted = fitted(fitM1)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 4, size = 2)

gM2 <- ggplot(data.frame(age = xM2,bmi = yM2,fitted = fitted(fitM2)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 4, size = 2)
 
gM3 <- ggplot(data.frame(age = xM3,bmi = yM3,fitted = fitted(fitM3)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 4, size = 2)

gM4 <- ggplot(data.frame(age = xM4,bmi = yM4,fitted = fitted(fitM4)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 4, size = 2)

gM5 <- ggplot(data.frame(age = xM5,bmi = yM5,fitted = fitted(fitM5)), aes(age, bmi)) + geom_point() +
       geom_line(aes(age,fitted), col = 4, size = 2)

multiplot(gF1,gM1,gF2,gM2,gF3,gM3,gF4,gM4,gF5,gM5,cols = 5)


### Spread per sex and 4 ethnic categories (last two merged)
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

gF1 <- ggplot(data.frame(age = xF1,bmi = yF1,fitted = fitted(fitF1)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF2 <- ggplot(data.frame(age = xF2,bmi = yF2,fitted = fitted(fitF2)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF3 <- ggplot(data.frame(age = xF3,bmi = yF3,fitted = fitted(fitF3)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF4 <- ggplot(data.frame(age = xF4,bmi = yF4,fitted = fitted(fitF4)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gM1 <- ggplot(data.frame(age = xM1,bmi = yM1,fitted = fitted(fitM1)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM2 <- ggplot(data.frame(age = xM2,bmi = yM2,fitted = fitted(fitM2)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM3 <- ggplot(data.frame(age = xM3,bmi = yM3,fitted = fitted(fitM3)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM4 <- ggplot(data.frame(age = xM4,bmi = yM4,fitted = fitted(fitM4)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

multiplot(gF1,gM1,gF2,gM2,gF3,gM3,gF4,gM4,cols = 4)


### More detailed analysis of variance per age (in year)

# Visualisation and fitting of a simple gamma distribution
sampleT <- which(subsubset$age == 10)
sampleT <- which(xF1 == 32)
yTest <- subsubset$bmi[sampleT]
hist(yTest,breaks = 30)

fit <- fitdist(yTest, distr = "gamma", method = "mle")
plot(fit)

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

# Tests and visualisation per sex and ethnic category
test <- findFits(xF1,yF1)
plot(test[[1]],test[[2]])
lines(test[[1]],fitted(test[[4]]),col = 2,lwd=2)
plot(test[[1]],test[[3]])
lines(test[[1]],fitted(test[[5]]),col = 2,lwd=2)

test <- findFits(xF1,yF1)
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gF1S <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 2, size = 2)
gF1R <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 2, size = 2)

test <- findFits2(xF2,yF2)
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gF2S <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 2, size = 2)
gF2R <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 2, size = 2)

test <- findFits2(xF3,yF3)
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gF3S <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 2, size = 2)
gF3R <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 2, size = 2)

test <- findFits2(xF4,yF4)
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gF4S <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 2, size = 2)
gF4R <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 2, size = 2)

multiplot(gF1S,gF1R,gF2S,gF2R,gF3S,gF3R,gF4S,gF4R,cols = 4)

# Tests and visualisation per sex only
test <- findFits(c(xF1,xF2,xF3,xF4),c(yF1,yF2,yF3,yF4))
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gFTS <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 2, size = 2)
gFTR <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 2, size = 2)

test <- findFits2(c(xM1,xM2,xM3,xM4),c(yM1,yM2,yM3,yM4))
df <- data.frame(age = test[[1]], shape = test[[2]], rate = test[[3]], fitS = fittedRand3(test[[1]],test[[4]]), fitR = fittedRand3(test[[1]],test[[5]]))
gMTS <- ggplot(df,aes(age,shape)) + geom_point() + geom_line(aes(age,fitS),col = 4, size = 2)
gMTR <- ggplot(df,aes(age,rate)) + geom_point() + geom_line(aes(age,fitR),col = 4, size = 2)

multiplot(gFTS,gMTS,gFTR,gMTR, cols = 2)


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

# Variance per ethnicity/sex
varData <- rep(NA,8)

subsubset$origin[subsubset$origin == 5] <- 4
for(i in 0:1){
  for(j in 1:4){
    varData[i*4+j] <- var(subsubset$bmi[subsubset$sex == (1-i) & subsubset$origin == j],na.rm = T)
  }
}


### Drawing function

findBMI <- function(age,sex,origin,dMean,varData){
  if(age < 16){
    res <- NA
  }else{
    if(sex == 0){
      #v <- c(fitted3(age,dVariance$female[1],dVariance$female[2],dVariance$female[3],dVariance$female[4]),
      #       fitted3(age,dVariance$female[5],dVariance$female[6],dVariance$female[7],dVariance$female[8])
      #)
      if(origin == 1){
        m <- fitted3(age,dMean$F1[1],dMean$F1[2],dMean$F1[3],dMean$F1[4])
        v <- varData[1]
      }else if(origin == 2){
        m <- fitted3(age,dMean$F2[1],dMean$F2[2],dMean$F2[3],dMean$F2[4])
        v <- varData[2]
      }else if(origin == 3){
        m <- fitted3(age,dMean$F3[1],dMean$F3[2],dMean$F3[3],dMean$F3[4])
        v <- varData[3]
      }else if(origin == 4 | origin == 5){
        m <- fitted3(age,dMean$F4[1],dMean$F4[2],dMean$F4[3],dMean$F4[4])
        v <- varData[4]
      }
    }else {
      #v <- c(fitted3(age,dVariance$male[1],dVariance$male[2],dVariance$male[3],dVariance$male[4]),
      #       fitted3(age,dVariance$male[5],dVariance$male[6],dVariance$male[7],dVariance$male[8])
      #)
      if(origin == 1){
        m <- fitted3(age,dMean$M1[1],dMean$M1[2],dMean$M1[3],dMean$M1[4])
        v <- varData[5]
      }else if(origin == 2){
        m <- fitted3(age,dMean$M2[1],dMean$M2[2],dMean$M2[3],dMean$M2[4])
        v <- varData[6]
      }else if(origin == 3){
        m <- fitted3(age,dMean$M3[1],dMean$M3[2],dMean$M3[3],dMean$M3[4])
        v <- varData[7]
      }else if(origin == 4 | origin == 5){
        m <- fitted3(age,dMean$M4[1],dMean$M4[2],dMean$M4[3],dMean$M4[4])
        v <- varData[8]
      }
    }
    res <- rgamma(1,m*m/v,m/v) # The gamma fit is scaled so that the mean is equal to the expected mean for that ethnicity, sex and age according to the global distribution and variance for ethnicity and sex only
  }
  return(res)
}

findBMI(32,0,1,dMean,varData)
findBMI(12,0,1,dMean,varData)


### Application to the datasets


applyBMI <- function(i,inputData,dMean,varData){
  age <- inputData$age[i]
  sex <- inputData$sex[i]
  origin <- inputData$origin[i]
  return(findBMI(age,sex,origin,dMean,varData))
}

countyList <- c("bedfordshire","berkshire","bristol","buckinghamshire","cambridgeshire","cheshire","cornwall",
                "cumbria","derbyshire","devon","dorset","durham","east-sussex","east-yorkshire-with-hull","essex","gloucestershire",
                "greater-london","greater-manchester","hampshire","herefordshire","hertfordshire","isle-of-wight","kent","lancashire",
                "leicestershire","lincolnshire","merseyside","norfolk","north-yorkshire","northamptonshire","northumberland",
                "nottinghamshire","oxfordshire","rutland","shropshire","somerset","south-yorkshire","staffordshire","suffolk","surrey",
                "tyne-and-wear","warwickshire","west-midlands","west-sussex","west-yorkshire","wiltshire","worcestershire"
                )
  
for(i in countyList[1]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}

mean(inputData$bmiNew,na.rm = T)
mean(subsubset$bmi)

controlM <- rep(NA,10)
dataSpreadM <- rep(NA,10)
controlV <- rep(NA,10)
dataSpreadV <- rep(NA,10)
size <- rep(NA,10)
for(i in 0:1){
  for(j in 1:5){
    controlM[i*5+j] <- mean(subsubset$bmi[subsubset$sex == (1-i) & subsubset$origin == j],na.rm = T)
    dataSpreadM[i*5+j] <- mean(inputData$bmiNew[inputData$sex == i & inputData$origin == j],na.rm = T)
    controlV[i*5+j] <- var(subsubset$bmi[subsubset$sex == (1-i) & subsubset$origin == j],na.rm = T)
    dataSpreadV[i*5+j] <- var(inputData$bmiNew[inputData$sex == i & inputData$origin == j],na.rm = T)
    size[i*5+j] = length(inputData$bmiNew[inputData$sex == i & inputData$origin == j])
  }
}

df <- data.frame(ControlMean = controlM, ControlVar = controlV, DataMean = dataSpreadM, DataVar = dataSpreadV,size,
                 diag = seq(3,30,3), diag2 = seq(5,50,5))

cor(controlM[c(1:4,6:9)],dataSpreadM[c(1:4,6:9)])
cor(controlV[c(1:4,6:9)],dataSpreadV[c(1:4,6:9)])

var(controlM)

g1 <- ggplot(df,aes(ControlMean,DataMean)) + geom_point() + geom_line(aes(diag,diag))
g2 <- ggplot(df,aes(ControlVar,DataVar)) + geom_point() + geom_line(aes(diag2,diag2))

multiplot(g1,g2,cols = 2)

i = countyList[1]

dataF <- inputData[inputData$sex == 0 & !is.na(inputData$bmiNew),]
dataM <- inputData[inputData$sex == 1 & !is.na(inputData$bmiNew),]

for(i in 1:4){
  aF <- dataF$age[dataF$origin == i]
  aM <- dataM$age[dataM$origin == i]
  bF <- dataF$bmiNew[dataF$origin == i]
  bM <- dataM$bmiNew[dataM$origin == i]
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

gF1 <- ggplot(data.frame(age = xF1,bmi = yF1,fitted = fitted(fitF1)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF2 <- ggplot(data.frame(age = xF2,bmi = yF2,fitted = fitted(fitF2)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF3 <- ggplot(data.frame(age = xF3,bmi = yF3,fitted = fitted(fitF3)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gF4 <- ggplot(data.frame(age = xF4,bmi = yF4,fitted = fitted(fitF4)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 2, size = 2) + ylim(15, 60)

gM1 <- ggplot(data.frame(age = xM1,bmi = yM1,fitted = fitted(fitM1)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM2 <- ggplot(data.frame(age = xM2,bmi = yM2,fitted = fitted(fitM2)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM3 <- ggplot(data.frame(age = xM3,bmi = yM3,fitted = fitted(fitM3)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

gM4 <- ggplot(data.frame(age = xM4,bmi = yM4,fitted = fitted(fitM4)), aes(age, bmi)) + geom_point() +
  geom_line(aes(age,fitted), col = 4, size = 2) + ylim(15, 60)

multiplot(gF1,gM1,gF2,gM2,gF3,gM3,gF4,gM4,cols = 4)
dev.off()

for(i in countyList[2:10]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}

for(i in countyList[11:20]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}

for(i in countyList[21:30]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}

for(i in countyList[31:40]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}

for(i in countyList[41:47]){
  inputData <- read.csv(paste("/Users/hsalat/SPC_Income/output/new2/tus_hse_",i,".csv",sep = ""))
  bmi <- sapply(1:nrow(inputData), function(x){applyBMI(x,inputData,dMean,varData)})
  inputData$bmiNew <- bmi
  write.table(inputData,paste("output/pop_",i,".csv",sep=""),row.names = F,sep=",")
}
  

#########################
#########################
##### Sub-functions #####
#########################
#########################


fittedRand3 <- function(x,fit){
  coef <- c(fit$coefficient[1],fit$coefficient[2],fit$coefficient[3],fit$coefficient[4])
  coef[is.na(coef)] <- 0
  res <- sapply(x,function(y){coef[1]+coef[2]*y+coef[3]*y*y+coef[4]*y*y*y})
  return(unname(res))
} # fits an order 3 polynomial to a vector from a lm fit object

fitted3 <- function(x,a0,a1,a2,a3){
  coef <- c(a0,a1,a2,a3)
  coef[is.na(coef)] <- 0
  res <- sapply(x,function(y){coef[1]+coef[2]*y+coef[3]*y*y+coef[4]*y*y*y})
  return(unname(res))
} # fits an order 3 polynomial to a vector from 4 coefficients

multiplot <- function(..., plotlist=NULL, file, cols=1, layout=NULL) {
  require(grid)
  
  # Make a list from the ... arguments and plotlist
  plots <- c(list(...), plotlist)
  
  numPlots = length(plots)
  
  # If layout is NULL, then use 'cols' to determine layout
  if (is.null(layout)) {
    # Make the panel
    # ncol: Number of columns of plots
    # nrow: Number of rows needed, calculated from # of cols
    layout <- matrix(seq(1, cols * ceiling(numPlots/cols)),
                     ncol = cols, nrow = ceiling(numPlots/cols))
  }
  
  if (numPlots==1) {
    print(plots[[1]])
    
  } else {
    # Set up the page
    grid.newpage()
    pushViewport(viewport(layout = grid.layout(nrow(layout), ncol(layout))))
    
    # Make each plot, in the correct location
    for (i in 1:numPlots) {
      # Get the i,j matrix positions of the regions that contain this subplot
      matchidx <- as.data.frame(which(layout == i, arr.ind = TRUE))
      
      print(plots[[i]], vp = viewport(layout.pos.row = matchidx$row,
                                      layout.pos.col = matchidx$col))
    }
  }
}


################
################
##### Bin #####
################
################


library(MatchIt)
library(lmtest)
library(sandwich)

match_obj <- matchit(bmi ~ sex + age + origin + nssec,
                     data = subsubset, method = "nearest", distance ="glm",
                     ratio = 1,
                     replace = FALSE)
summary(match_obj)


fit <- glm(bmi ~ sex + age + origin + nssec, data = subsubset)
plot(subsubset$bmi,fitted(fit))
cor(subsubset$bmi,fitted(fit))

fit <- glm(bmi ~ sex + age + origin, data = subsubset,link = log)
plot(subsubset$bmi,fitted(fit))
cor(subsubset$bmi,fitted(fit))