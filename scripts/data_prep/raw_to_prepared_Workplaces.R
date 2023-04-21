library(ggplot2)
library(dplyr)
library(rgdal)
library(rgeos)
library(raster)
library(sp)
library(foreign)
#library(reshape2)

print("Working on the business registry...")


###############################################################################################################################
####### E & W: Business units per employee size band at MSOA level and per business sic2017 2d division (89 categories) #######
###############################################################################################################################


# Based on UK Business Counts - local units by industry and employment size band (https://www.nomisweb.co.uk/datasets/idbrlu)

geogr <- c("1245710776...1245710790","1245712478...1245712543","1245710706...1245710716","1245715055","1245710717...1245710734",
           "1245714957","1245713863...1245713902","1245710735...1245710751","1245714958","1245715056","1245710752...1245710775",
           "1245709926...1245709950","1245714987","1245714988","1245709951...1245709978","1245715039","1245709979...1245710067",
           "1245710832...1245710868","1245712005...1245712034","1245712047...1245712067","1245711988...1245712004",
           "1245712035...1245712046","1245712068...1245712085","1245710791...1245710831","1245712159...1245712222",
           "1245709240...1245709350","1245715048","1245715058...1245715063","1245709351...1245709382","1245715006",
           "1245709383...1245709577","1245713352...1245713362","1245715027","1245713363...1245713411","1245715017",
           "1245713412...1245713456","1245715030","1245713457...1245713502","1245709578...1245709655","1245715077...1245715079",
           "1245709679...1245709716","1245709656...1245709678","1245709717...1245709758","1245710900...1245710939","1245714960",
           "1245715037","1245715038","1245710869...1245710899","1245714959","1245710940...1245711009","1245713903...1245713953",
           "1245715016","1245713954...1245713977","1245709759...1245709925","1245714949","1245714989","1245714990","1245715014",
           "1245715015","1245710411...1245710660","1245714998","1245715007","1245715021","1245715022","1245710661...1245710705",
           "1245711010...1245711072","1245714961","1245714963","1245714965","1245714996","1245714997","1245711078...1245711112",
           "1245714980","1245715050","1245715051","1245711073...1245711077","1245712223...1245712237","1245714973",
           "1245712238...1245712284","1245714974","1245712285...1245712294","1245715018","1245712295...1245712306","1245714950",
           "1245712307...1245712316","1245715065","1245715066","1245713503...1245713513","1245714966","1245713514...1245713544",
           "1245714962","1245713545...1245713581","1245714964","1245715057","1245713582...1245713587","1245715010","1245715011",
           "1245713588...1245713627","1245715012","1245715013","1245713628...1245713665","1245713774...1245713779","1245715008",
           "1245715009","1245713780...1245713862","1245713978...1245714006","1245715049","1245714007...1245714019","1245715052",
           "1245714020...1245714033","1245714981","1245714034...1245714074","1245711113...1245711135","1245714160...1245714198",
           "1245711159...1245711192","1245711136...1245711158","1245714270...1245714378","1245714616...1245714638","1245714952",
           "1245714639...1245714680","1245710068...1245710190","1245714953","1245714955","1245715041...1245715047",
           "1245710191...1245710231","1245714951","1245710232...1245710311","1245714956","1245710312...1245710339","1245714954",
           "1245710340...1245710410","1245715040","1245714843...1245714927","1245711814...1245711833","1245711797...1245711813",
           "1245711834...1245711849","1245711458...1245711478","1245711438...1245711457","1245715023","1245715024",
           "1245711479...1245711512","1245715005","1245715071","1245711915...1245711936","1245714971","1245711937...1245711987",
           "1245715019","1245715020","1245712611...1245712711","1245715068","1245712712...1245712784","1245713023...1245713175",
           "1245713666...1245713758","1245715053","1245715054","1245713759...1245713773","1245714379...1245714395","1245714972",
           "1245714396...1245714467","1245708449...1245708476","1245708289","1245708620...1245708645","1245715064","1245715067",
           "1245708646...1245708705","1245714941","1245708822...1245708865","1245708886...1245708919","1245714947",
           "1245708920...1245708952","1245714930","1245714931","1245714944","1245708978...1245709014","1245709066...1245709097",
           "1245714948","1245709121...1245709150","1245714999","1245715000","1245709179...1245709239","1245708290...1245708310",
           "1245714945","1245708311...1245708378","1245714932","1245708379...1245708448","1245714929","1245714934","1245714936",
           "1245708477...1245708519","1245714935","1245708520...1245708557","1245714938","1245708558...1245708592","1245714940",
           "1245708593...1245708619","1245714933","1245715072...1245715076","1245708706...1245708733","1245714942","1245715028",
           "1245708734...1245708794","1245714943","1245708795...1245708821","1245714939","1245708866...1245708885",
           "1245708953...1245708977","1245709015...1245709042","1245714946","1245715069","1245715070","1245709043...1245709065",
           "1245709098...1245709120","1245714982","1245709151...1245709178","1245711551...1245711565","1245711690...1245711722",
           "1245711779...1245711796","1245711513...1245711550","1245711658...1245711689","1245711723...1245711746","1245714967",
           "1245711588...1245711619","1245711747...1245711778","1245711566...1245711587","1245711620...1245711657",
           "1245711850...1245711884","1245714969","1245711885...1245711914","1245714970","1245712544...1245712554","1245715003",
           "1245715004","1245712555...1245712610","1245712860...1245712894","1245714975","1245714984","1245712895...1245712958",
           "1245714968","1245714976","1245714977","1245712959...1245713022","1245713176...1245713206","1245715001","1245715002",
           "1245713207...1245713279","1245714978","1245713280...1245713291","1245715025","1245715026","1245713292...1245713337",
           "1245714979","1245713338...1245713351","1245714075...1245714144","1245715032","1245714145...1245714159",
           "1245714468...1245714493","1245714983","1245714494...1245714587","1245714937","1245714588...1245714603","1245714985",
           "1245714604...1245714615","1245714681...1245714780","1245711193...1245711219","1245711375...1245711395","1245715029",
           "1245715031","1245711220...1245711270","1245715033...1245715036","1245712086...1245712158","1245714928",
           "1245711271...1245711294","1245714991","1245714992","1245711327...1245711358","1245711396...1245711413",
           "1245711295...1245711326","1245711414...1245711437","1245714993...1245714995","1245711359...1245711374","1245714986",
           "1245714781...1245714842","1245712317...1245712477","1245712785...1245712859","1245714199...1245714269",
           "1245715080...1245715134","1245715485","1245715135...1245715171","1245715486","1245715172...1245715188",
           "1245715480","1245715482","1245715189...1245715196","1245715487","1245715197...1245715236","1245715484",
           "1245715237...1245715285","1245715483","1245715286...1245715319","1245715434...1245715479","1245715488","1245715489",
           "1245715320...1245715356","1245715481","1245715357...1245715433"
           )

