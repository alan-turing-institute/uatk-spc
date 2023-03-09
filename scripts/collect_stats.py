#!/usr/bin/python3
# This script takes stats.csv, produced by scripts/run_pipeline_everywhere.sh,
# and outputs a table for docs/performance.md
#
# This has a dependency on `pip install py-markdown-table`

from os import listdir
import csv
from markdownTable import markdownTable

rows = []
with open("stats.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

# Print as a Markdown table for convenience
with open("perf_table", "w") as f:
    # This still isn't quite Github's format; the +'s are weird
    f.write(markdownTable(rows).setParams(row_sep="markdown", quote=False).getMarkdown())
