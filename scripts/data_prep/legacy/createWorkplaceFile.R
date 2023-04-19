library(ggplot2)
library(dplyr)
library(rgdal)
library(rgeos)
library(raster)
library(sp)
library(foreign)
#library(reshape2)


### REQUIRED: UK Business Counts - local units by industry and employment size band (https://www.nomisweb.co.uk/datasets/idbrlu)
### REQUIRED: Employment survey (https://www.nomisweb.co.uk/datasets/apsnew)
### OUTDATED? Look Up tables for employment specific geographies


######################################################################
####### #Employees per business unit at national level (NOMIS) #######
######################################################################


####### Data is per industry sic2017 "section" (21 categories), summing all (checks only)

tot <- read.csv("data/EnglandAll.csv",skip = 8)

nat <- data.frame(real = rowSums(tot[1:9,3:23]))
nat$mid <- c((4-0)/2,5+(9-5)/2,10+(19-10)/2,20+(49-20)/2,50+(99-50)/2,100+(249-100)/2,250+(499-250)/2,500+(999-500)/2,1000+(2000-1000)/2) # 2000 as upper limit is arbitrary

# 1/x fit
fit <- lm(log(nat$real) ~ log(nat$mid))
nat$fit <-exp(fitted(fit))

# Plot: real values vs 1/x fit
ggplot(nat, aes(x=mid, y=real)) + geom_line(color="black",size=2,alpha=0.6) + 
                                  geom_line(aes(x=mid, y=fit),color = 5) +
                                  ylab("Number of business units") + xlab("Number of employees") +
                                  ggtitle("National distribution of business unit sizes")


####################
####### Data #######
####################


####### #Business units per employee size band at MSOA level and per business sic2017 2d division (89 categories)
loadNBus <- function(name){
  temp <- read.csv(paste("data/England",name,"MSOA.csv",sep=""),skip = 8)  # <--- UK Business Counts
  temp <- temp[which(!(temp$X2011.super.output.area...middle.layer == "" | temp$X2011.super.output.area...middle.layer == "Column Total")),2:ncol(temp)]
  colnames(temp)[1] <- "MSOA11CD"
  temp <- temp[order(temp$MSOA11CD),]
  rownames(temp) <- 1:6791
  return(temp)
}

E0to9 <- loadNBus("0-9")
E10to49 <- loadNBus("10-49")
E50to249 <- loadNBus("50-249")
E250p <- loadNBus("250p")

ref <- c("E0to9" ,"E10to49","E50to249","E250p")

# Merging into one dataset
msoaData <- data.frame(catTemp = NA, band = NA, MSOA11CD = NA, refTemp=NA)
for(i in 1:4){
  temp2 <- get(ref[i])
  for(j in 1:nrow(temp2)){
    for(k in 2:ncol(temp2)){
      if(temp2[j,k]>0){
        temp3 <- data.frame(catTemp = rep(k-1,temp2[j,k]) , band = i, MSOA11CD = temp2$MSOA11CD[j], refTemp = 1:temp2[j,k])
        msoaData <- rbind(msoaData,temp3)
      }
    }
  }
}


#######  #Employees at LSOA level per business sic2017 2d division (89 categories)

loadlsoa <- function(name){
  temp <- read.csv(paste("data/England",name,".csv",sep=""),skip = 8) # <--- Employment Survey
  temp <- temp[which(!(temp$X2011.super.output.area...lower.layer == "" | temp$X2011.super.output.area...lower.layer == "Column Total" | temp$X2011.super.output.area...lower.layer == "*")),2:ncol(temp)]
  colnames(temp)[1] <- "LSOA11CD"
  temp <- temp[order(temp$LSOA11CD),]
  rownames(temp) <- 1:nrow(temp)
  temp <- temp[,c(1,seq(2,177,by=2))]
  return(temp)
}

EELlsoa <- loadlsoa("EastandLondonLSOA")
ENlsoa <- loadlsoa("NorthLSOA")
ESlsoa <- loadlsoa("SouthLSOA")
EWlsoa <- loadlsoa("WestLSOA")

# Merging into one dataset
lsoaData <- rbind(EELlsoa,ENlsoa,ESlsoa,EWlsoa)


####### look up tables: MSOA/LSOA and industry sic2017 categories