downloadBR <- function(size, geogr){
  URLB <- "https://www.nomisweb.co.uk/api/v01/dataset/NM_141_1.data.csv?&geography="
  URLE <- paste("&date=latestMINUS2&industry=146800641...146800643,146800645...146800673,146800675...146800679,146800681...146800683,146800685...146800687,146800689...146800693,146800695,146800696,146800698...146800706,146800708...146800715,146800717...146800722,146800724...146800728,146800730...146800739&employment_sizeband=",size,"&legal_status=0&measures=20100&select=geography_code,industry_code,obs_value&rows=geography_code&cols=industry_code",sep="")
  download.file(paste(URLB,geogr[1],URLE,sep = ""),destfile = paste(folderIn,"data.csv",sep=""))
  data <- read.csv(paste(folderIn,"data.csv",sep=""))
  if(length(geogr) > 1){
    for(i in 2:length(geogr)){
      download.file(paste(URLB,geogr[i],URLE,sep = ""),destfile = paste(folderIn,"data1.csv",sep=""))
      data1 <- read.csv(paste(folderIn,"data1.csv",sep=""))
      data <- rbind(data,data1)
    }
  }
  colnames(data)[1] <- "MSOA11CD"
  data <- data[order(data$MSOA11CD),]
  rownames(data) <- 1:nrow(data)
  return(data)
}

E0to9 <- downloadBR(10,geogr)
E10to49 <- downloadBR(20,geogr)
E50to249 <- downloadBR(30,geogr)
E250p <- downloadBR(40,geogr)

E0to9 <- E0to9[grep(pattern = "E", E0to9$MSOA11CD),]
E10to49 <- E10to49[grep(pattern = "E", E0to9$MSOA11CD),]
E50to249 <- E50to249[grep(pattern = "E", E0to9$MSOA11CD),]
E250p <- E250p[grep(pattern = "E", E0to9$MSOA11CD),]

