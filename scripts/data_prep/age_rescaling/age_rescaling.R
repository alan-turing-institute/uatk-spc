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
folderInOT <- args[1]
folderOut <- args[2]

# Alias
folderIn <- folderInOT

# Cores
cores <- detectCores()


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
# lad_files <- lad_files %>% filter(LAD20CD %in% c("E09000001", "E06000001"))
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

# Gets global incomes for a given Male/Female, Full-Time/Part-Time combination.
get_global_incomes <- function(data) {
    as.numeric(data[1, c(7:11, 3, 12:16)])
}

# Given age and modelled coefficients for quantile to income, return quantiles
# for all, quantiles given age and quantiles given age in modelled data.
get_true_and_modelled <- function(modelled, age, coef) {
    if (age > 66) {
        temp <- modelled$incomeH[modelled$age > 66]
        true <- readCoefAgeData(67, coef)
    } else {
        temp <- modelled$incomeH[modelled$age == age]
        true <- readCoefAgeData(age, coef)
    }
    modelled <- quantile(
        temp,
        c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90),
        na.rm = TRUE
    )
    rbind(true, modelled)
}


# Build percentile shrinking / expansion reference table depending on age
make_age_row_new <- function(age, sex, fullTime) {
    # fetch correct global distribution, distribution for specific age and
    # previously modelled distribution
    global_true_mod <- if (sex == 1 && fullTime == TRUE) {
        rbind(
            get_global_incomes(ageMFT),
            get_true_and_modelled(checkResMFT, age, coefAgeMFT)
        )
    } else if (sex == 1 && fullTime == FALSE) {
        rbind(
            get_global_incomes(ageMPT),
            get_true_and_modelled(checkResMPT, age, coefAgeMPT)
        )
    } else if (sex == 2 && fullTime == TRUE) {
        rbind(
            get_global_incomes(ageFFT),
            get_true_and_modelled(checkResFFT, age, coefAgeFFT)
        )
    } else {
        rbind(
            get_global_incomes(ageFPT),
            get_true_and_modelled(checkResFPT, age, coefAgeFPT)
        )
    }
    # destructure
    true_global <- global_true_mod[1, ]
    true <- global_true_mod[2, ]
    mod <- global_true_mod[3, ]
    # deduce relevant fittings
    ref_perc <- c(10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90)
    fit_true_global <- lm(true_global ~ poly(ref_perc, 3, raw = TRUE))
    fit_ref_perc <- lm(ref_perc ~ poly(mod, 3, raw = TRUE))
    fit_true <- lm(true ~ poly(ref_perc, 3, raw = TRUE))
    fit_ref_perc_true_global <- lm(ref_perc ~ poly(true_global, 3, raw = TRUE))
    # deduce new percentile value (see methods)
    do.call(cbind, lapply(seq_len(100), function(perc) {
        a <- fitted2(fit_true_global, perc)
        b <- fitted2(fit_ref_perc, a)
        c <- fitted2(fit_true, b)
        min(
            max(
                1, as.numeric(round(fitted2(fit_ref_perc_true_global, c)))
            ),
            100
        )
    }))
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
    fitXAxMod <- lm(xAx ~ poly(mod, 3, raw = TRUE))
    fitTrue <- lm(true ~ poly(xAx, 3, raw = TRUE))
    fitXAxTrueGlob <- lm(xAx ~ poly(trueGlob, 3, raw = TRUE))
    # deduce new percentile value (see methods)
    return(do.call(cbind, lapply(seq_len(100), function(perc) {
        a <- fitted2(fitTrueGlob, perc)
        b <- fitted2(fitXAxMod, a)
        c <- fitted2(fitTrue, b)
        return(min(max(1, as.numeric(round(fitted2(fitXAxTrueGlob, c)))), 100))
    })))
}

ageRescaleMFT <- mcmapply(function(x) {
    makeAgeRow(x, 1, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
ageRescaleMFTNew <- mcmapply(function(x) {
    make_age_row_new(x, 1, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
sum(abs(ageRescaleMFT - ageRescaleMFTNew))

ageRescaleMPT <- mcmapply(function(x) {
    makeAgeRow(x, 1, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
ageRescaleMPTNew <- mcmapply(function(x) {
    make_age_row_new(x, 1, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
sum(abs(ageRescaleMPT - ageRescaleMPTNew))

ageRescaleFFT <- mcmapply(function(x) {
    makeAgeRow(x, 0, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
ageRescaleFFTNew <- mcmapply(function(x) {
    make_age_row_new(x, 0, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
sum(abs(ageRescaleFFT - ageRescaleFFTNew))

ageRescaleFPT <- mcmapply(function(x) {
    makeAgeRow(x, 0, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
ageRescaleFPTNew <- mcmapply(function(x) {
    make_age_row_new(x, 0, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
sum(abs(ageRescaleFPT - ageRescaleFPTNew))

## Note: mean of the Income distributions for each feature (groupby) should be the same after rescaling
## "~Exactly" same: pwkstat, sex
##  - similar: SOC, Region

print("Writing modelled coefficients")
write.table(ageRescaleMFT, paste(folderInOT, "ageRescaleMFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleMPT, paste(folderInOT, "ageRescaleMPT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFFT, paste(folderInOT, "ageRescaleFFT.csv", sep = ""), row.names = F, sep = ",")
write.table(ageRescaleFPT, paste(folderInOT, "ageRescaleFPT.csv", sep = ""), row.names = F, sep = ",")
