import numpy
import pickle

# The QUANT data is stored in the pickle format, but Rust only has easy support
# for reading regular numpy arrays. Just do the conversion in Python for
# simplicity.

for name in ['hospitalProbHij', 'primaryProbPij', 'retailpointsProbSij', 'secondaryProbPij']:
    print(f'Converting {name} from pickle to numpy format')
    data = pickle.load(open(f'raw_data/nationaldata/QUANT_RAMP/{name}.bin', 'rb'))
    numpy.save(f'raw_data/nationaldata/QUANT_RAMP/{name}.npy', data)