E0to9W <- E0to9[grep(pattern = "W", E0to9$MSOA11CD),]
E10to49W <- E10to49[grep(pattern = "W", E0to9$MSOA11CD),]
E50to249W <- E50to249[grep(pattern = "W", E0to9$MSOA11CD),]
E250pW <- E250p[grep(pattern = "W", E0to9$MSOA11CD),]

ref <- c("E0to9" ,"E10to49","E50to249","E250p")

# Merging into one dataset

i = 1
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


################################################################################################
#######  E & W: Employees at LSOA level per business sic2017 2d division (89 categories) #######
################################################################################################

### Based on Employment survey (https://www.nomisweb.co.uk/datasets/apsnew)

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


#########################################################################
####### look up tables: MSOA/LSOA and industry sic2017 categories #######
#########################################################################


lookUp <- read.csv("data/Output_Area_to_Local_Authority_District_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Enterprise_Partnership__April_2020__Lookup_in_England.csv")
lookUp <- lookUp[,c("LSOA11CD","MSOA11CD")]
lookUp <- lookUp %>% distinct()

temp <- c(rep(1,3),rep(2,5),rep(3,24),rep(4,1),rep(5,4),rep(6,3),rep(7,3),rep(8,5),rep(9,2),rep(10,6),
          rep(11,3),rep(12,1),rep(13,7),rep(14,6),rep(15,1),rep(16,1),rep(17,3),rep(18,4),rep(19,3),rep(20,2),
          rep(21,1))

refIC <- data.frame(sic1d07 = temp, sic2d07 = c(1:3,5:9,10:33,35,36:39,41:43,45:47,49:53,55:56,58:63,64:66,68,69:75,77:82,84,85,86:88,90:93,94:96,97:98,99),
                    sic2d07Ref = 1:88
)


####################################################################
####### E: Assembling the puzzle: register of business units #######
####################################################################

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

oldBR <- busPop



#################################

#################################

#################################


###############################################################################################################################
####### S & W: Business units per employee size band at MSOA level and per business sic2017 2d division (89 categories) #######
###############################################################################################################################

loadNBus <- function(name,country){
  temp <- read.csv(paste("/Users/hsalat/SPC_Extension/Data/businessRegistry/",country,name,"MSOA.csv",sep=""),skip = 8)  # <--- UK Business Counts
  colnames(temp)[1] <- "X2011.super.output.area...middle.layer"
  temp <- temp[which(!(temp$X2011.super.output.area...middle.layer == "" | temp$X2011.super.output.area...middle.layer == "Column Total")),2:ncol(temp)]
  colnames(temp)[1] <- "MSOA11CD"
  temp <- temp[order(temp$MSOA11CD),]
  rownames(temp) <- 1:nrow(temp)
  return(temp)
}

E0to9S <- loadNBus("0-9","Scotland")
E10to49S <- loadNBus("10-49","Scotland")
E50to249S <- loadNBus("50-249","Scotland")
E250pS <- loadNBus("250p","Scotland")

ref <- c("E0to9W" ,"E10to49W","E50to249W","E250pW","E0to9S" ,"E10to49S","E50to249S","E250pS")

