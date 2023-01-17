// Returns a mapping from MSOA ID to the GJ Feature
export function msoaStats(pop) {
  let households_per_msoa = {};
  let people_per_msoa = {};
  for (let id of Object.keys(pop.infoPerMsoa)) {
    households_per_msoa[id] = 0;
    people_per_msoa[id] = 0;
  }
  for (let hh of pop.households) {
    households_per_msoa[hh.msoa11cd]++;
    people_per_msoa[hh.msoa11cd] += hh.members.length;
  }

  let msoas = {};
  for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
    msoas[id] = {
      type: "Feature",
      properties: {
        id,
        households: households_per_msoa[id],
        people: people_per_msoa[id],
      },
      geometry: {
        coordinates: [info.shape.map((pt) => [pt.longitude, pt.latitude])],
        type: "Polygon",
      },
    };
  }
  return msoas;
}
