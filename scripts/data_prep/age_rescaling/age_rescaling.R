# Options and imports
options(error = traceback)
library(tidyverse)
library(parallel)
library(stringr)
library(tidyverse)
library(rgdal)
library(readxl)

# Set seed
set.seed(790)

# Positional args
args <- commandArgs(TRUE)

# Print args
print(args)

# Single run args
date <- as.integer(args[2])
folderInOT <- args[3]
spenserInput <- args[4]
folderOut <- args[5]

# Alias
folderIn <- folderInOT

# Age ref
# Mid-points of Age categories in:
#   "Age Group Table 6.5a Hourly pay - Gross 2020.xls"
# 16-17b, 18-21, 22-29, 30-39, 40-49, 50-59, 60+
ageRef <- c(16.5, 19.5, 25.5, 34.5, 44.5, 54.5, 63)

# Read data
# -------------------
##  L326-L341:
##   - https://github.com/alan-turing-institute/uatk-spc/blob/31dd8b05e2a67fb73447d13581f6107d39a56820/scripts/data_prep/raw_to_prepared_Income.R#L326-L341
# SPENSER outputs are already reshaped to 2020 LAD codes so loop over these files
lookup <- read.csv(paste(folderInOT, "lookUp-GB.csv", sep = ""))
lad_files <- (
    lookup %>% filter(Country == "England")
        %>% select(LAD20CD)
        %>% unique()
        %>% mutate(
            file_name = str_replace(
                LAD20CD, LAD20CD, paste0(folderOut, LAD20CD, ".csv")
            )
        )
)

# TODO: For testing, just two LADs, comment out when complete
lad_files <- lad_files %>% filter(LAD20CD %in% c("E09000001", "E06000001"))
check_res <- do.call(rbind, lapply(lad_files$file_name, read.csv))

# Filter for only Full time (1) and part time (2)
check_res_f <- check_res %>% filter(pwkstat == 1 | pwkstat == 2)


##  L583-L726:
##   - https://github.com/alan-turing-institute/uatk-spc/blob/31dd8b05e2a67fb73447d13581f6107d39a56820/scripts/data_prep/raw_to_prepared_Income.R#L583-L726

###################################
####### (4.) AGE RESCALING ########
###################################

print("Producing age rescaling coefficients")

# !!! ---> Ages above 67 are treated as 67 due to lack of data

# Read raw data from ONS
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fagegroupashetable6%2f2020revised/table62020revised.zip",
    destfile = paste(folderIn, "incomeDataAge.zip", sep = ""), headers = c("User-Agent" = "My Custom User Agent")
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
checkResMFT <- check_res_f[check_res_f$sex == 2 & check_res_f$pwkstat == 1, ]
checkResMPT <- check_res_f[check_res_f$sex == 2 & check_res_f$pwkstat == 2, ]
checkResFFT <- check_res_f[check_res_f$sex == 1 & check_res_f$pwkstat == 1, ]
checkResFPT <- check_res_f[check_res_f$sex == 1 & check_res_f$pwkstat == 2, ]

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
    coefAgeData <- sapply(seq_len(ncol(ageData)), function(x) {
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
    for (i in seq_len(ncol(coefAgeData))) {
        refVal[i] <- coefAgeData[1, i] + coefAgeData[2, i] * age + coefAgeData[3, i] * age^2 + coefAgeData[4, i] * age^3 + coefAgeData[5, i] * age^4
    }
    return(refVal)
}

# ---------------------
# Plot: testing
library(ggplot2)
ages <- seq(10, 90)
df <- (
    data.frame(
        do.call(
            rbind,
            lapply(ages, function(x) readCoefAgeData(x, coefAgeMFT))
        )
    ) %>% mutate(age = ages)
        %>% pivot_longer(
            cols = !age, names_to = "quantile", values_to = "income"
        )
)
ggplot(df, aes(age, income)) +
    geom_line(aes(colour = quantile))
# ---------------------

# Returns fitted values from cubic lm fit for vector of values
fitted2 <- function(fit, val) {
    i <- val[1]
    ret <- fit$coefficients[1] + fit$coefficients[2] * i + fit$coefficients[3] * i^2 + fit$coefficients[4] * i^3
    if (length(val) > 1) {
        for (i in val[2:length(val)]) {
            ret <- c(ret, fit$coefficients[1] + fit$coefficients[2] * i + fit$coefficients[3] * i^2 + fit$coefficients[4] * i^3)
        }
    }
    return(ret)
}


# Build percentile shrinking / expansion reference table depending on age
makeAgeRow <- function(age, sex, fullTime) {
    xAx <- c(10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90)
    # fetch correct global distribution, distribution for specific age and previoulsy modelled distribution
    if (sex == 1 & fullTime == TRUE) {
        trueGlob <- as.numeric(ageMFT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHMFT[checkageMFT > 66]
            true <- readCoefAgeData(67, coefAgeMFT)
        } else {
            temp <- checkincomeHMFT[checkageMFT == age]
            true <- readCoefAgeData(age, coefAgeMFT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    } else if (sex == 1 & fullTime == FALSE) {
        trueGlob <- as.numeric(ageMPT[1, c(7:11, 3, 12:16)])
        if (age > 66) {
            temp <- checkincomeHMPT[checkageMPT > 66]
            true <- readCoefAgeData(67, coefAgeMPT)
        } else {
            temp <- checkincomeHMPT[checkageMPT == age]
            true <- readCoefAgeData(age, coefAgeMPT)
        }
        mod <- quantile(temp, c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90), na.rm = T)
    } else if (sex == 2 & fullTime == T) {
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
}, 16:86, mc.cores = detectCores(), mc.set.seed = FALSE)
ageRescaleMPT <- mcmapply(function(x) {
    makeAgeRow(x, 1, F)
}, 16:86, mc.cores = detectCores(), mc.set.seed = FALSE)
ageRescaleFFT <- mcmapply(function(x) {
    makeAgeRow(x, 0, T)
}, 16:86, mc.cores = detectCores(), mc.set.seed = FALSE)
ageRescaleFPT <- mcmapply(function(x) {
    makeAgeRow(x, 0, F)
}, 16:86, mc.cores = detectCores(), mc.set.seed = FALSE)


## Note: mean of the Income distributions for each feature (groupby) should be the same after rescaling
## "~Exactly" same: pwkstat, sex
##  - similar: SOC, Region

print("Writing modelled coefficients")
write.table(ageRescaleMFT, paste(folderOut, "ageRescaleMFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleMPT, paste(folderOut, "ageRescaleMPT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFFT, paste(folderOut, "ageRescaleFFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFPT, paste(folderOut, "ageRescaleFPT.csv", sep = ""), row.names = F, sep = ",")