# Merging into one dataset
msoaData <- data.frame(catTemp = NA, band = NA, MSOA11CD = NA, refTemp=NA)
for(i in 1:length(ref)){
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


###############################################################################################
####### S & W: Employees at LSOA level per business sic2017 2d division (89 categories) #######
###############################################################################################

loadlsoa <- function(country){
  temp <- read.csv(paste("/Users/hsalat/SPC_Extension/Data/businessRegistry/",country,"LSOA.csv",sep=""),skip = 8) # <--- Employment Survey
  colnames(temp)[1] <- "X2011.super.output.area...lower.layer"
  temp <- temp[which(!(temp$X2011.super.output.area...lower.layer == "" | temp$X2011.super.output.area...lower.layer == "Column Total" | temp$X2011.super.output.area...lower.layer == "*")),2:ncol(temp)]
  colnames(temp)[1] <- "LSOA11CD"
  temp <- temp[order(temp$LSOA11CD),]
  rownames(temp) <- 1:nrow(temp)
  temp <- temp[,c(1,seq(2,177,by=2))]
  return(temp)
}

Wlsoa <- loadlsoa("Wales")
Slsoa <- loadlsoa("Scotland")

# Merging into one dataset
lsoaData <- rbind(Wlsoa,Slsoa)


#########################################################################
####### look up tables: MSOA/LSOA and industry sic2017 categories #######
#########################################################################


lookUp <- read.csv("data/Output_Area_to_Local_Authority_District_to_Lower_Layer_Super_Output_Area_to_Middle_Layer_Super_Output_Area_to_Local_Enterprise_Partnership__April_2020__Lookup_in_England.csv")
lookUp <- lookUp[,c("LSOA11CD","MSOA11CD")]
lookUp <- lookUp %>% distinct()

temp <- c(rep(1,3),rep(2,5),rep(3,24),rep(4,1),rep(5,4),rep(6,3),rep(7,3),rep(8,5),rep(9,2),rep(10,6),
          rep(11,3),rep(12,1),rep(13,7),rep(14,6),rep(15,1),rep(16,1),rep(17,3),rep(18,4),rep(19,3),rep(20,2),
          rep(21,1))

refIC <- data.frame(sic1d07 = temp, sic2d07 = c(1:3,5:9,10:33,35,36:39,41:43,45:47,49:53,55:56,58:63,64:66,68,69:75,77:82,84,85,86:88,90:93,94:96,97:98,99),
                    sic2d07Ref = 1:88
)


########################################################################
####### S & W: Assembling the puzzle: register of business units #######
########################################################################


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

BUsizeW <- function(n,band){
  if(band == 1){
    x <- 1:9
  }else if(band == 2){
    x <- 10:49
  }else if(band == 3){
    x <- 50:249
  }else{
    x <- 250:1500
  }
  return(sample(x, n, replace = T, prob = fitW$coefficients[1]*(x^fitW$coefficients[2])))
}

BUsizeS <- function(n,band){
  if(band == 1){
    x <- 1:9
  }else if(band == 2){
    x <- 10:49
  }else if(band == 3){
    x <- 50:249
  }else{
    x <- 250:1500
  }
  return(sample(x, n, replace = T, prob = fitS$coefficients[1]*(x^fitS$coefficients[2])))
}

idw <- grep("W",busPop$MSOA11CD)
ids <- grep("S",busPop$MSOA11CD)

length(ids) + length(idw)

busPop$size[idw] <- mapply(BUsizeW,1,busPop$band[idw])
busPop$size[ids] <- mapply(BUsizeS,1,busPop$band[ids])
busPop <- busPop[,c(1,6,3:5)]

# 'lsoa' field

busPop2 <- merge(busPop,refIC,by.x="sic2d07",by.y="sic2d07")

lsoatomsoa <- oatoOther[c(grep("W",oatoOther$MSOA11CD),grep("S",oatoOther$MSOA11CD)),c("LSOA11CD","MSOA11CD")]
lsoatomsoa <- lsoatomsoa[!duplicated(lsoatomsoa),]
rownames(lsoatomsoa) <- 1:nrow(lsoatomsoa)
lsoaData2 <- merge(lsoaData,lsoatomsoa,by.x="LSOA11CD",by.y="LSOA11CD")


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

coords <- read.dbf("/Users/hsalat/SPC_Extension/Data/businessRegistry/LSOA.dbf")
idw <- grep("W",coords$LSOA11CD)
coords <- coords[c(idw),c("LSOA11CD","LONG","LAT")]
colnames(coords)[2:3] <- c("lng","lat")

coords2 <- read.dbf("/Users/hsalat/SPC_Extension/Data/businessRegistry/SG_DataZone_Cent_2011.dbf")
ukgrid = "+init=epsg:27700"
latlong = "+init=epsg:4326"
coords3 <- cbind(Easting = as.numeric(as.character(coords2$Easting)), Northing = as.numeric(as.character(coords2$Northing)))
coords3 <- SpatialPointsDataFrame(coords3, data = data.frame(coords2$DataZone), proj4string = CRS("+init=epsg:27700"))
coords3 <- spTransform(coords3, CRS(latlong))
plot(coords3)
coords3 <- coords3@coords
coords3 <- data.frame(LSOA11CD = coords2$DataZone, lng = coords3[,1], lat = coords3[,2])

refLSOA <- rbind(coords3,coords)

busPop2 <- merge(busPop2,refLSOA,by.x = "LSOA11CD",by.y = "LSOA11CD")

busPop <- busPop2[,c(3,4,5,1,9,10,6,2)]
colnames(busPop)[7] <- "sic1d07"
busPop <- busPop[order(busPop$id),]
row.names(busPop) <- 1:nrow(busPop)

busPop <- rbind(oldBR,busPop)


print("Writing outputs...")
write.table(busPop,"Outputs/businessRegistry.csv",sep=",",row.names = F)