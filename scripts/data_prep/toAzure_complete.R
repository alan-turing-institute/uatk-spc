# Args for file paths
args <- commandArgs(TRUE)
print(args)

# File paths
date <- args[1]
spenserInput <- args[2]
folderOut <- args[3]
folderInOT <- args[4]

##### Load lookup table (dl for example from https://github.com/alan-turing-institute/uatk-spc/blob/main/scripts/data_prep/SAVE_SPC_required_data.zip)
lu <- read.csv(paste(folderInOT,"lookUp-GB.csv", sep = ""))

##### Loop over countries
for(Country in c("England", "Wales", "Scotland")) {
  ##### Tables to check which files from the previous step must be merged to create the new files for Azure
  aref <- unique(lu$AzureRef[lu$Country == Country]) # Destination file
  lads <- unique(lu$LAD20CD[lu$Country == Country]) # Input file

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
    ladfile <- read.csv(paste(spenserInput,Country,"/",date,"/",lad,".csv",sep = ""))
    if (length(ref) > 1){
      for(j in ref[2:length(ref)]){
        ladfiletemp <- read.csv(paste(spenserInput,Country,"/",date,"/",j,".csv",sep = ""))
        ladfile <- rbind(ladfile,ladfiletemp)
      }
    }
    popsize = popsize + nrow(ladfile)
    outpath <- paste(folderOut,"/",Country,"/",date,"/", sep="")
    outfile <- paste(outpath, "pop_",df2$aref[i],"_",date,".csv",sep = "")
    print(outfile)
    dir.create(outpath, recursive=TRUE)
    write.table(ladfile, outfile, row.names = F, sep = ",")
  }
  popsize
}