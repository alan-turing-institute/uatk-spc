library(dplyr)
library(tidyr)
library(rgdal)
library(sp)
library(foreign)
library(reshape2)
library(readr)
library(stringr)
#library(ggplot2)

folderIn <- "Data/dl/"
folderOut <- "Data/prepData/"
APIKey <- Sys.getenv("NOMIS_API_KEY")

set.seed(14101066)

createURL <- function(dataset,geogr,APIKey,date,other){
  url <- paste("https://www.nomisweb.co.uk/api/v01/dataset/",dataset,".data.csv?uid=",APIKey,"&geography=",geogr,"&date=",date,other,sep = "")
  return(url)
}

print("Creating Business Registry...")


#############################################################
####### Employees per business unit at national level #######
#############################################################


# Get UK Business Counts - local units by industry and employment size band per industry sic2017 "section" (21 categories), summing all (https://www.nomisweb.co.uk/datasets/idbrlu)
datasetBR <- "NM_141_1"

# Download
geogr <- "2092957699"
date<- "latestMINUS2"
other <- "&industry=150994945...150994965&employment_sizeband=1...9&legal_status=0&measures=20100&select=industry_name,employment_sizeband_name,obs_value&rows=employment_sizeband_name&cols=industry_name"
url <- createURL(datasetBR,geogr,APIKey,date,other)
download.file(url,destfile = paste(folderIn,"data_workplaces_1.csv",sep=""))

# Load data and clean
data <- read.csv(paste(folderIn,"data_workplaces_1.csv",sep=""))
data <- data[c(1,7,2,5,8,3,6,9,4),]
row.names(data) <- 1:nrow(data)

# 1/x fit
nat <- data.frame(real = rowSums(data[,2:22]))
nat$mid <- c((4-0)/2,5+(9-5)/2,10+(19-10)/2,20+(49-20)/2,50+(99-50)/2,100+(249-100)/2,250+(499-250)/2,500+(999-500)/2,1000+(2000-1000)/2) # 2000 as upper limit is arbitrary
fit <- lm(log(nat$real) ~ log(nat$mid))
nat$fit <-exp(fitted(fit))

# CHECK: real values vs 1/x fit
#ggplot(nat, aes(x=mid, y=real)) + geom_line(color="black",size=2,alpha=0.6) + 
#  geom_line(aes(x=mid, y=fit),color = 5) +
#  ylab("Number of business units") + xlab("Number of employees") +
#  ggtitle("National distribution of business unit sizes")


########################################################################################################################
####### Business units per employee size band at MSOA level and per business sic2017 2d division (89 categories) #######
########################################################################################################################


# Get UK Business Counts - local units by industry and employment size band (https://www.nomisweb.co.uk/datasets/idbrlu)

print("Downloading and preparing MSOA data...")

# Download
geogrMSOA <- read.csv("raw_to_prepared_MSOA-IZ_list_for_nomis.txt")
geogrMSOA <- geogrMSOA$MSOA11CD
geogrMSOA <- paste(geogrMSOA,collapse=",")
date<- "latestMINUS2"

downloadBR <- function(size){
  other <- paste("&industry=146800641...146800643,146800645...146800673,146800675...146800679,146800681...146800683,146800685...146800687,146800689...146800693,146800695,146800696,146800698...146800706,146800708...146800715,146800717...146800722,146800724...146800728,146800730...146800739&employment_sizeband=",size,"&legal_status=0&measures=20100&select=geography_code,industry_code,obs_value&rows=geography_code&cols=industry_code",sep="")
  url <- createURL(datasetBR,geogrMSOA,APIKey,date,other)
  if(!file.exists(paste(folderIn,"data_BR_",size,".csv",sep=""))){
    download.file(url,destfile = paste(folderIn,"data_BR_",size,".csv",sep=""))
  } else{
    print(paste(paste(folderIn,"data_BR_",size,".csv",sep="")," already exists, not downloading again",sep = ""))
  }
  data <- read.csv(paste(folderIn,"data_BR_",size,".csv",sep=""))
  colnames(data)[1] <- "MSOA11CD"
  data <- data[order(data$MSOA11CD),]
  rownames(data) <- 1:nrow(data)
  return(data)
}

E0to9 <- downloadBR(10)
E10to49 <- downloadBR(20)
E50to249 <- downloadBR(30)
E250p <- downloadBR(40)

# Melt into full list of existing workplaces
meltedData <- function(size){
  ifelse(size == 10, melted <- melt(E0to9), ifelse(size == 20, melted <- melt(E10to49), ifelse(size == 30, melted <- melt(E50to249), melted <- melt(E250p))))
  melted <- melted %>% filter(value > 0)
  refTemp <- unlist(sapply(melted$value,function(x){1:x}))
  melted <- melted %>% uncount(value)
  melted$band <- size
  melted$refTemp <- refTemp
  return(melted)
}

