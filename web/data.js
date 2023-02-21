import centroid from "@turf/centroid";
import { synthpop } from "./pb/synthpop_pb.js";

export const PER_PERSON_NUMERIC_PROPS = {
  age: {
    get: (p) => p.demographics.ageYears,
    label: "age (years)",
    fmt: (x) => x.toFixed(0),
    theme: "Demographics",
  },
  salary_yearly: {
    // TODO Reinventing Option types and what the codegen should do :(
    get: (p) => {
      if (p.employment.hasOwnProperty("salaryYearly")) {
        return p.employment.salaryYearly;
      }
      return null;
    },
    label: "yearly salary for working population",
    fmt: (x) => x.toFixed(1),
    theme: "Employment",
  },
  salary_hourly: {
    get: (p) => {
      if (p.employment.hasOwnProperty("salaryHourly")) {
        return p.employment.salaryHourly;
      }
      return null;
    },
    label: "hourly salary for working population",
    fmt: (x) => x.toFixed(1),
    theme: "Employment",
  },
  bmi: {
    get: (p) => {
      if (p.health.hasOwnProperty("bmi")) {
        return p.health.bmi;
      }
      return null;
    },
    label: "BMI for adult population",
    fmt: (x) => x.toFixed(1),
    theme: "Health",
  },
};

function enumToString(enumObj) {
  let mapping = {};
  for (let [string, num] of Object.entries(enumObj)) {
    mapping[num] = string;
  }
  return mapping;
}

function numberEnumMap(max) {
  return Object.fromEntries(
    [...Array(max + 1).keys()].map((i) => [i, i.toString()])
  );
}

export const PER_PERSON_CATEGORICAL_PROPS = {
  sex: {
    get: (p) => p.demographics.sex,
    label: "sex",
    lookup: enumToString(synthpop.Sex),
    theme: "Demographics",
  },
  ethnicity: {
    get: (p) => p.demographics.ethnicity,
    label: "ethnicity",
    lookup: enumToString(synthpop.Ethnicity),
    theme: "Demographics",
  },
  // TODO This one becomes optional
  socioeconomic_classification: {
    get: (p) => p.demographics.nssec8,
    label: "socioeconomic classification",
    lookup: enumToString(synthpop.Nssec8),
    theme: "Employment",
  },
  pwkstat: {
    get: (p) => p.employment.pwkstat,
    label: "Professional working status",
    lookup: enumToString(synthpop.PwkStat),
    theme: "Employment",
  },
};

export const PER_HOUSEHOLD_CATEGORICAL_PROPS = {
  // TODO Most of these are optional
  socioeconomic_classification: {
    get: (hh) => hh.nssec8,
    label: "Professional working status of reference person",
    lookup: enumToString(synthpop.Nssec8),
    theme: "Household",
  },
  accommodation_type: {
    get: (hh) => hh.accommodationType,
    label: "Accomodation type",
    lookup: enumToString(synthpop.AccommodationType),
    theme: "Household",
  },
  communal_type: {
    get: (hh) => hh.communalType,
    label: "Type of communal establishment",
    lookup: enumToString(synthpop.CommunalType),
    theme: "Household",
  },
  num_rooms: {
    get: (hh) => hh.numRooms,
    label: "Number of rooms (capped at 6)",
    lookup: numberEnumMap(6),
    theme: "Household",
  },
  // TODO central_heat is effectively an enum
  central_heat: {
    get: (hh) => hh.centralHeat,
    label: "Central heating",
    lookup: {
      false: "no",
      true: "yes",
    },
    theme: "Household",
  },
  tenure: {
    get: (hh) => hh.tenure,
    label: "Tenure",
    lookup: enumToString(synthpop.Tenure),
    theme: "Household",
  },
  num_cars: {
    get: (hh) => hh.numCars,
    label: "Number of cars (capped at 3)",
    lookup: numberEnumMap(3),
    theme: "Household",
  },
};

// Returns a mapping from MSOA ID to the GJ Feature
export function msoaStats(pop) {
  // Counts
  let households_per_msoa = {};
  let people_per_msoa = {};

  // Averages of numeric data. Map<key, Map<MSOA, float>>
  let averages = {};
  let n = {};
  // TODO Look for something that can build up in-place
  for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
    averages[key] = {};
    n[key] = {};
  }

  // Initialize sum for all MSOAs
  for (let id of Object.keys(pop.infoPerMsoa)) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      averages[key][id] = 0.0;
      n[key][id] = 0;
    }
  }

  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;

    // Sum per MSOA
    for (let id of hh.members) {
      let person = pop.people[id];
      for (let [key, prop] of Object.entries(PER_PERSON_NUMERIC_PROPS)) {
        let value = prop.get(person);
        if (value != null) {
          averages[key][hh.msoa11cd] += value;
          n[key][hh.msoa11cd]++;
        }
      }
    }
  }

  for (let id of Object.keys(pop.infoPerMsoa)) {
    for (let [key, avg] of Object.entries(averages)) {
      avg[id] /= n[key][id];
    }
  }

  let msoas = {};
  for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
    let properties = {
      id,
      households: households_per_msoa[id],
      people: people_per_msoa[id],
    };
    for (let [key, avg] of Object.entries(averages)) {
      properties[key] = avg[id];
    }

    msoas[id] = {
      type: "Feature",
      properties,
      geometry: {
        coordinates: [info.shape.map((pt) => [pt.longitude, pt.latitude])],
        type: "Polygon",
      },
    };
  }
  return msoas;
}

export function getFlows(pop, msoas, msoa, activity) {
  let gj = emptyGeojson();
  if (activity == "none") {
    return gj;
  }

  // TODO Cache some of this, maybe even automatically
  let from = centroid(msoas[msoa]).geometry.coordinates;

  for (let flows of pop.infoPerMsoa[msoa].flowsPerActivity) {
    if (activity == "all" || activity == flows.activity) {
      for (let flow of flows.flows) {
        let rawTo =
          pop.venuesPerActivity[flows.activity].venues[flow.venueId].location;
        let to = [rawTo.longitude, rawTo.latitude];

        gj.features.push({
          type: "Feature",
          properties: {
            weight: flow.weight,
          },
          geometry: {
            coordinates: [from, to],
            type: "LineString",
          },
        });
      }
    }
  }

  return gj;
}

export function emptyGeojson() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}
