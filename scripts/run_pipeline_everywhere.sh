#!/bin/bash
# This uses https://github.com/Nukesor/pueue to track progress of all jobs, and
# see logs for when failures happen. Feel free to substitute / recommend some
# other system.

set -e
set -x

cargo build --release

# If you want to get "fair" timings for performance.qmd, run in isolation:
#
pueue parallel 1
#
# You can try increasing this to finish jobs faster. Internally each run will
# try to use all CPU cores during the expensive commuting step, but because
# some threads will take much longer to complete, running multiple pipelines
# can still give net wins.

# Clear the output stats file; each job will append a line to it
echo 'year,study_area,num_msoas,num_households,num_people,pb_file_size,runtime,commuting_runtime,memory_usage' > stats.csv

for cfg in config/*/*; do
	for year in 2012 2020 2022 2032 2039; do
		pueue add -- ./target/release/spc $cfg --year $year --rng-seed 0 --output-stats;
	done
done

# Wait for all jobs to complete, then use scripts/collect_stats.py to
# regenerate the table in performance.qmd
