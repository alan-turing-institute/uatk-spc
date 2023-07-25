#!/bin/bash
# This script gzips all data/output/ files and uploads to Azure. It's only
# meant to be run by SPC maintainers; nobody else will have permission to write
# to Azure.

set -e

VERSION=$1
if [ "$VERSION" == "" ]; then
	echo Pass a version
	exit 1
fi

if [ "$SAS_TOKEN" == "" ]; then
	echo Get a SAS token for access authorization.
	exit 1
fi

# This modifies the local copy of data/output in-place, then undoes that later.
# Feel free to copy everything before starting this script, if you have that
# much space and are paranoid about not undoing something properly.

mv data/output $VERSION
gzip -rv $VERSION

echo Uploading
az storage blob upload-batch \
	--sas-token $SAS_TOKEN \
	--account-name ramp0storage \
	-d spc-output/$VERSION \
	-s $VERSION/

# Generate URLs for docs/outputs.qmd
cd $VERSION
for x in */*/*; do
	echo "- [$x](https://ramp0storage.blob.core.windows.net/spc-output/$VERSION/$x)" >> urls
done
mv urls ..
cd ..

echo Restoring original output data
mv $VERSION data/output
gunzip -rv data/output
