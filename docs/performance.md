# Performance

The following tables summarizes the resources SPC needs to run in different areas.

+---------------------------------------------------------------------------------------------------------------+
|     study_area     |num_msoas|num_households|num_people|pb_file_size|  runtime |commuting_runtime|memory_usage|
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|west_yorkshire_large|   299   |    954,106   | 1,961,027| 1009.65MiB | 3 minutes|    3 minutes    |   1.53GiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|       london       |   983   |   3,076,198  | 6,289,513|   3.19GiB  |57 minutes|    55 minutes   |   5.33GiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|        devon       |   107   |    345,882   |  679,259 |  352.95MiB |47 seconds|    25 seconds   |  631.73MiB |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|    two_counties    |    4    |    13,958    |  27,028  |  14.19MiB  |10 seconds|     1 second    |  25.27MiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|    two_counties    |    4    |    13,958    |  27,028  |  14.19MiB  |10 seconds|     1 second    |  25.27MiB  |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|       bristol      |    55   |    193,873   |  394,739 |  204.39MiB |17 seconds|    4 seconds    |  344.48MiB |
+--------------------+---------+--------------+----------+------------+----------+-----------------+------------+
|west_yorkshire_small|    3    |    11,033    |  23,575  |  12.40MiB  | 7 seconds|     1 second    |  23.49MiB  |
+---------------------------------------------------------------------------------------------------------------+

Notes:

- `pb_file_size` refers to the size of the protobuf file in `data/output/`
- The total `runtime` is usually dominated by matching workers to businesses, so `commuting_runtime` gives a breakdown
- Measuring memory usage of Linux processes isn't straightforward, so `memory_usage` should just be a guide
- These measurements were all taken on one developer's laptop, and they don't represent multiple runs. This table just aims to give a general sense of how long running takes.
- `scripts/collect_stats.py` produces the table above
