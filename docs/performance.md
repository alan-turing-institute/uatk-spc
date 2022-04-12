# Performance

The following tables summarizes the resources SPC needs to run in different areas.

|     study_area     |num_msoas|num_households|num_people|pb_file_size|  runtime |commuting_runtime|memory_usage|
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|west_yorkshire_large|   299   |    954,106   | 1,961,027| 1009.78MiB |74 seconds|    26 seconds   |   1.53GiB  |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|       london       |   983   |   3,076,198  | 6,289,513|   3.19GiB  | 8 minutes|    6 minutes    |   5.35GiB  |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|        leeds       |   107   |    331,059   |  671,416 |  347.08MiB |31 seconds|    7 seconds    |  628.50MiB |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|        devon       |   107   |    345,882   |  679,259 |  353.06MiB |27 seconds|    6 seconds    |  632.97MiB |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|    two_counties    |    4    |    13,958    |  27,028  |  14.20MiB  |10 seconds|     1 second    |  25.40MiB  |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|    two_counties    |    4    |    13,958    |  27,028  |  14.20MiB  |10 seconds|     1 second    |  25.40MiB  |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|       bristol      |    55   |    193,873   |  394,739 |  204.51MiB |14 seconds|    2 seconds    |  345.19MiB |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|west_yorkshire_small|    3    |    11,033    |  23,575  |  12.40MiB  | 6 seconds|     1 second    |  23.60MiB  |
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|      liverpool     |    61   |    216,559   |  405,738 |  209.54MiB |15 seconds|    3 seconds    |  350.06MiB |

Notes:

- `pb_file_size` refers to the size of the protobuf file in `data/output/`
- The total `runtime` is usually dominated by matching workers to businesses, so `commuting_runtime` gives a breakdown
- Measuring memory usage of Linux processes isn't straightforward, so `memory_usage` should just be a guide
- These measurements were all taken on one developer's laptop, and they don't represent multiple runs. This table just aims to give a general sense of how long running takes.
  - That machine has 16 cores, which matters for the parallelized commuting calculation.
- `scripts/collect_stats.py` produces the table above
