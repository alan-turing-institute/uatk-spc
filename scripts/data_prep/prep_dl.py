#!/usr/bin/env python
# coding: utf-8

import requests
import pandas as pd

OA_URL = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Output_Areas_Dec_2011_PWC_2022/FeatureServer/0/query?where=1%3D1&outFields=*&f=json"
LSOA_URL = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/LSOA_Dec_2011_PWC_in_England_and_Wales_2022/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=&f=json"


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
    rounding = 9
    df_oas.round(rounding).to_csv(
        f"{outpath}/Output_Areas_Dec_2011_PWC_2022.csv", index=None
    )
    df_lsoas.round(rounding).rename(
        columns={"lsoa11nm": "LSOA11NM", "lsoa11cd": "LSOA11CD"}
    ).to_csv(f"{outpath}/LSOA_Dec_2011_PWC_in_England_and_Wales_2022.csv", index=None)


if __name__ == "__main__":
    main()
