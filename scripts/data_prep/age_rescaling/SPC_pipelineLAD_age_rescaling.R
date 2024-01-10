########################
##### Housekeeping #####
########################


countryR <- ifelse(grepl("E", lad),
  "England", ifelse(grepl("W", lad), "Wales", "Scotland")
)

folderIn <- paste(spenserInput, countryR, "/", date, "/", sep = "") # Link to SPENSER data
HS <- HST %>% filter(country == countryR)


#################################
##### Load and glue SPENSER #####
#################################

print("starting...")

pop <- read.csv(
  paste(folderIn, "ass_", lad, "_MSOA11_", date, ".csv", sep = "")
)
pop <- pop[which(pop$HID >= 0), ]
house <- read.csv(
  paste(folderIn, "ass_hh_", lad, "_OA11_", date, ".csv", sep = "")
)
merge <- merge(pop, house, by.x = "HID", by.y = "HID", all.x = TRUE)

rm(pop, house)

merge <- data.frame(
  pid = NA, hid = merge$HID,
  MSOA11CD = merge$Area.x, OA11CD = merge$Area.y, sex = merge$DC1117EW_C_SEX,
  age = merge$DC1117EW_C_AGE, ethnicity = merge$DC2101EW_C_ETHPUK11,
  HOUSE_nssec8 = merge$LC4605_C_NSSEC, HOUSE_type = merge$LC4402_C_TYPACCOM,
  HOUSE_typeCommunal = merge$QS420_CELL, HOUSE_NRooms = merge$LC4404_C_ROOMS,
  HOUSE_centralHeat = merge$LC4402_C_CENHEATHUK11,
  HOUSE_tenure = merge$LC4402_C_TENHUK11, HOUSE_NCars = merge$LC4202_C_CARSNO
)
merge$HOUSE_nssec8[which(merge$HOUSE_nssec8 == 9)] <- -1
merge$HOUSE_typeCommunal[merge$HOUSE_typeCommunal < 0] <- -1
merge$HOUSE_type <- merge$HOUSE_type - 1
merge$HOUSE_type[merge$HOUSE_type < 0] <- -1
merge$HOUSE_centralHeat <- merge$HOUSE_centralHeat - 1
merge$HOUSE_tenure <- merge$HOUSE_tenure - 1
merge$HOUSE_tenure[merge$HOUSE_tenure < 0] <- -1
merge$HOUSE_NCars <- merge$HOUSE_NCars - 1

# Create unique identifiers at UK level
merge <- merge[order(merge$MSOA11CD, merge$hid, -merge$age), ]
rownames(merge) <- seq_len(nrow(merge))
msoas <- unique(merge$MSOA11CD)
merge$hid <- unname(unlist(mcmapply(function(x) {
  addIdH(x, merge$MSOA11CD, merge$hid)
}, msoas, mc.cores = cores, mc.set.seed = FALSE)))
merge$pid <- addIdP(merge$hid)

# Transform ethnicity
merge$ethnicity <- sapply(merge$ethnicity, newEth)


#######################
##### Add various #####
#######################

print("adding Health data")

age35g <- sapply(merge$age, createAge35g)

### TUS

print("adding time use data")

# Assign new NSSEC8 for non reference people
merge$nssec8 <- -1
nssecRef <- c(1:9)
msoas <- unique(lu$MSOA11CD[lu$LAD20CD == lad])
if (countryR == "England" || countryR == "Wales") {
  for (i in msoas) {
    merge <- assignNSSEC_EW(i, merge)
  }
} else {
  for (i in 1:5) {
    merge <- assignNSSEC_S(i, merge)
  }
}


# Match with TUS
ind <- unlist(mcmapply(function(x) {
  findTUSMatch(x, merge, indivTUS)
}, seq_len(nrow(merge)), mc.cores = cores, mc.set.seed = FALSE))

merge$id_TUS_hh <- indivTUS$id_TUS[ind]
merge$id_TUS_p <- indivTUS$pnum[ind]
merge$pwkstat <- indivTUS$pwkstat[ind]
merge$soc2010 <- indivTUS$soc2010[ind]
merge$sic1d2007 <- indivTUS$sic1d2007[ind]
merge$sic2d2007 <- indivTUS$sic2d2007[ind]
merge$netPayWeekly <- indivTUS$netPayWeekly[ind]
merge$workedHoursWeekly <- indivTUS$workedHoursWeekly[ind]
merge$nssec8[merge$nssec8 == 9] <- -1


### Income

print("adding income data")

region <- unique(lu$RGN20NM[lu$LAD20CD == lad])
if (countryR == "England") {
  merge <- addToData(merge, region, coefFFT, coefFPT, coefMFT, coefMPT, cores)
} else {
  merge$incomeH <- NA
  merge$incomeY <- NA
  merge$incomeHAsIf <- NA
  merge$incomeYAsIf <- NA
}


###################
##### Outputs #####
###################
print("... and writing output")
merge$region <- region
out_cols <- c(
  "pid", "hid", "MSOA11CD", "region", "sex", "age",
  "soc2010", "pwkstat", "incomeH"
)
merge <- merge %>% select(all_of(out_cols))
outpath <- paste(folderOut, countryR, "/", date, "/", sep = "")
outfile <- paste(outpath, lad, ".csv", sep = "")
dir.create(outpath, recursive = TRUE)
write.table(merge, outfile, sep = ",", row.names = FALSE)
