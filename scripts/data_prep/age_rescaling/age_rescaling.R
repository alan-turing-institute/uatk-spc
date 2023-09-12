# Set-up
options(error = traceback)

# Positional args
args <- commandArgs(TRUE)

# Print args
print(args)

# Single run args
lad <- args[1]
date <- as.integer(args[2])

# File paths
folderInOT <- args[3]
spenserInput <- args[4]
folderOut <- args[5]


##  L326-L341:
##   - https://github.com/alan-turing-institute/uatk-spc/blob/31dd8b05e2a67fb73447d13581f6107d39a56820/scripts/data_prep/raw_to_prepared_Income.R#L326-L341

# Loop over all counties
i <- countyList[1]
temp <- addToData(i, lookUp, coefFFT, coefFPT, coefMFT, coefMPT)
write.table(temp, paste("output/tus_hse_", i, ".csv", sep = ","))
checkRes <- data.frame(
    MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
    pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY
)

for (i in countyList[2:length(countyList)]) {
    temp <- read.csv(paste("output/tus_hse_", i, ".csv", sep = ""), sep = " ")
    checkRes2 <- data.frame(
        MSOA11CD = temp$MSOA11CD, sex = temp$sex, age = temp$age, soc2010 = temp$soc2010,
        pwkstat = temp$pwkstat, incomeH = temp$incomeH, incomeY = temp$incomeY
    )
    checkRes <- rbind(checkRes, checkRes2)
}

checkRes$pwkstat <- as.numeric(substr(checkRes$pwkstat, 1, 2))
checkResF <- checkRes[checkRes$pwkstat == 1 | checkRes$pwkstat == 2, ]


##  L583-L726:
##   - https://github.com/alan-turing-institute/uatk-spc/blob/31dd8b05e2a67fb73447d13581f6107d39a56820/scripts/data_prep/raw_to_prepared_Income.R#L583-L726

###################################
####### (4.) AGE RESCALING ########
###################################


# /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
# /!\ /!\ /!\ The following is for reference only, it requires legacy data. Use content of SAVE_SPC_required_data.zip /!\ /!\ /!\
# /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\

# print("Producing age rescaling coefficients")
print("Skipping age rescaling")

# !!! ---> Ages above 67 are treated as 67 due to lack of data

# Read raw data from ONS
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fagegroupashetable6%2f2020revised/table62020revised.zip",
    destfile = paste(folderIn, "incomeDataAge.zip", sep = "")
)
unzip(paste(folderIn, "incomeDataAge.zip", sep = ""), exdir = paste(folderIn, "incomeDataAge", sep = ""))

ageMFT <- read_excel(paste(folderIn, "incomeDataAge/", "Age Group Table 6.5a   Hourly pay - Gross 2020.xls", sep = ""), sheet = "Male Full-Time", skip = 4)
ageMFT <- ageMFT[c(1:8), c(1, 3:17)]
ageMPT <- read_excel(paste(folderIn, "incomeDataAge/", "Age Group Table 6.5a   Hourly pay - Gross 2020.xls", sep = ""), sheet = "Male Part-Time", skip = 4)
ageMPT <- ageMPT[c(1:8), c(1, 3:17)]
ageFFT <- read_excel(paste(folderIn, "incomeDataAge/", "Age Group Table 6.5a   Hourly pay - Gross 2020.xls", sep = ""), sheet = "Female Full-Time", skip = 4)
ageFFT <- ageFFT[c(1:8), c(1, 3:17)]
ageFPT <- read_excel(paste(folderIn, "incomeDataAge/", "Age Group Table 6.5a   Hourly pay - Gross 2020.xls", sep = ""), sheet = "Female Part-Time", skip = 4)
ageFPT <- ageFPT[c(1:8), c(1, 3:17)]

# Prepare data to read results of the previous modelling
checkResMFT <- checkResF[checkResF$sex == 1 & checkResF$pwkstat == 1, ]
checkResMPT <- checkResF[checkResF$sex == 1 & checkResF$pwkstat == 2, ]
checkResFFT <- checkResF[checkResF$sex == 0 & checkResF$pwkstat == 1, ]
checkResFPT <- checkResF[checkResF$sex == 0 & checkResF$pwkstat == 2, ]

checkageMFT <- checkResMFT$age
checkageMPT <- checkResMPT$age
checkageFFT <- checkResFFT$age
checkageFPT <- checkResFPT$age

checkincomeHMFT <- checkResMFT$incomeH
checkincomeHMPT <- checkResMPT$incomeH
checkincomeHFFT <- checkResFFT$incomeH
checkincomeHFPT <- checkResFPT$incomeH

# Ready data to be able to model ONS data for any age
fitCol <- function(col, row, M, ord = 4) {
    fit <- lm(M[, col] ~ poly(row, ord, raw = TRUE))
    return(as.numeric(c(fit$coefficients[1], fit$coefficients[2], fit$coefficients[3], fit$coefficients[4], fit$coefficients[5])))
}

