#!/bin/bash

# Args:
#  -s    <PATH>   : Source path of microsimulation data to upload
#  -v <VERSION>   : Version for container name to copy data to.
#                   Container must already have been created.
#  -d             : Dry run flag.
#  -t <SAS_TOKEN> : SAS token for authorization.

set -e

dryrun='false'
while getopts 'ds:v:t:' flag; do
	case "${flag}" in
		d) dryrun='true' ;;
		s) SOURCE="${OPTARG}" ;;
		t) SAS_TOKEN="${OPTARG}" ;;
        v) VERSION="${OPTARG}" ;;
		*) error "Unexpected option ${flag}" ;;
	esac
done

DESTINATION=https://ramp0storage.blob.core.windows.net/countydata-${VERSION}/./$SAS_TOKEN

echo "Source: ${SOURCE}"
echo "Destination: ${DESTINATION}"
echo "Dry-run: ${dryrun}"

if [[ $dryrun == 'true' ]]; then
    azcopy copy \
        $SOURCE/* \
        $DESTINATION \
        --dry-run \
        --recursive \
        --s2s-preserve-properties=true \
        --include-pattern='*.csv.gz'
else
    gzip -kr $SOURCE/
    azcopy copy \
        $SOURCE/* \
        $DESTINATION \
        --recursive \
        --s2s-preserve-properties=true \
        --include-pattern='*.csv.gz'
fi
