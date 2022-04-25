from google.protobuf.json_format import MessageToJson
import synthpop_pb2
import sys

if len(sys.argv) != 2:
  print(f"Usage: {sys.argv[0]} synthpop_protobuf_file")
  sys.exit(-1)

pop = synthpop_pb2.Population()
f = open(sys.argv[1], "rb")
pop.ParseFromString(f.read())
f.close()

print(MessageToJson(pop))
