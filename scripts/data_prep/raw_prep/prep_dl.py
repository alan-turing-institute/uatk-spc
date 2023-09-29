#!/usr/bin/env python
# coding: utf-8

import os
import requests
import pandas as pd
import hashlib

DIGESTS = {
    "Output_Areas_Dec_2011_PWC_2022.csv": "4405d695f10556a0f3ff35e36f3aaa1013102da6a4a0c0fffd26554a318faa4f",
    "LSOA_Dec_2011_PWC_in_England_and_Wales_2022.csv": "4bbc2e6b58302ee274e9c75c6bd9bc068074da08909ca7cffe751c3eb10034e5",
}

OA_URL = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Output_Areas_Dec_2011_PWC_2022/FeatureServer/0/query?where=1%3D1&outFields=*&f=json"
LSOA_URL = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/LSOA_Dec_2011_PWC_in_England_and_Wales_2022/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=&f=json"


def check_digest(file_name):
    digest = hashlib.sha256(open(file_name, "rb").read()).hexdigest()
    expected_digest = DIGESTS[os.path.basename(file_name)]
    try:
        assert digest == expected_digest
    except AssertionError:
        raise (
            AssertionError(
                f"Digest for '{file_name}' is '{digest}' and does not equal expected '{expected_digest}'"
            )
        )


def get_flattened_df(url: str) -> pd.DataFrame:
    """Gets data from API through repeated offset calls until all collected."""
    features = []
    offset = 0
    while True:
        url_ = f"{url}&resultOffset={offset}"
        response = requests.get(url_)
        offset_features = response.json()["features"]
        if len(offset_features) == 0:
            break
        else:
            features += offset_features
            # Max number of results per request
            offset += 2000
    df = pd.DataFrame.from_records(features)
    return pd.concat(
        [
            pd.DataFrame.from_records(df["attributes"]),
            pd.DataFrame.from_records(df["geometry"]),
        ],
        axis=1,
    )


def main():
    print("Getting OA data...")
    df_oas = get_flattened_df(OA_URL)
    print("Getting LSOA data...")
    df_lsoas = get_flattened_df(LSOA_URL)
    outpath = "Data/dl"
    oa_file_name = os.path.join(outpath, "Output_Areas_Dec_2011_PWC_2022.csv")
    lsoa_file_name = os.path.join(
        outpath, "LSOA_Dec_2011_PWC_in_England_and_Wales_2022.csv"
    )

    # OA output and check
    df_oas.to_csv(
        oa_file_name,
        index=None,
        line_terminator="\r\n",
    )
    check_digest(oa_file_name)

    # LSOA out and check
    df_lsoas.rename(columns={"lsoa11nm": "LSOA11NM", "lsoa11cd": "LSOA11CD"}).to_csv(
        lsoa_file_name,
        index=None,
        line_terminator="\r\n",
    )
    check_digest(lsoa_file_name)


if __name__ == "__main__":
    main()
