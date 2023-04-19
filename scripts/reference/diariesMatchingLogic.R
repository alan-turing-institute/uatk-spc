library(jsonlite)

createAge35g <- function(a){
  ifelse(a > 99, 23,
         ifelse(a > 19, 8 + floor( (a - 20) / 5),
                ifelse(a == 0 | a == 1, 1,
                       ifelse(a > 1 & a < 11, 2 + floor((a - 2) / 3),
                              ifelse(a == 11 | a == 12, 5,
                                     ifelse(a > 12 & a < 16, 6, 7))))))
}

merge$age35g <- sapply(merge$age, createAge35g)

mergeRef <- merge[,c("age35g","sex","nssec8","pwkstat")]

df <- data.frame(pid = merge$pid, diaryWD = NA, diaryWE = NA)

ids <- which(mergeRef$age35g %in% 1:2)
df$diaryWD[ids] <- list("Baby")
df$diaryWE[ids] <- list("Baby")

diaryRefWD <- TUS[TUS$weekday == 1,]
diaryRefWE <- TUS[TUS$weekday == 0,]

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
      }
      print(j)
    }
  }
}

jsonData <- toJSON(df)
jsonData <- prettify(jsonData)
#write(jsonData, paste("Outputs/","central-valleys_2020","_Diaries",".json",sep = ""))

