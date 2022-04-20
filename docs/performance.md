# Performance

The following tables summarizes the resources SPC needs to run in different areas.

|     study_area     |num_msoas|num_households|num_people|pb_file_size|  runtime |commuting_runtime|memory_usage|
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|       bristol      |    55   |    193,873   |  394,739 |  61.99MiB  | 5 seconds|     1 second    |  141.45MiB |
|        devon       |   107   |    345,882   |  679,259 |  105.22MiB |16 seconds|    6 seconds    |  277.20MiB |
|        leeds       |   107   |    331,059   |  671,416 |  104.60MiB |20 seconds|    7 seconds    |  276.95MiB |
|      liverpool     |    61   |    216,559   |  405,738 |  61.08MiB  | 9 seconds|    3 seconds    |  140.54MiB |
|       london       |   983   |   3,076,198  | 6,289,513|  969.80MiB | 7 minutes|    6 minutes    |   2.17GiB  |
|    two_counties    |    4    |    13,958    |  27,028  |   4.49MiB  |10 seconds|     1 second    |  11.55MiB  |
|west_yorkshire_large|   299   |    954,106   | 1,961,027|  301.93MiB |41 seconds|    25 seconds   |  563.91MiB |
|west_yorkshire_small|    3    |    11,033    |  23,575  |   4.00MiB  | 7 seconds|     1 second    |  11.42MiB  |

Notes:

- `pb_file_size` refers to the size of the uncompressed protobuf file in `data/output/`
- The total `runtime` is usually dominated by matching workers to businesses, so `commuting_runtime` gives a breakdown
- Measuring memory usage of Linux processes isn't straightforward, so `memory_usage` should just be a guide
- These measurements were all taken on one developer's laptop, and they don't represent multiple runs. This table just aims to give a general sense of how long running takes.
  - That machine has 16 cores, which matters for the parallelized commuting calculation.
- `scripts/collect_stats.py` produces the table above
