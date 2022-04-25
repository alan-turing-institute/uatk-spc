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

mkdir $VERSION

for path in data/output/*; do
	area=$(basename "${path%%.*}")
	echo $area;
	cp $path $VERSION
	gzip $VERSION/$(basename $path)
	echo "- [$area](https://ramp0storage.blob.core.windows.net/spc-output/$VERSION/$area.pb.gz)" >> urls
done

echo Uploading
az storage blob upload-batch --account-name ramp0storage -d spc-output/$VERSION -s $VERSION/
echo Update docs/outputs.md with urls
