#!/bin/sh
# Generates a manifest file of everything in raw_data. This is a quick
# workaround before figuring out easier file management, either with Git-LFS,
# https://github.com/a-b-street/abstreet/tree/master/updater, or something else
#
# Run from the repository's root directory

set -e

manifest=data/manifest.csv
echo 'file,bytes,checksum' > $manifest

for file in `find data/raw_data -type f`; do
	echo $file
	checksum=`md5sum $file | cut -d ' ' -f1`
	if [[ `uname -s` == 'Darwin' ]]; then
		bytes=`stat -f %z $file`
	else
		bytes=`stat -c %s $file`
	fi
	echo "$file,$bytes,$checksum" >> $manifest
done
