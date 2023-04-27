# Scripts to prepare the input data for SPC

![SPC Schema](https://github.com/alan-turing-institute/uatk-spc/blob/main/docs/img/SPC_Schema_full.png)

## Step 1: Curate public data from diverse sources (WIP)

1. This step requires a nomis API key that can be obtained by registering with [nomisweb](https://www.nomisweb.co.uk/). Once registered, the API key can be found [here](https://www.nomisweb.co.uk/myaccount/webservice.asp). Replace the content of `raw_to_prepared_nomisAPIKey.txt` with this key.

2. Use `raw_to_prepared_Environment.R` to install the necessary R packages and create directories.

3. Download manually safeguarded/geoportal data, place those inside the `Data/dl` directory. Required: [LSOA centroids in csv format](https://geoportal.statistics.gov.uk/datasets/ons::lsoa-dec-2011-population-weighted-centroids-in-england-and-wales/explore) (adapt l. 219-220 of `raw_to_prepared_Workplaces.R` if necessary); Health and time use data (download directly from [10.5255/UKDA-SN-8860-1](http://doi.org/10.5255/UKDA-SN-8860-1), [10.5255/UKDA-SN-8090-1](http://doi.org/10.5255/UKDA-SN-8090-1), [10.5255/UKDA-SN-8737-1](http://doi.org/10.5255/UKDA-SN-8737-1) and [10.5255/UKDA-SN-8128-1](http://doi.org/10.5255/UKDA-SN-8128-1)).

4. Run `raw_to_prepared.R`.

This step outputs two types of files:
- `diariesRef.csv`, `businessRegistry.csv` and `timeAtHomeIncreaseCTY.csv` should be gzipped and stored directly inside `nationaldata-v2` on Azure; and `lookUp-GB.csv` inside `referencedata`on Azure. These files are directly used by SPC.
- The other files (30 items) are used by the next step. They have been saved within `SAVE_SPC_required_data.zip` for convenience.

Refer to the [data sources](https://alan-turing-institute.github.io/uatk-spc/data_sources.html) to learn more about the raw data and the content of the files.

The script calls `raw_to_prepared_Income.R` to produce income data for the next step. Note that only the modelled coefficients for hourly salaries (averaged over all age groups) and number of hours worked are produced by the script. The age rescaling coefficients require running the entire population once without rescaling, which is not practical. The methodology is left commented out for reference. Use the content of `SAVE_SPC_required_data.zip` to obtain these coefficients. The script also calls `raw_to_prepared_Workplaces.R` to create `businessRegistry.csv` (note that this script can only be used on its own after some of the content of `raw_to_prepared.R` have been created).

## Step 2: Add to SPENSER

1. Unpack `SAVE_SPC_required_data.zip` or run the previous step.

2. Get SPENSER data (link will be provided when available).

3. Update the variables `folderIn`, `folderInOT` and `folderOut` inside `SPC_loadWorkspace.R` and `SPC_pipelineLAD.R` to a local folder structure.

4. Use `SPC_testruns.R` to run a specific LAD for a specific year.

## Step 3: Recut and upload to Azure (WIP)

Step 2 outputs data at LAD level. These data must be grouped into counties, gziped and uploaded to `countydata-v2`on Azure. This can be done by using `lookUp-GB.csv` from step 1 (use fields `AzureRef` and `LAD20CD` to get all the LADs for a County and to get the name the final file should receive). A script will be provided at a later stage.
