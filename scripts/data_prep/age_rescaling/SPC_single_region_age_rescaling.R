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

# Run
source("age_rescaling/SPC_loadWorkspace_age_rescaling.R")
source("age_rescaling/SPC_pipelineLAD_age_rescaling.R")