outputRefAge <- function(ageData) {
    ageData <- as.matrix(ageData[2:8, c(7:11, 3, 12:16)])
    ageData <- matrix(as.numeric(as.matrix(ageData)), ncol = ncol(ageData))
    coefAgeData <- sapply(1:ncol(ageData), function(x) {
        fitCol(x, ageRef, ageData, 4)
    })
    return(coefAgeData)
}

coefAgeMFT <- outputRefAge(ageMFT)
coefAgeMPT <- outputRefAge(ageMPT)
coefAgeFFT <- outputRefAge(ageFFT)
coefAgeFPT <- outputRefAge(ageFPT)

readCoefAgeData <- function(age, coefAgeData) {
    refVal <- rep(NA, ncol(coefAgeData))
    for (i in 1:ncol(coefAgeData)) {
        refVal[i] <- coefAgeData[1, i] + coefAgeData[2, i] * age + coefAgeData[3, i] * age^2 + coefAgeData[4, i] * age^3 + coefAgeData[5, i] * age^4
    }
    return(refVal)
}

# Build percentile shrinking / expansion reference table depending on age
makeAgeRow <- function(age, sex, fullTime) {
    xAx <- c(10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90)
    # fetch correct global distribution, distribution for specific age and previoulsy modelled distribution
    if (sex == 1 & fullTime == T) {
        trueGlob <- as.numeric(ageMFT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHMFT[checkageMFT > 66]
            true <- readCoefAgeData(67, coefAgeMFT)
        } else {
            temp <- checkincomeHMFT[checkageMFT == age]
            true <- readCoefAgeData(age, coefAgeMFT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    } else if (sex == 1 & fullTime == F) {
        trueGlob <- as.numeric(ageMPT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHMPT[checkageMPT > 66]
            true <- readCoefAgeData(67, coefAgeMPT)
        } else {
            temp <- checkincomeHMPT[checkageMPT == age]
            true <- readCoefAgeData(age, coefAgeMPT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    } else if (sex == 0 & fullTime == T) {
        trueGlob <- as.numeric(ageFFT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHFFT[checkageFFT > 66]
            true <- readCoefAgeData(67, coefAgeFFT)
        } else {
            temp <- checkincomeHFFT[checkageFFT == age]
            true <- readCoefAgeData(age, coefAgeFFT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    } else {
        trueGlob <- as.numeric(ageFPT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHFPT[checkageFPT > 66]
            true <- readCoefAgeData(67, coefAgeFPT)
        } else {
            temp <- checkincomeHFPT[checkageFPT == age]
            true <- readCoefAgeData(age, coefAgeFPT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    }
    # deduce relevant fittings
    fitTrueGlob <- lm(trueGlob ~ poly(xAx, 3, raw = TRUE))
    fitTrue <- lm(true ~ poly(xAx, 3, raw = TRUE))
    fitXAxTrueGlob <- lm(xAx ~ poly(trueGlob, 3, raw = TRUE))
    fitXAxMod <- lm(xAx ~ poly(mod, 3, raw = TRUE))
    # deduce new percentile value (see methods)
    a <- fitted2(fitTrueGlob, 1)
    b <- fitted2(fitXAxMod, a)
    c <- fitted2(fitTrue, b)
    newPerc <- min(max(1, as.numeric(round(fitted2(fitXAxTrueGlob, c)))), 100)
    for (i in 2:100) {
        a <- fitted2(fitTrueGlob, i)
        b <- fitted2(fitXAxMod, a)
        c <- fitted2(fitTrue, b)
        newPerc <- c(newPerc, min(max(1, as.numeric(round(fitted2(fitXAxTrueGlob, c)))), 100))
    }
    return(newPerc)
}

ageRescaleMFT <- mcmapply(function(x) {
    makeAgeRow(x, 1, T)
}, 16:86, mc.cores = detectCores())
ageRescaleMPT <- mcmapply(function(x) {
    makeAgeRow(x, 1, F)
}, 16:86, mc.cores = detectCores())
ageRescaleFFT <- mcmapply(function(x) {
    makeAgeRow(x, 0, T)
}, 16:86, mc.cores = detectCores())
ageRescaleFPT <- mcmapply(function(x) {
    makeAgeRow(x, 0, F)
}, 16:86, mc.cores = detectCores())

print("Writing modelled coefficients")
write.table(ageRescaleMFT, paste(folderOut, "ageRescaleMFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleMPT, paste(folderOut, "ageRescaleMPT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFFT, paste(folderOut, "ageRescaleFFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFPT, paste(folderOut, "ageRescaleFPT.csv", sep = ""), row.names = F, sep = ",")
