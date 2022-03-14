import os
from yaml import load, SafeLoader

from aspics.simulator import Simulator
from aspics.snapshot import Snapshot
from aspics.params import Params, IndividualHazardMultipliers, LocationHazardMultipliers


def setup_sim(parameters_file):
    print(f"Running a simulation based on {parameters_file}")

    try:
        with open(parameters_file, "r") as f:
            parameters = load(f, Loader=SafeLoader)
            sim_params = parameters["microsim"]
            calibration_params = parameters["microsim_calibration"]
            disease_params = parameters["disease"]
            iterations = sim_params["iterations"]
            study_area = sim_params["study-area"]
            output = sim_params["output"]
            output_every_iteration = sim_params["output-every-iteration"]
            use_lockdown = sim_params["use-lockdown"]
            startDate = sim_params["start-date"]
    except Exception as error:
        print("Error in parameters file format")
        raise error

    # Check the parameters are sensible
    if iterations < 1:
        raise ValueError("Iterations must be > 1")
    if (not output) and output_every_iteration:
        raise ValueError(
            "Can't choose to not output any data (output=False) but also write the data at every "
            "iteration (output_every_iteration=True)"
        )

    # Load the snapshot file, built by Rust
    snapshot_path = f"data/processed_data/{study_area}/snapshot/cache.npz"
    if not os.path.exists(snapshot_path):
        raise Exception(
            f"Missing snapshot cache {snapshot_path}. Run the Rust pipeline first to generate it."
        )
    print(f"Loading snapshot from {snapshot_path}")
    snapshot = Snapshot.load_full_snapshot(path=snapshot_path)
    print(f"Snapshot is {int(snapshot.num_bytes() / 1000000)} MB")

    # set the random seed of the model
    snapshot.seed_prngs(42)

    # set params
    if calibration_params is not None and disease_params is not None:
        snapshot.update_params(create_params(calibration_params, disease_params))

        if disease_params["improve_health"]:
            print("Switching to healthier population")
            snapshot.switch_to_healthier_population()

    # Create a simulator and upload the snapshot data to the OpenCL device
    simulator = Simulator(snapshot, parameters_file, gpu=True)
    [people_statuses, people_transition_times] = simulator.seeding_base()
    simulator.upload_all(snapshot.buffers)
    simulator.upload("people_statuses", people_statuses)
    simulator.upload("people_transition_times", people_transition_times)

    return simulator, snapshot, study_area


def create_params(calibration_params, disease_params):
    current_risk_beta = disease_params["current_risk_beta"]

    # NB: OpenCL model incorporates the current risk beta by pre-multiplying the hazard multipliers with it
    location_hazard_multipliers = LocationHazardMultipliers(
        retail=calibration_params["hazard_location_multipliers"]["Retail"]
        * current_risk_beta,
        nightclubs=calibration_params["hazard_location_multipliers"]["Nightclubs"]
        * current_risk_beta,
        primary_school=calibration_params["hazard_location_multipliers"][
            "PrimarySchool"
        ]
        * current_risk_beta,
        secondary_school=calibration_params["hazard_location_multipliers"][
            "SecondarySchool"
        ]
        * current_risk_beta,
        home=calibration_params["hazard_location_multipliers"]["Home"]
        * current_risk_beta,
        work=calibration_params["hazard_location_multipliers"]["Work"]
        * current_risk_beta,
    )

    individual_hazard_multipliers = IndividualHazardMultipliers(
        presymptomatic=calibration_params["hazard_individual_multipliers"][
            "presymptomatic"
        ],
        asymptomatic=calibration_params["hazard_individual_multipliers"][
            "asymptomatic"
        ],
        symptomatic=calibration_params["hazard_individual_multipliers"]["symptomatic"],
    )

    obesity_multipliers = [
        disease_params["overweight"],
        disease_params["obesity_30"],
        disease_params["obesity_35"],
        disease_params["obesity_40"],
    ]

    return Params(
        location_hazard_multipliers=location_hazard_multipliers,
        individual_hazard_multipliers=individual_hazard_multipliers,
        obesity_multipliers=obesity_multipliers,
        cvd_multiplier=disease_params["cvd"],
        diabetes_multiplier=disease_params["diabetes"],
        bloodpressure_multiplier=disease_params["bloodpressure"],
    )
