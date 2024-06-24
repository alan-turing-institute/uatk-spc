import sys

import synthpop_pb2
from google.protobuf.json_format import MessageToJson

if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} synthpop_protobuf_file")
    sys.exit(-1)

pop = synthpop_pb2.Population()
f = open(sys.argv[1], "rb")
pop.ParseFromString(f.read())
f.close()

# SPC uses 0 for some IDs. Proto3 optimizes "default values" away, but this is
# incredibly misleading when viewing the JSON.
print(MessageToJson(pop, including_default_value_fields=True))
