# Performance

The following tables summarizes the resources SPC needs to run in different areas.

|     study_area     |num_msoas|num_households|num_people|pb_file_size|  runtime |commuting_runtime|memory_usage|
|--------------------|---------|--------------|----------|------------|----------|-----------------|------------|
|       bristol      |    55   |    196,230   |  456,532 |  70.54MiB  | 5 seconds|     1 second    |  142.14MiB |
|        devon       |   107   |    347,762   |  783,695 |  119.16MiB |16 seconds|    7 seconds    |  278.37MiB |
|        leeds       |   107   |    333,449   |  771,520 |  118.60MiB |20 seconds|    7 seconds    |  278.05MiB |
|      liverpool     |    61   |    218,559   |  494,999 |  73.66MiB  | 9 seconds|    3 seconds    |  141.51MiB |
|       london       |   983   |   3,135,814  | 8,672,103|   1.28GiB  |11 minutes|    10 minutes   |   3.95GiB  |
|    two_counties    |    4    |    14,011    |  31,024  |   5.02MiB  |10 seconds|     1 second    |  11.60MiB  |
|west_yorkshire_large|   299   |    960,426   | 2,272,063|  345.67MiB |43 seconds|    27 seconds   | 1015.37MiB |
|west_yorkshire_small|    3    |    11,105    |  27,466  |   4.55MiB  | 6 seconds|     1 second    |  11.46MiB  |

Notes:

- `pb_file_size` refers to the size of the uncompressed protobuf file in `data/output/`
- The total `runtime` is usually dominated by matching workers to businesses, so `commuting_runtime` gives a breakdown
- Measuring memory usage of Linux processes isn't straightforward, so `memory_usage` should just be a guide
- These measurements were all taken on one developer's laptop, and they don't represent multiple runs. This table just aims to give a general sense of how long running takes.
  - That machine has 16 cores, which matters for the parallelized commuting calculation.
- `scripts/collect_stats.py` produces the table above
