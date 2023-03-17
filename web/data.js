import { mean, median } from "simple-statistics";
import centroid from "@turf/centroid";
import { synthpop } from "./pb/synthpop_pb.js";

export const PER_PERSON_NUMERIC_PROPS = {
  age: {
    get: (p) => {
      let age = p.demographics.ageYears;
      if (age == 86) {
        return null;
      }
      return age;
    },
    label: "Age (years)",
    fmt: (x) => x.toFixed(0),
    theme: "Demographics",
    note: "Age 86 and above are filtered out, because the data is clamped to this max value",
  },
  salary_yearly: {
    get: (p) => getOptional(p.employment, "salaryYearly"),
    label: "Yearly salary for working population",
    fmt: (x) => x.toFixed(1),
    theme: "Employment",
  },
  salary_hourly: {
    get: (p) => getOptional(p.employment, "salaryHourly"),
    label: "Hourly salary for working population",
    fmt: (x) => x.toFixed(1),
    theme: "Employment",
  },
  bmi: {
    get: (p) => getOptional(p.health, "bmi"),
    label: "BMI for individuals over 16",
    fmt: (x) => x.toFixed(1),
    theme: "Health",
    showAverage: true,
  },
};

function getOptional(object, key) {
  // TODO Reinventing Option types and what the codegen should do :(
  if (object.hasOwnProperty(key)) {
    return object[key];
  }
  return null;
}

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
    label: "Sex",
    lookup: enumToString(synthpop.Sex),
    theme: "Demographics",
    note: "Sex assigned at birth, as reported in census",
  },
  ethnicity: {
    get: (p) => p.demographics.ethnicity,
    label: "Ethnicity",
    lookup: enumToString(synthpop.Ethnicity),
    theme: "Demographics",
    note: "Self-reported in the census",
    pieChart: true,
  },
  socioeconomic_classification: {
    get: (p) => getOptional(p.demographics, "nssec8"),
    label: "NSSEC socioeconomic classification",
    lookup: enumToString(synthpop.Nssec8),
    theme: "Employment",
    pieChart: true,
  },
  pwkstat: {
    get: (p) => {
      let x = p.employment.pwkstat;
      if (x == synthpop.PwkStat.NA || x == synthpop.PwkStat.PWK_OTHER) {
        return null;
      }
      return x;
    },
    label: "Professional working status",
    lookup: enumToString(synthpop.PwkStat),
    theme: "Employment",
    note: 'Under 16 years and "other" categories filtered out',
  },
  self_assessed_health: {
    get: (p) => getOptional(p.health, "selfAssessedHealth"),
    label: "Self-assessed general health",
    lookup: enumToString(synthpop.SelfAssessedHealth),
    theme: "Health",
  },
  life_satisfaction: {
    get: (p) => getOptional(p.health, "lifeSatisfaction"),
    label: "Life satisfaction",
    lookup: enumToString(synthpop.LifeSatisfaction),
    theme: "Health",
  },
};

export const PER_HOUSEHOLD_CATEGORICAL_PROPS = {
  socioeconomic_classification: {
    get: (hh) => getOptional(hh, "nssec8"),
    label: "NSSEC of reference person",
    lookup: enumToString(synthpop.Nssec8),
    theme: "Household",
    pieChart: true,
  },
  accommodation_type: {
    get: (hh) => getOptional(hh, "accommodationType"),
    label: "Accomodation type",
    lookup: enumToString(synthpop.AccommodationType),
    theme: "Household",
  },
  communal_type: {
    get: (hh) => getOptional(hh, "communalType"),
    label: "Type of communal establishment",
    lookup: enumToString(synthpop.CommunalType),
    theme: "Household",
  },
  num_rooms: {
    get: (hh) => getOptional(hh, "numRooms"),
    label: "Number of rooms (capped at 6)",
    lookup: numberEnumMap(6),
    theme: "Household",
  },
  // central_heat is effectively an enum
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
    get: (hh) => getOptional(hh, "tenure"),
    label: "Tenure",
    lookup: enumToString(synthpop.Tenure),
    theme: "Household",
  },
  num_cars: {
    get: (hh) => getOptional(hh, "numCars"),
    label: "Number of cars (capped at 2)",
    lookup: numberEnumMap(3),
    theme: "Household",
  },
};

function aggregateStat(data, showAverage) {
  if (data.length == 0) {
    // Messy to show, but doesn't break prop.fmt quite so badly
    return NaN;
  }
  return showAverage ? mean(data) : median(data);
}

// Returns a mapping from MSOA ID to the GJ Feature, and also the equivalent of
// `properties` for all MSOAs together.
function msoaStats(pop) {
  // Counts
  let households_per_msoa = {};
  let people_per_msoa = {};

  // Lists of numeric data. Map<key, Map<MSOA, List<float>>>
  let numericData = {};

  // Initialize for MSOAs and the special all case
  for (let id of Object.keys(pop.infoPerMsoa).concat(["all"])) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      numericData[key] ||= {};
      numericData[key][id] = [];
    }
  }

  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;
    households_per_msoa.all++;
    people_per_msoa.all += hh.members.length;

    for (let id of hh.members) {
      let person = pop.people[id];
      for (let [key, prop] of Object.entries(PER_PERSON_NUMERIC_PROPS)) {
        let value = prop.get(person);
        if (value != null) {
          numericData[key][hh.msoa11cd].push(value);
          numericData[key].all.push(value);
        }
      }
    }
  }

  let msoas = {};
  for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
    let properties = {
      id,
      households: households_per_msoa[id],
      people: people_per_msoa[id],
    };
    for (let [key, listPerMsoa] of Object.entries(numericData)) {
      properties[key] = aggregateStat(
        listPerMsoa[id],
        PER_PERSON_NUMERIC_PROPS[key].showAverage
      );
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

  let all = {
    households: households_per_msoa.all,
    people: people_per_msoa.all,
  };
  for (let [key, listPerMsoa] of Object.entries(numericData)) {
    all[key] = aggregateStat(
      listPerMsoa.all,
      PER_PERSON_NUMERIC_PROPS[key].showAverage
    );
  }

  return [msoas, all];
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

// Loads a .pb and returns [pop, msoas, allMsoaData].
export function loadArrayBuffer(buffer) {
  try {
    console.time("Load protobuf");
    let bytes = new Uint8Array(buffer);
    let pop = synthpop.Population.decode(bytes);
    console.timeEnd("Load protobuf");
    console.time("Calculate msoaStats");
    let [msoas, allMsoaData] = msoaStats(pop);
    console.timeEnd("Calculate msoaStats");

    // Debugging
    window.pop = pop;

    return [pop, msoas, allMsoaData];
  } catch (err) {
    window.alert(`Couldn't load SPC proto file: ${err}`);
  }
}
