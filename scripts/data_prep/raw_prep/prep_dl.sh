#!/bin/bash 

set -e

# Check zip digests from UK Data Service
shasum -c digests/uk_data_service.txt

# Unzip
OUTPATH=Data/dl/
unzip -o $OUTPATH/zip/8860tab_9C6B5888A6C880F95FC0F04CDED028191F4F1F3F865253D46D1EA277830A7D54_V1.zip -d $OUTPATH
unzip -o $OUTPATH/zip/8090tab_2038dabc18ee4cb41ba5d23972c3bf56.zip -d $OUTPATH
unzip -o $OUTPATH/zip/8737tab_249939DDF6432AA9A2ED89CECED2F92E_V1.zip -d $OUTPATH
unzip -o $OUTPATH/zip/8128tab_A34C0A6B082B45E8CAE4D1795D786CEEBF43FD6766C98E10DD13D81B2F586CE4_V1.zip -d $OUTPATH

# Move required files
mv $OUTPATH/UKDA-8860-tab/tab/hse_2019_eul_20211006.tab $OUTPATH
mv $OUTPATH/UKDA-8737-tab/tab/shes16171819i_eul.tab $OUTPATH
mv $OUTPATH/UKDA-8737-tab/tab/shes1719i_eul.tab  $OUTPATH
mv $OUTPATH/UKDA-8737-tab/tab/shes1819i_eul.tab $OUTPATH
mv $OUTPATH/UKDA-8737-tab/tab/shes19h_eul.tab $OUTPATH
mv $OUTPATH/UKDA-8737-tab/tab/shes19i_eul.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_diary_ep_long.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_diary_wide.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_dv_time_vars.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_household.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_individual.tab $OUTPATH
mv $OUTPATH/UKDA-8128-tab/tab/uktus15_wksched.tab $OUTPATH
mv $OUTPATH/UKDA-8090-tab/tab/whs_2015_adult_archive_v1.tab $OUTPATH
mv $OUTPATH/UKDA-8090-tab/tab/whs_2015_child_archive_v1.tab $OUTPATH

# Remove unzipped
rm -r $OUTPATH/UKDA-8860-TAB
rm -r $OUTPATH/UKDA-8090-TAB
rm -r $OUTPATH/UKDA-8737-TAB
rm -r $OUTPATH/UKDA-8128-TAB

# Run OA and LSOA collection
pip install -r raw_prep/requirements.txt
python raw_prep/prep_dl.py