lookUp <- read.csv("data/Output_Area_to_Local_Authority_District_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Enterprise_Partnership__April_2020__Lookup_in_England.csv")
lookUp <- lookUp[,c("LSOA11CD","MSOA11CD")]
lookUp <- lookUp %>% distinct()

temp <- c(rep(1,3),rep(2,5),rep(3,24),rep(4,1),rep(5,4),rep(6,3),rep(7,3),rep(8,5),rep(9,2),rep(10,6),
          rep(11,3),rep(12,1),rep(13,7),rep(14,6),rep(15,1),rep(16,1),rep(17,3),rep(18,4),rep(19,3),rep(20,2),
          rep(21,1))

refIC <- data.frame(sic1d07 = temp, sic2d07 = c(1:3,5:9,10:33,35,36:39,41:43,45:47,49:53,55:56,58:63,64:66,68,69:75,77:82,84,85,86:88,90:93,94:96,97:98,99),
                    sic2d07Ref = 1:88
                    )


####### Assembling the puzzle: register of business units in England

busPop <- merge(msoaData,refIC,by.x="catTemp",by.y="sic2d07Ref")

# 'id' field

temp1 <- as.character(busPop$sic2d07)
for(i in 1:length(temp1)){
  if(nchar(temp1[i]) < 2){
    temp1[i] <- paste("0",temp1[i],sep="")
  }
}

temp2 <- as.character(busPop$refTemp)
for(i in 1:length(temp2)){
  if(nchar(temp2[i]) == 1){
    temp2[i] <- paste("000",temp2[i],sep="")
  }else if(nchar(temp2[i]) == 2){
    temp2[i] <- paste("00",temp2[i],sep="")
  }else if(nchar(temp2[i]) == 3){
    temp2[i] <- paste("0",temp2[i],sep="")
  }
}

busPop$id <- paste(busPop$MSOA11CD,busPop$band,temp1,temp2,sep="")

busPop <- busPop[,c(7,2,3,5,6)]
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

# 'size' field

BUsize <- function(n,band){
  if(band == 1){
    x <- 1:9
  }else if(band == 2){
    x <- 10:49
  }else if(band == 3){
    x <- 50:249
  }else{
    x <- 250:1500
  }
  return(sample(x, n, replace = T, prob = fit$coefficients[1]*(x^fit$coefficients[2])))
}

busPop$size <- mapply(BUsize,1,busPop$band)
busPop <- busPop[,c(1,6,3:5)]

# hist(busPop$size)
# sum(busPop$size)
# sum(lsoaData[2:89])

# 'lsoa' field

busPop2 <- merge(busPop,refIC,by.x="sic2d07",by.y="sic2d07")
lsoaData2 <- merge(lsoaData,lookUp,by.x="LSOA11CD",by.y="LSOA11CD")

busPop3 <- busPop2
busPop2 <- busPop3

msoaFilling <- function(name,busPop2){
  lsoa <- lsoaData2 %>% filter(MSOA11CD == name)
  for(i in 1:88){
    ref <- which(busPop2$MSOA11CD == name & busPop2$sic2d07Ref == i)
    weights <- lsoa[,i+1]
    if(sum(weights > 0)){
      busPop2$LSOA11CD[ref] <- sample(lsoa$LSOA11CD, length(ref), replace = T, prob = weights)
    }else{
      busPop2$LSOA11CD[ref] <- sample(lsoa$LSOA11CD, length(ref), replace = T)
    }
  }
  return(busPop2)
}

busPop2$LSOA11CD <- NA

for(i in unique(busPop2$MSOA11CD)){
  busPop2 <- msoaFilling(i,busPop2)
}

# 'lng' and 'lat' fields

shp <- readOGR("data/LSOA_shp/Lower_Layer_Super_Output_Areas__December_2011__Boundaries_Full_Clipped__BFC__EW_V3.shp")
refLSOA <- data.frame(LSOA11CD = shp@data$LSOA11CD, lng = shp@data$LONG_, lat = shp@data$LAT)

busPop2 <- merge(busPop2,refLSOA,by.x = "LSOA11CD",by.y = "LSOA11CD")

busPop <- busPop2[,c(3,4,5,1,9,10,6,2)]
colnames(busPop)[7] <- "sic1d07"
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

write.table(busPop,"output/businessRegistry.csv",sep=",",row.names = F)
