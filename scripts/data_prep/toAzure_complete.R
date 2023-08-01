folderInOT <- "Data/"
folderOut <- "Outputs/"

##### Load lookup table (dl for example from https://github.com/alan-turing-institute/uatk-spc/blob/main/scripts/data_prep/SAVE_SPC_required_data.zip)
lu <- read.csv(paste(folderInOT,"lookUp-GB.csv", sep = ""))

##### Select Country
Country <- "Wales"
Country <- "England"
Country <- "Scotland"

##### Tables to check which files from the previous step must be merged to create the new files for Azure
aref <- unique(lu$AzureRef[lu$Country == Country]) # Destination file
lads <- unique(lu$LAD20CD[lu$Country == Country]) # Input file

# Special case: England missing lads only
#aref <- c("dorset","buckinghamshire","leicestershire","suffolk","somerset")
#lads <- c("E06000058","E06000059","E06000060","E07000135","E07000244","E07000245","E07000246")

df <- data.frame(lad = lads, aref = NA)
for(i in 1:length(lads)){
  df$aref[i] <- list(unique(lu$AzureRef[lu$LAD20CD == lads[i]]))
}
df2 <- data.frame(lad = NA, aref = aref)
for(i in 1:length(aref)){
  df2$lad[i] <- list(unique(lu$LAD20CD[lu$AzureRef == aref[i]]))
}

##### Loop
popsize = 0 # For control
for(i in 1:nrow(df2)){
  ref <- unlist(df2$lad[i])
  lad <- ref[1]
  ladfile <- read.csv(paste("Data/",Country,"/",date,"/",lad,".csv",sep = ""))
  if (length(ref) > 1){
    for(j in ref[2:length(ref)]){
      ladfiletemp <- read.csv(paste("Data/",Country,"/",date,"/",j,".csv",sep = ""))
      ladfile <- rbind(ladfile,ladfiletemp)
    }
  }
  popsize = popsize + nrow(ladfile)
  write.table(ladfile,paste(folderOut,"/",Country,"/",date,"/","pop_",df2$aref[i],"_",date,".csv",sep = ""), row.names = F, sep = ",")
}
popsize