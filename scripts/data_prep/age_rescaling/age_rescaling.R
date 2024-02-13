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
folder_step_1 <- args[1]
folder_pre_rescaling <- args[2]

# Cores
cores <- detectCores()

# Mid-points of age categories in:
#  "Age Group Table 6.5a Hourly pay - Gross 2020.xls" are:
#    16-17b, 18-21, 22-29, 30-39, 40-49, 50-59, 60+
age_midpoints <- c(16.5, 19.5, 25.5, 34.5, 44.5, 54.5, 63)

print("Read modelled data")
# Read data outputted at LAD20CD resolution
lookup <- read.csv(paste(folder_step_1, "lookUp-GB.csv", sep = ""))
lad_files <- (
    lookup
    |> filter(Country == "England")
    |> select(LAD20CD)
    |> unique()
    |> mutate(
        file_name = str_replace(
            LAD20CD, LAD20CD, paste0(folder_pre_rescaling, LAD20CD, ".csv")
        )
    )
)
# Load data pre-rescaling
check_res <- do.call(rbind, lapply(lad_files$file_name, read.csv))

# Filter for only Full time (1) and part time (2)
check_res_f <- check_res |> filter(pwkstat == 1 | pwkstat == 2)


print("Producing age rescaling coefficients")
# Read raw data from ONS
download.file("https://www.ons.gov.uk/file?uri=%2femploymentandlabourmarket%2fpeopleinwork%2fearningsandworkinghours%2fdatasets%2fagegroupashetable6%2f2020revised/table62020revised.zip", # nolint
    destfile = paste(folder_step_1, "incomeDataAge.zip", sep = ""),
    headers = c("User-Agent" = "My Custom User Agent")
)
unzip(
    paste(folder_step_1, "incomeDataAge.zip", sep = ""),
    exdir = paste(folder_step_1, "incomeDataAge", sep = "")
)

# Reads the income percentile data by age for a given category
read_income_data_by_category <- function(sheet_name) {
    data <- read_excel(
        paste(
            folder_step_1,
            "incomeDataAge/",
            "Age Group Table 6.5a   Hourly pay - Gross 2020.xls",
            sep = ""
        ),
        sheet = sheet_name,
        skip = 4
    )
    data[c(1:8), c(1, 3:17)]
}

# Income data by age, sex and pwkstat
age_mft <- read_income_data_by_category("Male Full-Time")
age_mpt <- read_income_data_by_category("Male Part-Time")
age_fft <- read_income_data_by_category("Female Full-Time")
age_fpt <- read_income_data_by_category("Female Part-Time")

# Prepare data to read results of the previous modelling
check_res_mft <- check_res_f |> filter(sex == 1 & pwkstat == 1)
check_res_mpt <- check_res_f |> filter(sex == 1 & pwkstat == 2)
check_res_fft <- check_res_f |> filter(sex == 2 & pwkstat == 1)
check_res_fpt <- check_res_f |> filter(sex == 2 & pwkstat == 2)

# Fits a column (quantile) of income data by age given ages (age midpoints)
fit_col <- function(col, ages, age_data, ord = 4) {
    fit <- lm(age_data[, col] ~ poly(ages, ord, raw = TRUE))
    as.numeric(c(
        fit$coefficients[1],
        fit$coefficients[2],
        fit$coefficients[3],
        fit$coefficients[4],
        fit$coefficients[5]
    ))
}

# Gets fitted coefficients (rows) for income percentiles (columns)
output_ref_age <- function(age_data) {
    age_data <- as.matrix(age_data[2:8, c(7:11, 3, 12:16)])
    age_data <- matrix(as.numeric(as.matrix(age_data)), ncol = ncol(age_data))
    coef_age_data <- sapply(seq_len(ncol(age_data)), function(col) {
        fit_col(col, age_midpoints, age_data, 4)
    })
    return(coef_age_data)
}

# Get coefs matrix for each category
coef_age_mft <- output_ref_age(age_mft)
coef_age_mpt <- output_ref_age(age_mpt)
coef_age_fft <- output_ref_age(age_fft)
coef_age_fpt <- output_ref_age(age_fpt)

# Gets the predicted income from fitted quartic model for each percentile
get_coef_age_data <- function(age, coef_age_data) {
    ref_val <- rep(NA, ncol(coef_age_data))
    for (i in seq_len(ncol(coef_age_data))) {
        ref_val[i] <- (
            coef_age_data[1, i]
            + coef_age_data[2, i] * age
            + coef_age_data[3, i] * age^2
            + coef_age_data[4, i] * age^3
            + coef_age_data[5, i] * age^4
        )
    }
    return(ref_val)
}

