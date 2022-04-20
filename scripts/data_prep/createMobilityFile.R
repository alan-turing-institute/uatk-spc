library(dplyr)
library(janitor)
library(readr)
library(tidyr)
library(reshape2)

### REQUIRED: Look up table (from Azure) in same folder
### Assumption: if percent value for a County is NA -> change value to national average
  
# Download latest file from google mobility
options(timeout=600)
download.file("https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv", 
                destfile = "Google_Global_Mobility_Report.csv")
  
gm <- read_csv("Google_Global_Mobility_Report.csv") %>% 
    filter(country_region == "United Kingdom" & !is.na(sub_region_1))
gm <- gm %>% dplyr::select( c(sub_region_1,date,residential_percent_change_from_baseline))
colnames(gm) <- c("CTY20","date","change")
gm$day <- as.numeric(gm$date)-min(as.numeric(gm$date))

# Filter according to look up table and aggregate CTY/date
ref <- read.csv("lookUp.csv")
gm <- gm %>% filter(CTY20 %in% ref$GoogleMob)
gm <- gm[,c(1,2,4,3)]
gm <- aggregate(gm$change, by = list(gm$CTY20,gm$date,gm$day),FUN = mean)
colnames(gm) <- c("CTY20","date","day","change")

M <- matrix(nrow = length(unique(gm$CTY20)),ncol = length(unique(gm$day)),NA)
rownames(M) <- unique(gm$CTY20)
colnames(M) <- unique(gm$day)
base <- melt(M)

gm <- merge(base, gm, by.x = c("Var1","Var2"), by.y = c("CTY20","day"), all=T)
gm <- gm[,c(1,4,2,5)]
colnames(gm) <- c("CTY20","date","day","change")

# Change NA values to national average
nat <- aggregate(gm$change, by = list(gm$day), FUN = mean, na.rm = TRUE)$x
gm$change[is.na(gm$change)] <- nat[gm$day[is.na(gm$change)]+1]

# Restore missing dates
ref <- as.Date(0:max(gm$day) , origin = min(gm$date,na.rm = T))
gm$date[is.na(gm$date)] <- ref[gm$day[is.na(gm$date)] + 1]

# Output file
gm$change <- round(gm$change/100 + 1,2)
write.table(gm,"timeAtHomeIncreaseCTY.csv",row.names = F,sep=",")