msoaData <- rbind(meltedData(10),meltedData(20),meltedData(30),meltedData(40))
msoaData$variable <- as.numeric(substr(msoaData$variable,2,3))


########################################################################################
####### Employees at LSOA level per business sic2017 2d division (89 categories) #######
########################################################################################


# Get Business Register and Employment Survey (https://www.nomisweb.co.uk/datasets/newbrespub)
datasetES <- "NM_172_1"

print("Downloading and preparing LSOA data...")

# Download
if(!file.exists(paste(folderOut,"lsoaData.csv",sep = ""))){
  geogrLSOA <- read.csv("raw_to_prepared_LSOA-DZ_list_for_nomis.txt")
  geogrLSOA <- geogrLSOA$LSOA11CD
  l <- length(geogrLSOA)
  date<- "latest"
  other <- "&industry=146800641...146800643,146800645...146800673,146800675...146800679,146800681...146800683,146800685...146800687,146800689...146800693,146800695,146800696,146800698...146800706,146800708...146800715,146800717...146800722,146800724...146800728,146800730...146800739&employment_status=1&measure=1&measures=20100&select=geography_code,industry_code,obs_value&rows=geography_code&cols=industry_code"
  geogrLSOA2 <- paste(geogrLSOA[1:1000],collapse=",")
  url <- createURL(datasetES,geogrLSOA2,APIKey,date,other)
  download.file(url,destfile = paste(folderIn,"data_workplaces_2.csv",sep=""))
  data <- read.csv(paste(folderIn,"data_workplaces_2.csv",sep=""))
  for(i in 1:22){
    geogrLSOA2 <- paste(geogrLSOA[(i*1000 + 1):min(i*1000 + 1000,l)],collapse=",")
    url <- createURL(datasetES,geogrLSOA2,APIKey,date,other)
    download.file(url,destfile = paste(folderIn,"data1.csv",sep=""))
    data1 <- read.csv(paste(folderIn,"data1.csv",sep=""))
    data <- rbind(data,data1)
  }
  colnames(data)[1] <- "LSOA11CD"
  lsoaData <- data[order(data$LSOA11CD),]
  rownames(lsoaData) <- 1:nrow(lsoaData)
  write.table(lsoaData,paste(folderOut,"lsoaData.csv",sep = ""),row.names = F,sep = ",")
} else{
  print(paste(paste(folderOut,"lsoaData.csv",sep = "")," already exists, loading directly",sep = ""))
  lsoaData <- read.csv(paste(folderOut,"lsoaData.csv",sep = ""))
}


#########################################################################
####### look up tables: MSOA/LSOA and industry sic2017 categories #######
#########################################################################


oatoOther <- read.csv(paste(folderOut,"lookUp-GB.csv",sep = ""))
# If raw_to_prepared.R hasn't been run:
#download.file("https://opendata.arcgis.com/api/v3/datasets/e8fef92ac4114c249ffc1ff3ccf22e12_0/downloads/data?format=csv&spatialRefId=4326&where=1%3D1",destfile = paste(folderIn,"Output_Area_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Authority_District_(December_2020)_Lookup_in_England_and_Wales.csv",sep = ""))
#oatoOther <- read.csv(paste(folderIn,"Output_Area_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Authority_District_(December_2020)_Lookup_in_England_and_Wales.csv",sep = ""))
oatoOther <- oatoOther[,c("LSOA11CD","MSOA11CD")]
oatoOther <- oatoOther %>% distinct()

temp <- c(rep("A",3),rep("B",5),rep("C",24),rep("D",1),rep("E",4),rep("F",3),rep("G",3),rep("H",5),rep("I",2),rep("J",6),
          rep("K",3),rep("L",1),rep("M",7),rep("N",6),rep("O",1),rep("P",1),rep("Q",3),rep("R",4),rep("S",3),rep("T",2),
          rep("U",1))

refIC <- data.frame(sic1d07 = temp, sic2d07 = c(1:3,5:9,10:33,35,36:39,41:43,45:47,49:53,55:56,58:63,64:66,68,69:75,77:82,84,85,86:88,90:93,94:96,97:98,99))


#################################################################
####### Assembling the puzzle: register of business units #######
#################################################################


busPop <- merge(msoaData,refIC,by.x="variable",by.y="sic2d07")
colnames(busPop)[1] <- "sic2d07"

# 'id' field
temp1 <- str_pad(busPop$sic2d07, 2, pad = "0")
temp2 <- str_pad(busPop$refTemp, max(nchar(busPop$refTemp)), pad = "0")
busPop$id <- paste(busPop$MSOA11CD,busPop$band,temp1,temp2,sep="")
busPop <- busPop[,c(6,2,3,5,1)]
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

