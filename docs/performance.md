# Performance

The following tables summarizes the resources SPC needs to run in different areas.

```
+---------------------------------------------------------------------------------------------------------------+
|     study_area     |num_msoas|num_households|num_people|pb_file_size|  runtime |commuting_runtime|memory_usage|
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|west_yorkshire_large|   299   |    954,106   | 1,961,027| 1001.52MiB |58 seconds|    0 seconds    |   1.51GiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|       london       |   983   |   3,076,198  | 6,289,513|   3.15GiB  | 3 minutes|    0 seconds    |   5.29GiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|        devon       |   107   |    345,882   |  679,259 |  350.14MiB |26 seconds|    0 seconds    |  627.94MiB |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|    two_counties    |    4    |    13,958    |  27,028  |  14.12MiB  | 9 seconds|    0 seconds    |  25.16MiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|    two_counties    |    4    |    13,958    |  27,028  |  14.12MiB  | 9 seconds|    0 seconds    |  25.16MiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|       bristol      |    55   |    193,873   |  394,739 |  203.30MiB |13 seconds|    0 seconds    |  342.80MiB |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|west_yorkshire_small|    3    |    11,033    |  23,575  |  12.36MiB  | 6 seconds|    0 seconds    |  23.43MiB  |
+---------------------------------------------------------------------------------------------------------------+
```

Notes:

- `pb_file_size` refers to the size of the protobuf file in `data/output/`
- The total `runtime` is usually dominated by matching workers to businesses, so `commuting_runtime` gives a breakdown
- Measuring memory usage of Linux processes isn't straightforward, so `memory_usage` should just be a guide
- These measurements were all taken on one developer's laptop, and they don't represent multiple runs. This table just aims to give a general sense of how long running takes.
- `scripts/collect_stats.py` produces the table above
