library(fitdistrplus)

inputFolder <- "Data/hs/"

# Load Health Surveys
HSE <- read.table(paste(inputFolder,"hse_2019_eul_20211006.tab",sep = ""), sep="\t", header=TRUE)
HSWa <- read.table(paste(inputFolder,"whs_2015_adult_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSWc <- read.table(paste(inputFolder,"whs_2015_child_archive_v1.tab",sep = ""), sep="\t", header=TRUE)
HSS <- read.table(paste(inputFolder,"shes19i_eul.tab",sep = ""), sep="\t", header=TRUE)

subset <- data.frame(age = HSE$Age35g, sex = HSE$Sex, origin = HSE$origin2,
                     weight = HSE$Weight, height = HSE$Height, bmi = HSE$BMI)

subsetW

subsetS

# preparation
subsubset <- subset[subset$origin > 0 & subset$bmi > 0,] #remove non recorded values
subsubset$origin <- factor(subsubset$origin)
subsubset$sex <- factor(subsubset$sex)
subsetF <- subsubset[subsubset$sex == 2,]
subsetM <- subsubset[subsubset$sex == 1,]


### Spread per sex and 4 ethnic categories (last two merged)
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

xF4 <- c(xF4,xF5)
xM4 <- c(xM4,xM5)
yF4 <- c(yF4,yF5)
yM4 <- c(yM4,yM5)

fitF4 <- lm(yF4 ~ poly(xF4, 3, raw=TRUE))
fitM4 <- lm(yM4 ~ poly(xM4, 3, raw=TRUE))

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

### Drawing function

varData <- rep(NA,8)

subsubset$origin[subsubset$origin == 5] <- 4
for(i in 1:2){
  for(j in 1:4){
    varData[(i-1)*4+j] <- var(subsubset$bmi[subsubset$sex == i & subsubset$origin == j],na.rm = T)
  }
}

findBMI <- function(age,sex,origin,dMean,varData){
  if(age < 16){
    res <- NA
  }else{
    if(sex == 2){
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
  return(res)
}

findBMI(44,2,2,dMean,varData)

### Application to the datasets

applyBMI <- function(i,inputData,dMean,varData){
  age <- inputData$age[i]
  sex <- inputData$sex[i]
  origin <- inputData$ethnicity[i]
  return(findBMI(age,sex,origin,dMean,varData))
}

minBMI <- min(subsubset$bmi)

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