# 'size' field
print("Recalculating business sizes...")
BUsize <- function(n,band){
  ifelse(band == 10, x <- 1:9, ifelse(band == 20, x <- 10:49, ifelse(band == 30, x <- 50:249, x <- 250:2000)))
  return(sample(x, n, replace = T, prob = fit$coefficients[1]*(x^fit$coefficients[2])))
}
busPop$size <- mapply(BUsize,1,busPop$band)
busPop <- busPop[,c(1,6,2,4:5)]
#hist(busPop$size[busPop$size < 60])

# 'lsoa' field
print("Assigning LSOAs...")
lsoaData <- merge(lsoaData,oatoOther,by.x="LSOA11CD",by.y="LSOA11CD")
msoaFilling <- function(name,lsoaData,MSOA11CD,sic2d07){
  lsoa <- lsoaData %>% filter(MSOA11CD == name)
  ref <- which(MSOA11CD == name)
  sic <- sic2d07[ref]
  res <- rep(NA,length(ref))
  for(i in 1:length(unique(sic))){
    ref2 <- which(sic == unique(sic)[i])
    weights <- lsoa[,paste("X",str_pad(unique(sic)[i], 2, pad = "0"),sep = "")]
    potlsoa <- lsoa$LSOA11CD
    ifelse(sum(weights) > 0, res[ref2] <- sample(potlsoa, length(ref2), prob = weights, replace = T),
           res[ref2] <- sample(potlsoa, length(ref2), replace = T))
  }
  return(res)
}

LSOA11CD <- sapply(unique(busPop$MSOA11CD),function(x){msoaFilling(x,lsoaData,busPop$MSOA11CD,busPop$sic2d07)})
LSOA11CD <- unname(unlist(LSOA11CD))

#LSOA11CD <- msoaFilling(unique(busPop$MSOA11CD)[1],lsoaData,busPop$MSOA11CD,busPop$sic2d07)
#for(i in 2:length(unique(busPop$MSOA11CD))){
#  if(i%%80 == 0){print(paste(round(i/length(unique(busPop$MSOA11CD)),2)*100,"%",sep = ""))}
#  res <- msoaFilling(unique(busPop$MSOA11CD)[i],lsoaData,busPop$MSOA11CD,busPop$sic2d07)
#  LSOA11CD <- c(LSOA11CD,res)
#}

busPop$LSOA11CD <- LSOA11CD

# 'lng' and 'lat' fields
print("Adding coordinates...")

# England and Wales
#download.file("https://stg-arcgisazurecdataprod1.az.arcgis.com/exportfiles-1559-15693/Lower_layer_Super_Output_Areas_Dec_2011_Boundaries_Full_Clipped_BFC_EW_V3_2022_3601855424856006397.csv?sv=2018-03-28&sr=b&sig=tmZTl6Eh6ryGtEsEaHWPbp0GKF2SUcejnO1DeF7csk4%3D&se=2023-04-26T15%3A58%3A01Z&sp=r",destfile = paste(folderIn,"Lower_Layer_Super_Output_Areas__December_2011__Boundaries_Full_Clipped__BFC__EW_V3.csv",sep = ""))
shp <- read.csv(paste(folderIn,"LSOA_Dec_2011_PWC_in_England_and_Wales_2022.csv",sep = ""))
coords <- data.frame(LSOA11CD = shp$LSOA11CD, lng = shp$x, lat = shp$y)

# Scotland
download.file("https://maps.gov.scot/ATOM/shapefiles/SG_DataZoneCent_2011.zip",destfile = paste(folderIn,"SG_DataZoneCent_2011.zip",sep = ""))
unzip(paste(folderIn,"SG_DataZoneCent_2011.zip",sep = ""),exdir=folderIn)
coords2 <- read.dbf(paste(folderIn,"SG_DataZone_Cent_2011.dbf",sep = ""))
ukgrid = "+init=epsg:27700"
latlong = "+init=epsg:4326"
coords3 <- cbind(Easting = as.numeric(as.character(coords2$Easting)), Northing = as.numeric(as.character(coords2$Northing)))
coords3 <- SpatialPointsDataFrame(coords3, data = data.frame(coords2$DataZone), proj4string = CRS("+init=epsg:27700"))
coords3 <- spTransform(coords3, CRS(latlong))
#plot(coords3)
coords3 <- coords3@coords
coords3 <- data.frame(LSOA11CD = coords2$DataZone, lng = coords3[,1], lat = coords3[,2])

refLSOA <- rbind(coords,coords3)
busPop <- merge(busPop,refLSOA,by.x = "LSOA11CD",by.y = "LSOA11CD")

busPop <- busPop[,c(2:4,1,7,8,5,6)]
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

print("Writing outputs...")
write.table(busPop,paste(folderOut,"businessRegistry.csv", sep=""), sep=",",row.names = F)