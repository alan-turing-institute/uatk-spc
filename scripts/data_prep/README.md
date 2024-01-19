# Scripts to prepare the input data for SPC

![SPC Schema](https://github.com/alan-turing-institute/uatk-spc/blob/main/docs/img/SPC_Schema_full_new.png)

## Prerequisites
The following steps assume the following have been installed:
- [R](https://www.r-project.org/) and [Python3](https://www.python.org/): for running data curation scripts
- [renv](https://rstudio.github.io/renv/articles/renv.html): to load the R environment for reproducibility
- [GDAL](https://gdal.org/): Geospatial Data Abstraction Library, also installable with [brew](https://formulae.brew.sh/formula/gdal)
- [pueue](https://github.com/Nukesor/pueue): a process queue for running all
  LADs

## Step 1: Curate public data from diverse sources

1. This step requires a nomis API key that can be obtained by registering with [nomisweb](https://www.nomisweb.co.uk/). Once registered, the API key can be found [here](https://www.nomisweb.co.uk/myaccount/webservice.asp) and then set as the environment variable `NOMIS_API_KEY` with `export NOMIS_API_KEY=<YOUR_API_KEY>`.

2. Make a path for the UK Data Service datasets in the next step:
    ```bash
    mkdir -p Data/dl/zip
    ```

3. Manually dowload the following tab-separated datasets from the UK Data Service, moving the downloaded `.zip` files to the path `./Data/dl/zip/`. The required datasets are:
   1. [10.5255/UKDA-SN-8860-1](http://doi.org/10.5255/UKDA-SN-8860-1)
   2. [10.5255/UKDA-SN-8090-1](http://doi.org/10.5255/UKDA-SN-8090-1)
   3. [10.5255/UKDA-SN-8737-1](http://doi.org/10.5255/UKDA-SN-8737-1)
   4. [10.5255/UKDA-SN-8128-1](http://doi.org/10.5255/UKDA-SN-8128-1)

4. Run the download preparation script:
    ```bash
    ./raw_prep/prep_dl.sh
    ```

5. Restore `renv` environment and run `raw_to_prepared.R` with:
    ```bash
    R -e 'renv::restore()'
    Rscript raw_to_prepared.R
    ```
Note that a file of over 1 GB will be downloaded. The maximum allowed time for an individual download is 10 minutes (600 seconds). Adjust options(timeout=600) l. 18 if this is insufficient.

This step outputs two types of files:
- `diariesRef.csv`, `businessRegistry.csv` and `timeAtHomeIncreaseCTY.csv` should be gzipped and stored directly inside `nationaldata-v2` on Azure; and `lookUp-GB.csv` inside `referencedata`on Azure. These files are directly used by SPC.
- The other files (30 items) are used by the next step. They have been saved within `SAVE_SPC_required_data.zip` for convenience.

Refer to the [data sources](https://alan-turing-institute.github.io/uatk-spc/data_sources.html) to learn more about the raw data and the content of the files.

The script calls `raw_to_prepared_Income.R` to produce income data for the next step.

### Age rescaling coefficients
_(Note: Data preparation from here on assumes that you have already run the
complete SPENSER pipeline either with a [single
machine](https://github.com/alan-turing-institute/spc-hpc-pipeline/blob/main/scripts/full_pipeline/README.md)
or using [Azure batch
computing](https://github.com/alan-turing-institute/spc-hpc-pipeline/))_

The final data preparation step is to generate age rescaling coefficients:
1. Run entire population is once for 2020 (since the income data is from 2020)
   without rescaling to add an income for each person (single region (LAD)
   script
   [age_rescaling/SPC_single_region_rescaling.R](age_rescaling/SPC_single_region_age_rescaling.R)).
2. Run [age_rescaling/age_rescaling.R](age_rescaling/age_rescaling.R) to produce
   the rescaling coefficients.

A bash script can be executed to perform the above two steps with:
```bash
./age_rescaling/run_pipelineLAD_age_rescaling.sh \
    <STEP1_PATH> \
    <SPENSER_INPUT_PATH> \
    <A_TMP_OUTPUT_PATH>
```

## Step 2: Add to SPENSER
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
