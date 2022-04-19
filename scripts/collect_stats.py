# This script runs SPC for all study areas and outputs a table for docs/performance.md
#
# This has a dependency on `pip install py-markdown-table`

from os import listdir
import subprocess
import csv
from markdownTable import markdownTable

rows = []
for study_area in sorted(listdir("config")):
    if study_area == "national.csv":
        continue
    # Assume `cargo build --release` has happened
    subprocess.run(
        ["./target/release/spc", "config/" + study_area, "--output-stats"], check=True
    )
    with open("stats.csv") as f:
        for row in csv.DictReader(f):
            rows.append(row)

# Print as a Markdown table for convenience
with open("stats.csv") as f:
    # This still isn't quite Github's format; the +'s are weird
    print(markdownTable(rows).setParams(row_sep="markdown", quote=False).getMarkdown())
