import centroid from "@turf/centroid";

// Returns a mapping from MSOA ID to the GJ Feature
export function msoaStats(pop) {
  // Counts
  let households_per_msoa = {};
  let people_per_msoa = {};

  // Averages of numeric data
  let avg_age = {};
  let avg_salary_yearly = {};
  let avg_salary_hourly = {};
  let avg_bmi_new = {};

  for (let id of Object.keys(pop.infoPerMsoa)) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
    avg_age[id] = 0.0;
    avg_salary_yearly[id] = 0.0;
    avg_salary_hourly[id] = 0.0;
    avg_bmi_new[id] = 0.0;
  }
  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;
    // Sum per MSOA
    for (let id of hh.members) {
      let person = pop.people[id];
      avg_age[hh.msoa11cd] += person.demographics.ageYears;
      avg_salary_yearly[hh.msoa11cd] += person.employment.salaryYearly;
      avg_salary_hourly[hh.msoa11cd] += person.employment.salaryHourly;
      avg_bmi_new[hh.msoa11cd] += person.health.bmiNew;
    }
  }

  let avg_household_size = {};
  for (let id of Object.keys(pop.infoPerMsoa)) {
    let n = people_per_msoa[id];
    // TODO Cast?
    avg_household_size[id] = n / households_per_msoa[id];
    avg_age[id] /= n;
    avg_salary_yearly[id] /= n;
    avg_salary_hourly[id] /= n;
    avg_bmi_new[id] /= n;
  }

  let msoas = {};
  for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
    msoas[id] = {
      type: "Feature",
      properties: {
        id,
        households: households_per_msoa[id],
        people: people_per_msoa[id],
        avg_age: avg_age[id],
        avg_household_size: avg_household_size[id],
        avg_salary_yearly: avg_salary_yearly[id],
        avg_salary_hourly: avg_salary_hourly[id],
        avg_bmi_new: avg_bmi_new[id],
      },
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
