import click
import uatk_spc.synthpop_pb2 as synthpop_pb2
from google.protobuf.json_format import MessageToJson


@click.command()
@click.option("--input-path", required=True, help="path to an SPC .pb file")
def convert_to_json(input_path: str) -> None:
    """Converts a protobuf population to JSON.

    Args:
        input_path (str): Input path to a SPC protobuf file.

    """
    pop = synthpop_pb2.Population()
    with open(input_path, "rb") as f:
        pop.ParseFromString(f.read())

    # SPC uses 0 for some IDs. Proto3 optimizes "default values" away, but this is
    # incredibly misleading when viewing the JSON.
    print(MessageToJson(pop, including_default_value_fields=True))


if __name__ == "__main__":
    convert_to_json()
