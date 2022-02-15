#!/bin/sh
# Generates a manifest file of everything in raw_data. This is a quick
# workaround before figuring out easier file management, either with Git-LFS,
# https://github.com/a-b-street/abstreet/tree/master/updater, or something else

set -e

manifest=manifest.csv
echo 'file,bytes,checksum' > $manifest

for file in `find data/raw_data/ -type f`; do
	echo $file
	checksum=`md5sum $file | cut -d ' ' -f1`
	bytes=`stat -c %s $file`
	echo "$file,$bytes,$checksum" >> $manifest
done
