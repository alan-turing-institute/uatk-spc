import { geometricReservoirSample, createWeightedChoice } from "pandemonium";
import length from "@turf/length";
import { synthpop } from "../pb/synthpop_pb.js";

// Returns a list of events of the form {
//   date: "YYYY-MM-DD",
//   size: 123,           (number of people attending)
//   location: [longitude, latitude],
//   type: ESport | ERugby | EConcertM | EConcertF | EConcertMS | EConcertFS | EMuseum,
//   contactCycles: [
//     durationMinutes: 123,
//     contacts: 123,      (number of pairs of people who interact)
//     risk: 0.123,        (some probability specific to pandemic modeling)
//   ]
// }
//
// TODO Iterate on the example
// https://github.com/alan-turing-institute/uatk-aspics/blob/main/config/eventDataConcerts.csv. It has some issues:
//
// - all fields are expressed as strings
// - each row is a contact cycle of an event; they need to be grouped
function loadEvents() {
  // TODO Read from a file chosen through the UI.
  return [
    {
      date: "2020/02/05",
      size: 100,
      location: [52.671308, -0.72997],
      type: "ESport",
      contactCycles: [{
        durationMinutes: 10,
        contacts: 20,
        risk: 0.5
       }, {
        durationMinutes: 90,
        contacts: 40,
        risk: 0.2
       }
      ]
    }
  ];
}

// Returns a list matching up to pop.people, with null or the index of the event they attend
function assignPeopleToEvents(pop, events) {
  let result = [];  // TODO fill with nulls

  for (let ev, idx of events) {
    let candidates = pop.people.filter((p) => {
      result[p.id] == null

      let pr = if (ev.type == "ESport") {
        p.events.sport
      } else if (ev.type == "ERugby") {
        p.events.rugby
      } else if (ev.type == "EConcertM") {
        p.events.concertM
      } else if (ev.type == "EConcertF") {
        p.events.concertF
      } else if (ev.type == "EConcertMS") {
        p.events.concertMs
      } else if (ev.type == "EConcertFS") {
        p.events.concertFs
      } else if (ev.type == "EMuseum") {
        p.events.museum
      };

      let cost = length(homeLocation(p), ev.location);

      // Do they have enough time?
      // TODO Need to deterministically pick a diary for this absolute date

    });
  }
}

function pointToGeojson(pt) {
  return [pt.longitude, pt.latitude];
}

function homeLocation(pop, person) {
  let msoa = pop.infoPerMsoa[pop.households[person.household].msoa11cd];
  if (msoa.buildings.length > 0) {
    return pointToGeojson(msoa.buildings[person.id % msoa.buildings.length]);
  } else {
    // TODO Fallback to MSOA centroid
    return pointToGeojson(msoa.shape[0]);
  }
}

// Returns the venue location
function pickVenueForActivity(pop, person, activity) {
  let flows_per_activity =
    pop.infoPerMsoa[pop.households[person.household].msoa11cd]
      .flowsPerActivity;
  let flows = flows_per_activity.find((f) => f.activity == activity).flows;
  let flow = createWeightedChoice({
    getWeight: (item, index) => {
      return item.weight;
    },
  })(flows);
  return pointToGeojson(
    pop.venuesPerActivity[activity].venues[flow.venueId].location
  );
}

function pickSchool(person) {
  if (person.employment.pwkstat != synthpop.PwkStat.STUDENT_FT) {
    // TODO This seems rare
    //return null;
  }
  let activity =
    person.demographics.ageYears >= 11
      ? synthpop.Activity.SECONDARY_SCHOOL
      : synthpop.Activity.PRIMARY_SCHOOL;
  return pickVenueForActivity(pop, person, activity);
}
