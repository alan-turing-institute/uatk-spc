import json
import numpy
import os
import sys

# The Rust library for writing numpy arrays doesn't handle strings, so use this
# Python script to add area codes to the snapshot file.

target_dir = sys.argv[1]
snapshot_path = target_dir + '/snapshot/cache.npz'

# Load everything from the NPZ into memory again
buffers = {}
with numpy.load(snapshot_path, allow_pickle=True) as npz:
    buffers = dict(npz)

# Add area codes in the numpy format
area_codes = json.load(open(target_dir + '/area_codes.json'))
buffers['area_codes'] = numpy.asarray(area_codes, dtype=object)

# Overwrite the .npz. Keep the JSON file around, so this script is idempotent and delete the JSON file
numpy.savez(snapshot_path, **buffers)
