library(jsonlite)

mergeRef <- merge[,c("age35g","sex","nssec8")]

df <- data.frame(pid = merge$pid, diaryWD = NA, diaryWE = NA)

ids <- which(mergeRef$age35g %in% 1:2)
df$diaryWD[ids] <- list("Baby")
df$diaryWE[ids] <- list("Baby")

for(i in 1:2){
  for(k in unique(merge$nssec8)){
    print("--")
    ids <- which(mergeRef$sex == i & mergeRef$age35g == 3 & mergeRef$nssec8 == k)
    idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == 4 & diaryRefWD$nssec8 == k)]
    if(length(idWD) == 0){
      idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == 4)]
    }
    idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == 4 & diaryRefWE$nssec8 == k)]
    if(length(idWE) == 0){
      idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == 4)]
    }
    df$diaryWD[ids] <- list(idWD)
    df$diaryWE[ids] <- list(idWE)
    for(j in 4:21){
      ids <- which(mergeRef$sex == i & mergeRef$age35g == j & mergeRef$nssec8 == k)
      idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j2 & diaryRefWD$nssec8 == k)]
      if(length(idWD) == 0){
        idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j2)]
      }
      idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j2 & diaryRefWE$nssec8 == k)]
      if(length(idWE) == 0){
        idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j2)]
      }
      df$diaryWD[ids] <- list(idWD)
      df$diaryWE[ids] <- list(idWE)
      print(j)
    }
  }
}

jsonData <- toJSON(df)
jsonData <- prettify(jsonData)
write(jsonData, paste("Outputs/",lads[1],"_Diaries",".json",sep = ""))
