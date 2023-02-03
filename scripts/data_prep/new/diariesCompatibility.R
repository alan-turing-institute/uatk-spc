library(jsonlite)

mergeRef <- merge[,c("age35g","sex","nssec8","pwkstat")]

df <- data.frame(pid = merge$pid, diaryWD = NA, diaryWE = NA)

ids <- which(mergeRef$age35g %in% 1:2)
df$diaryWD[ids] <- list("Baby")
df$diaryWE[ids] <- list("Baby")

diaryRefWD <- TUS[TUS$weekday == 1,]
diaryRefWE <- TUS[TUS$weekday == 0,]

system.time(for(i in 1:2){
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
      for(l in unique(mergeRef$pwkstat)){
        ids <- which(mergeRef$sex == i & mergeRef$age35g == j & mergeRef$nssec8 == k & mergeRef$pwkstat == l)
        idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j & diaryRefWD$nssec8 == k & diaryRefWD$pwkstat == l)]
        if(length(idWD) == 0){
          idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j)]
        }
        idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j & diaryRefWE$nssec8 == k & diaryRefWE$pwkstat == l)]
        if(length(idWE) == 0){
          idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j)]
        }
        df$diaryWD[ids] <- list(idWD)
        df$diaryWE[ids] <- list(idWE)
        print(l)
      }
      print(j)
    }
  }
})

jsonData <- toJSON(df)
jsonData <- prettify(jsonData)
write(jsonData, paste("Outputs/",lads[1],"_Diaries",".json",sep = ""))

system.time(3+4)


###
###
###


merge2 <- merge[which(merge$MSOA11CD %in% unique(merge$MSOA11CD)[1:6]),]

write.table(merge2,paste("Outputs/",lads[1],"2.csv",sep=""),sep = ",",row.names = F)


mergeRef <- merge2[,c("age35g","sex","nssec8","pwkstat")]

df <- data.frame(pid = merge2$pid, diaryWD = NA, diaryWE = NA)

ids <- which(mergeRef$age35g %in% 1:2)
df$diaryWD[ids] <- list("Baby")
df$diaryWE[ids] <- list("Baby")

i = 1
j = 13
k = 5
l = 4

system.time(for(i in 1:2){
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
      for(l in unique(mergeRef$pwkstat)){
        ids <- which(mergeRef$sex == i & mergeRef$age35g == j & mergeRef$nssec8 == k & mergeRef$pwkstat == l)
        idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j & diaryRefWD$nssec8 == k & diaryRefWD$pwkstat == l)]
        if(length(idWD) == 0){
          idWD <- diaryRefWD$uniqueID[which(diaryRefWD$sex == i & diaryRefWD$age35g == j)]
        }
        idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j & diaryRefWE$nssec8 == k & diaryRefWE$pwkstat == l)]
        if(length(idWE) == 0){
          idWE <- diaryRefWE$uniqueID[which(diaryRefWE$sex == i & diaryRefWE$age35g == j)]
        }
        df$diaryWD[ids] <- list(idWD)
        df$diaryWE[ids] <- list(idWE)
        print(l)
      }
      print(j)
    }
  }
})

jsonData <- toJSON(df)
jsonData <- prettify(jsonData)
write(jsonData, paste("Outputs/",lads[1],"_Diaries_2",".json",sep = ""))

unique(substr(df$pid,1,10))


warnings()
