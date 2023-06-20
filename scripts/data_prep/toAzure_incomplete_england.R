# Args for file paths
args <- commandArgs(TRUE)
print(args)

# File paths
date <- args[1]
folderInOT <- args[2]
spenserInput <- args[3]
folderOut <- args[4]
spenserInput2 <- args[5]

##### Load lookup table (dl for example from https://github.com/alan-turing-institute/uatk-spc/blob/main/scripts/data_prep/SAVE_SPC_required_data.zip)
lu <- read.csv(paste(folderInOT,"lookUp-GB.csv", sep = ""))

##### Select Country
Country <- "England"

##### Tables to check which files from the previous step must be merged to create the new files for Azure
aref <- unique(lu$AzureRef[lu$Country == Country]) # Destination file
lads <- unique(lu$LAD20CD[lu$Country == Country]) # Input file

# Special case: England counties with missing LADs
aref <- c("dorset","buckinghamshire","leicestershire","suffolk","somerset","greater-london","cornwall")
lads <- lu$LAD20CD[lu$AzureRef %in% aref]

df <- data.frame(lad = lads, aref = NA)
for(i in 1:length(lads)){
  df$aref[i] <- list(unique(lu$AzureRef[lu$LAD20CD == lads[i]]))
}
df2 <- data.frame(lad = NA, aref = aref)
for(i in 1:length(aref)){
  df2$lad[i] <- list(unique(lu$LAD20CD[lu$AzureRef == aref[i]]))
}


# Tries to load input from two different paths
loadLADFile <- function(path1, path2) {
  ladfile <- tryCatch(
  {
    print(paste("Trying path:", path1, sep=" "))
    read.csv(path1)
  },
  warning=function(cond){
    print(paste("Trying alterntive path:", path2, sep=" "))
    return(read.csv(path2))
  })
  return(ladfile)
}

##### Loop over counties
popsize = 0 # For control
for(i in 1:nrow(df2)){
  print(paste("County: ", df2$aref[i], sep=""))
  ref <- unlist(df2$lad[i])
  lad <- ref[1]
  path1 <- paste(spenserInput,Country,"/",date,"/",lad,".csv",sep = "")
  path2 <- paste(spenserInput2,Country,"/",date,"/",lad,".csv",sep = "")
  ladfile <- loadLADFile(path1, path2)
  if (length(ref) > 1){
    for(j in ref[2:length(ref)]){
      path1 <- paste(spenserInput,Country,"/",date,"/",j,".csv",sep = "")
      path2 <- paste(spenserInput2,Country,"/",date,"/",j,".csv",sep = "")
      ladfiletemp <- loadLADFile(path1, path2)
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
