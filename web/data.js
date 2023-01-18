// Returns a mapping from MSOA ID to the GJ Feature
export function msoaStats(pop) {
  let households_per_msoa = {};
  let people_per_msoa = {};
  let avg_age = {};
  for (let id of Object.keys(pop.infoPerMsoa)) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
    avg_age[id] = 0.0;
  }
  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;
    // Sum age per MSOA
    for (let id of hh.members) {
      avg_age[hh.msoa11cd] += pop.people[id].demographics.ageYears;
    }
  }

  let avg_household_size = {};
  for (let id of Object.keys(pop.infoPerMsoa)) {
    // TODO Cast?
    avg_household_size[id] = people_per_msoa[id] / households_per_msoa[id];
    avg_age[id] /= people_per_msoa[id];
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
      },
      geometry: {
        coordinates: [info.shape.map((pt) => [pt.longitude, pt.latitude])],
        type: "Polygon",
      },
    };
  }
  return msoas;
}
