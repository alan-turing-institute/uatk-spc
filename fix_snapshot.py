import json
import numpy
import os
import sys

snapshot_path = sys.argv[1]

# Load everything from the NPZ into memory again
buffers = {}
with numpy.load(snapshot_path, allow_pickle=True) as npz:
    buffers = dict(npz)

# Add area codes in the numpy format
area_codes_path = snapshot_path + '_area_codes.json'
area_codes = json.load(open(area_codes_path))
buffers['area_codes'] = numpy.asarray(area_codes, dtype=object)

# Overwrite the .npz and delete the JSON file
numpy.savez(snapshot_path, **buffers)
os.remove(area_codes_path)
