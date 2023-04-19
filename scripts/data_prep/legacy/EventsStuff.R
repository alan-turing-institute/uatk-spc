
### Sport
addSport <- function(data){
  data$ESport <- sapply(data$age,subSport1)
  data$ERubgy <- data$ESport * sapply(data$sex,subSport2) * sapply(data$nssec8,subSport3)
  return(data)
}

subSport1 <- function(age){
  if(age < 16){
    res <- 0.257
  } else if(age < 25){
    res <- 0.257
  } else if(age < 35){
    res <- 0.233
  } else if(age < 45){
    res <- 0.255
  } else if(age < 55){
    res <- 0.279
  } else if(age < 65){
    res <- 0.268
  } else if(age < 75){
    res <- 0.239
  } else if(age < 85){
    res <- 0.188
  } else {
    res <- 0.090
  }
  return(res)
}
# Prob of <16 set to <25 bc dealing with households is too complicated

subSport2 <- function(sex){
  res <- 0.63
  if(sex == 2){
    res <- 0.37
  }
  return(res)
}

subSport3 <- function(nssec8){
  res <- 1
  if(nssec8 %in% 1:3){
    res <- 2
  }
  return(res)
}

# Concerts
addConcert <- function(data){
  data$EConcertF <- sapply(data$age,subConcert1)*sapply(data$sex,subConcert3)
  data$EConcertM <- sapply(data$age,subConcert1)*(100 - sapply(data$sex,subConcert3))
  data$EConcertFS <- sapply(data$age,subConcert2)*sapply(data$sex,subConcert3)
  data$EConcertMS <- sapply(data$age,subConcert2)*(100 - sapply(data$sex,subConcert3))
  return(data)
}

subConcert1 <- function(age){
  res <- dnorm(age, 23.70431, 5.192425)
  return(res)
}

subConcert2 <- function(age){
  res <- dnorm(age, 45.44389, 10.10664)
  return(res)
}

subConcert3 <- function(sex){
  res <- 30
  if(sex == 2){
    res <- 70
  }
  return(res)
}

# Museums
addMuseum <- function(data){
  #data$ETankMuseum <- sapply(data$origin,subMuseum2)*sapply(data$nssec5,subMuseum3)
  data$EMuseum <- sapply(data$age,subMuseum1)*sapply(data$ethnicity,subMuseum2)*sapply(data$nssec8,subMuseum3)
  return(data)
}

subMuseum1 <- function(age){
  if(age < 16){
    res <- 0.45
  } else if(age < 25){
    res <- 0.45
  } else if(age < 45){
    res <- 0.54
  } else if(age < 65){
    res <- 0.55
  } else if(age < 75){
    res <- 0.54
  } else {
    res <- 0.36
  }
  return(res)
}
# Prob of <16 set to <25 bc dealing with households is too complicated

subMuseum2 <- function(origin){
  if(origin == 1){
    res <- 0.53
  } else if(origin == 4){
    res <- 0.63
  } else if(origin == 3){
    res <- 0.46
  } else if(origin == 2){
    res <- 0.28
  } else {
    res <- 0.42
  }
  return(res)
}

subMuseum3 <- function(nssec8){
  res<- 0.45
  if(nssec8 %in% 1:7){
    res <- 0.55
  }
  return(res)
}

# Religion
addReligion <- function(data){
  data$EReligion1 <- 0
  data$EReligion2 <- 0
  for(i in 1:nrow(data)){
    a = runif(1)
    if(a <= 0.38){
      data$EReligion1 <- 1
    }else if(a <= 0.43){
      data$EReligion2 <- 1
    }
  }
}