# Returns fitted values from cubic lm fit for vector of values
fitted_cubic <- function(fit, vals) {
    unlist(lapply(vals, function(x) {
        (
            fit$coefficients[1]
            + fit$coefficients[2] * x
            + fit$coefficients[3] * x^2
            + fit$coefficients[4] * x^3
        )
    }))
}

# Gets global incomes for a given Male/Female, Full-Time/Part-Time combination.
get_true_global_incomes <- function(data) {
    as.numeric(data[1, c(7:11, 3, 12:16)])
}

# Given age and modelled coefficients for quantile to income, return quantiles
# for all, quantiles given age and quantiles given age in modelled data.
get_true_and_modelled <- function(modelled, age, coef) {
    # Ages above 67 are treated as 67 due to lack of data
    if (age > 66) {
        temp <- modelled$incomeH[modelled$age > 66]
        true <- get_coef_age_data(67, coef)
    } else {
        temp <- modelled$incomeH[modelled$age == age]
        true <- get_coef_age_data(age, coef)
    }
    modelled <- quantile(
        temp,
        c(.10, .20, .25, .30, .40, .50, .60, .70, .75, .80, .90),
        na.rm = TRUE
    )
    rbind(true, modelled)
}


# Build percentile shrinking / expansion reference table depending on age
make_age_row <- function(age, sex, full_time) {
    # fetch correct global distribution, distribution for specific age and
    # previously modelled distribution
    global_true_mod <- if (sex == 1 && full_time == TRUE) {
        rbind(
            get_true_global_incomes(age_mft),
            get_true_and_modelled(check_res_mft, age, coef_age_mft)
        )
    } else if (sex == 1 && full_time == FALSE) {
        rbind(
            get_true_global_incomes(age_mpt),
            get_true_and_modelled(check_res_mpt, age, coef_age_mpt)
        )
    } else if (sex == 2 && full_time == TRUE) {
        rbind(
            get_true_global_incomes(age_fft),
            get_true_and_modelled(check_res_fft, age, coef_age_fft)
        )
    } else {
        rbind(
            get_true_global_incomes(age_fpt),
            get_true_and_modelled(check_res_fpt, age, coef_age_fpt)
        )
    }
    # destructure
    true_global <- global_true_mod[1, ] # nolint
    true <- global_true_mod[2, ] # nolint
    mod <- global_true_mod[3, ] # nolint
    # deduce relevant fittings
    ref_perc <- c(10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90) # nolint
    fit_true_global <- lm(true_global ~ poly(ref_perc, 3, raw = TRUE))
    fit_ref_perc <- lm(ref_perc ~ poly(mod, 3, raw = TRUE))
    fit_true <- lm(true ~ poly(ref_perc, 3, raw = TRUE))
    fit_ref_perc_true_global <- lm(ref_perc ~ poly(true_global, 3, raw = TRUE))
    # deduce new percentile value (see methods)
    do.call(cbind, lapply(seq_len(100), function(perc) {
        a <- fitted_cubic(fit_true_global, perc)
        b <- fitted_cubic(fit_ref_perc, a)
        c <- fitted_cubic(fit_true, b)
        min(
            max(
                1, as.numeric(round(fitted_cubic(fit_ref_perc_true_global, c)))
            ),
            100
        )
    }))
}

# Perform rescaling for each percentile (row) and age (column)
age_rescale_mft <- mcmapply(function(x) {
    make_age_row(x, 1, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
age_rescale_mpt <- mcmapply(function(x) {
    make_age_row(x, 1, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
age_rescale_fft <- mcmapply(function(x) {
    make_age_row(x, 2, TRUE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)
age_rescale_fpt <- mcmapply(function(x) {
    make_age_row(x, 2, FALSE)
}, 16:86, mc.cores = cores, mc.set.seed = FALSE)

print("Writing modelled coefficients")
write.table(
    age_rescale_mft,
    paste(folder_step_1, "ageRescaleMFT.csv", sep = ""),
    row.names = FALSE, sep = ","
)
write.table(
    age_rescale_mpt,
    paste(folder_step_1, "ageRescaleMPT.csv", sep = ""),
    row.names = FALSE, sep = ","
)
write.table(
    age_rescale_fft,
    paste(folder_step_1, "ageRescaleFFT.csv", sep = ""),
    row.names = FALSE, sep = ","
)
write.table(
    age_rescale_fpt,
    paste(folder_step_1, "ageRescaleFPT.csv", sep = ""),
    row.names = FALSE, sep = ","
)
