########################
##### Housekeeping #####
########################


countryR <- ifelse(grepl("E",lad),"England",ifelse(grepl("W",lad),"Wales","Scotland"))

folderIn <- paste("Data/test/", date, "/", countryR, "/", sep = "") # Link to SPENSER data

HS <- HST %>% filter(country == countryR)


#################################
##### Load and glue SPENSER #####
#################################


pop <- read.csv(paste(folderIn,"ass_",lad,"_MSOA11_",date,".csv",sep = ""))
pop <- pop[which(pop$HID > 0),]
house <- read.csv(paste(folderIn,"ass_hh_",lad,"_OA11_",date,".csv",sep = ""))
#
merge <- merge(pop,house,by.x = "HID",by.y="HID",all.x = T)

rm(pop,house)

merge <- data.frame(pid = NA, hid = merge$HID,
                    MSOA11CD = merge$Area.x, OA11CD = merge$Area.y,
                    sex = merge$DC1117EW_C_SEX, age = merge$DC1117EW_C_AGE, ethnicity = merge$DC2101EW_C_ETHPUK11, HOUSE_nssec8 = merge$LC4605_C_NSSEC,
                    HOUSE_type = merge$LC4402_C_TYPACCOM, HOUSE_typeCommunal = merge$QS420_CELL, HOUSE_NRooms = merge$LC4404_C_ROOMS,
                    HOUSE_centralHeat = merge$LC4402_C_CENHEATHUK11, HOUSE_tenure = merge$LC4402_C_TENHUK11, HOUSE_NCars = merge$LC4202_C_CARSNO)
merge$HOUSE_nssec8[which(merge$HOUSE_nssec8 == 9)] <- -1
merge$HOUSE_typeCommunal[merge$HOUSE_typeCommunal < 0] <- -1
merge$HOUSE_type <- merge$HOUSE_type - 1
merge$HOUSE_type[merge$HOUSE_type < 0] <- -1
merge$HOUSE_centralHeat <- merge$HOUSE_centralHeat - 1
merge$HOUSE_tenure <- merge$HOUSE_tenure - 1
merge$HOUSE_tenure[merge$HOUSE_tenure < 0] <- -1
merge$HOUSE_NCars <- merge$HOUSE_NCars - 1

# Create unique identifiers at UK level
merge <- merge[order(merge$MSOA11CD,merge$hid,-merge$age),]
rownames(merge) <- 1:nrow(merge)
msoas <- unique(merge$MSOA11CD)
merge$hid <- unname(unlist(mcmapply(function(x){addIdH(x,merge$MSOA11CD,merge$hid)}, msoas, mc.cores = cores)))
merge$pid <- addIdP(merge$hid)

# Transform ethnicity
merge$ethnicity <- sapply(merge$ethnicity, newEth)


#######################
##### Add various #####
#######################

age35g <- sapply(merge$age, createAge35g)

### HSE
age35gH <- age35g
if(countryR == "Wales"){
  age35gH[age35gH > 19] <- 19
}
ind <- mcmapply(function(x){findHSEMatch(x,merge$sex,age35gH,HS)},1:nrow(merge), mc.cores = cores)
merge$id_HS <- HS$id_HS[ind]
merge$diabetes <- HS$diabetes[ind]
merge$bloodpressure <- HS$bloodpressure[ind]
merge$cvd <- HS$cvd[ind]


### BMI
if(countryR == "England"){
  coefF <- BMIdiff$EnglandF
  coefM <- BMIdiff$EnglandM
  minBMI <- 9.72
} else if(countryR == "Wales"){
  coefF <- BMIdiff$WalesF
  coefM <- BMIdiff$WalesM
  minBMI <- 12.40
} else{
  coefF <- BMIdiff$ScotlandF
  coefM <- BMIdiff$ScotlandM
  minBMI <- 14.71
}
merge$bmi <- mcmapply(function(x){applyBMI(x,merge,dMean,varData)}, 1:nrow(merge), mc.cores = cores)
merge$bmi[which(merge$bmi < minBMI)] <- minBMI


### TUS

# Assign new NSSEC8 for non reference people
merge$nssec8 <- -1
nssecRef <- c(1:9)
msoas = unique(lu$MSOA11CD[lu$LAD20CD == lad])
for(i in msoas){
  merge <- assignNSSEC_EW(i,merge)
}

# Match with TUS
ind <- unlist(mcmapply(function(x){findTUSMatch(x,merge,indivTUS)}, 1:nrow(merge), mc.cores = cores))

merge$id_TUS_hh <- indivTUS$id_TUS[ind]
merge$id_TUS_p <- indivTUS$pnum[ind]
merge$pwkstat <- indivTUS$pwkstat[ind]
merge$soc2010 <- indivTUS$soc2010[ind]
merge$sic1d2007 <- indivTUS$sic1d2007[ind]
merge$sic2d2007 <- indivTUS$sic2d2007[ind]
merge$netPayWeekly<- indivTUS$netPayWeekly[ind]
merge$workedHoursWeekly <- indivTUS$workedHoursWeekly[ind]

merge$nssec8[merge$nssec8 == 9] <- -1

merge <- merge[,c(1:7,20,8:19,21:28)]


### Income

region <- unique(lu$RGN20NM[lu$LAD20CD == lad])
if(countryR == "England"){
  merge <- addToData2(merge,region,coefFFT,coefFPT,coefMFT,coefMPT)
} else {
  merge$incomeH <- NA
  merge$incomeY <- NA
  merge$incomeHAsIf <- NA
  merge$incomeYAsIf <- NA
}


### Events

merge <- addSport(merge)
merge <- addConcert(merge)
merge <- addMuseum(merge)


### Coordinates

merge <- merge(merge,OACoords,by.x = "OA11CD",by.y = "OA11CD")


###################
##### Outputs #####
###################


merge <- merge[order(merge$pid),c(2:3,1,5:43)]
row.names(merge) <- 1:nrow(merge)

write.table(merge,paste(folderOut,date,"/",countryR,"/",lad,".csv",sep=""),sep = ",",row.names = F)
