# Scripts to prepare the input data for SPC

![SPC Schema](https://github.com/alan-turing-institute/uatk-spc/blob/main/docs/img/SPC_Schema_full_new.png)

## Prerequisites
The following steps assume the following have been installed:
- [R](https://www.r-project.org/): for running data curation scripts
- [renv](https://rstudio.github.io/renv/articles/renv.html): to load the R environment for reproducibility
- [GDAL](https://gdal.org/): Geospatial Data Abstraction Library, also installable with [brew](https://formulae.brew.sh/formula/gdal)
- [pueue](https://github.com/Nukesor/pueue): a process queue for running all
  LADs

## Step 1: Curate public data from diverse sources

1. This step requires a nomis API key that can be obtained by registering with [nomisweb](https://www.nomisweb.co.uk/). Once registered, the API key can be found [here](https://www.nomisweb.co.uk/myaccount/webservice.asp). Replace the content of `raw_to_prepared_nomisAPIKey.txt` with this key.

2. Use `raw_to_prepared_Environment.R` to install the necessary R packages and create directories.

3. Download manually safeguarded/geoportal data, place those inside the `Data/dl` directory. Required:
   1. [LSOA centroids in csv format](https://geoportal.statistics.gov.uk/datasets/ons::lsoa-dec-2011-population-weighted-centroids-in-england-and-wales/explore) (adapt l. 219-220 of `raw_to_prepared_Workplaces.R` if necessary)
   2. [OA centroids in csv format](https://geoportal.statistics.gov.uk/datasets/ons::output-areas-dec-2011-pwc/explore) (adapt section OA centroids inside `raw_to_prepared.R` if necessary)
   3. Health and time use data, download directly from:
      1. [10.5255/UKDA-SN-8860-1](http://doi.org/10.5255/UKDA-SN-8860-1)
      2. [10.5255/UKDA-SN-8090-1](http://doi.org/10.5255/UKDA-SN-8090-1)
      3. [10.5255/UKDA-SN-8737-1](http://doi.org/10.5255/UKDA-SN-8737-1)
      4. [10.5255/UKDA-SN-8128-1](http://doi.org/10.5255/UKDA-SN-8128-1)

4. Run `raw_to_prepared.R`. Note that a file of over 1 GB will be downloaded. The maximum allowed time for an individual download is 10 minutes (600 seconds). Adjust options(timeout=600) l. 18 if this is insufficient.

This step outputs two types of files:
- `diariesRef.csv`, `businessRegistry.csv` and `timeAtHomeIncreaseCTY.csv` should be gzipped and stored directly inside `nationaldata-v2` on Azure; and `lookUp-GB.csv` inside `referencedata`on Azure. These files are directly used by SPC.
- The other files (30 items) are used by the next step. They have been saved within `SAVE_SPC_required_data.zip` for convenience.

Refer to the [data sources](https://alan-turing-institute.github.io/uatk-spc/data_sources.html) to learn more about the raw data and the content of the files.

The script calls `raw_to_prepared_Income.R` to produce income data for the next step. Note that only the modelled coefficients for hourly salaries (averaged over all age groups) and number of hours worked are produced by the script. The age rescaling coefficients require running the entire population once without rescaling, which is not practical. The methodology is left commented out for reference. Use the content of `SAVE_SPC_required_data.zip` to obtain these coefficients. The script also calls `raw_to_prepared_Workplaces.R` to create `businessRegistry.csv`. Note that both these scripts can only be used on their own after some of the content of `raw_to_prepared.R` have been created.

## Step 2: Add to SPENSER
This step assumes that you have already run the complete SPENSER pipeline either
with a [single
machine](https://github.com/alan-turing-institute/spc-hpc-pipeline/blob/main/scripts/full_pipeline/README.md)
or using [Azure batch
computing](https://github.com/alan-turing-institute/spc-hpc-pipeline/).

First, unpack `SAVE_SPC_required_data.zip` or run the step 1:
```bash
unzip SAVE_SPC_required_data.zip
```
To set-up the R environment, open R from the command line:
```bash
R
```
and follow any interactive instructions.

Next a single LAD can be enriched by running the following R script:
```bash
Rscript SPC_single_region.R \
    <LAD_CODE> \
    <YEAR> \
    <STEP1_PATH> \
    <SPENSER_INPUT_PATH> \
    <SPENSER_ENRICHED_OUTPUT_PATH>
```
Or all GB LADs for each year: 2012, 2020, 2022, 2032, 2039 can be run with:
```bash
./run_pipelineLAD.sh \
    <STEP1_PATH> \
    <SPENSER_INPUT_PATH> \
    <SPENSER_ENRICHED_OUTPUT_PATH>
```

## Step 3: Merge LADs to counties and upload to Azure

Step 2 outputs data at LAD level. These data must be grouped into counties,
gzipped and uploaded to Azure. This is done using `lookUp-GB.csv` from step 1
(use fields `AzureRef` and `LAD20CD` to get all the LADs for a county and to get
the name the final file should receive). The script `toAzure_complete.R` can be
used to perform the merging operation and can be run for all years with:
```bash
./run_toAzure_complete.sh \
    <STEP1_PATH> \
    <SPENSER_ENRICHED_OUTPUT_PATH> \
    <SPENSER_ENRICHED_TO_AZURE_PATH>
```
