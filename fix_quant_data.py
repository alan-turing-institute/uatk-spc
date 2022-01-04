import numpy
import pickle

for name in ['hospitalProbHij', 'primaryProbPij', 'retailpointsProbSij', 'secondaryProbPij']:
    print(f'Converting {name} from pickle to numpy format')
    data = pickle.load(open(f'raw_data/nationaldata/QUANT_RAMP/{name}.bin', 'rb'))
    numpy.save(f'raw_data/nationaldata/QUANT_RAMP/{name}.npy', data)
