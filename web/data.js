import centroid from "@turf/centroid";
import { synthpop } from "./pb/synthpop_pb.js";

export const PER_PERSON_NUMERIC_PROPS = {
  age: {
    get: (p) => p.demographics.ageYears,
    label: "age (years)",
    fmt: (x) => x.toFixed(0),
  },
  salary_yearly: {
    get: (p) => p.employment.salaryYearly,
    label: "yearly salary",
    fmt: (x) => x.toFixed(1),
  },
  salary_hourly: {
    get: (p) => p.employment.salaryHourly,
    label: "hourly salary",
    fmt: (x) => x.toFixed(1),
  },
  bmi: {
    get: (p) => p.health.bmiNew,
    label: "BMI",
    fmt: (x) => x.toFixed(1),
  },
};

function enumToString(enumObj) {
  let mapping = {};
  for (let [string, num] of Object.entries(enumObj)) {
    mapping[num] = string;
  }
  return mapping;
}

export const PER_PERSON_CATEGORICAL_PROPS = {
  sex: {
    get: (p) => p.demographics.sex,
    label: "sex",
    lookup: enumToString(synthpop.Sex),
  },
  origin: {
    get: (p) => p.demographics.origin,
    label: "origin",
    lookup: enumToString(synthpop.Origin),
  },
  socioeconomic_classification: {
    get: (p) => p.demographics.socioeconomicClassification,
    label: "socioeconomic classification",
    lookup: enumToString(synthpop.NSSEC5),
  },
  pwkstat: {
    get: (p) => p.employment.pwkstat,
    label: "Professional working status",
    lookup: enumToString(synthpop.PwkStat),
  },
};

// Returns a mapping from MSOA ID to the GJ Feature
export function msoaStats(pop) {
  // Counts
  let households_per_msoa = {};
  let people_per_msoa = {};

  // Averages of numeric data. Map<key, Map<MSOA, float>>
  let averages = {};
  for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
    averages[key] = {};
  }

  // Initialize sum for all MSOAs
  for (let id of Object.keys(pop.infoPerMsoa)) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      averages[key][id] = 0.0;
    }
  }

  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;

    // Sum per MSOA
    for (let id of hh.members) {
      let person = pop.people[id];
      for (let [key, prop] of Object.entries(PER_PERSON_NUMERIC_PROPS)) {
        averages[key][hh.msoa11cd] += prop.get(person);
      }
    }
  }

  let avg_household_size = {};
  for (let id of Object.keys(pop.infoPerMsoa)) {
    let n = people_per_msoa[id];
    // TODO Cast?
    avg_household_size[id] = n / households_per_msoa[id];

    for (let [key, avg] of Object.entries(averages)) {
      avg[id] /= n;
    }
  }

  let msoas = {};
  for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
    let properties = {
      id,
      households: households_per_msoa[id],
      people: people_per_msoa[id],
      avg_household_size: avg_household_size[id],
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
