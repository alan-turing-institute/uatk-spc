<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import { geometricReservoirSample, createWeightedChoice } from "pandemonium";
  import Plotly from "plotly.js-dist";
  import { synthpop } from "../pb/synthpop_pb.js";
  import { emptyGeojson } from "../data.js";

  const { getMap } = getContext("map");
  let map = getMap();

  export let pop;

  let sample_size = 50;
  const start_date = new Date("February 5, 2023");
  let date_offset = 0;
  $: today = addDays(start_date, date_offset);

  let source = "people";
  let homeLayer = "people-home";
  let flowsLayer = "people-flows";

  // Set up the source and two layers once, with no data
  onMount(() => {
    map.addSource(source, { type: "geojson", data: emptyGeojson() });
    map.addLayer({
      id: homeLayer,
      source,
      // Don't show endpoints of a LineString
      filter: ["has", "phome_total"],
      type: "circle",
      paint: {
        "circle-color": "blue",
        "circle-radius": ["*", 20, ["get", "phome_total"]],
        "circle-opacity": 0.5,
      },
    });
    map.addLayer({
      id: flowsLayer,
      source,
      type: "line",
      paint: {
        "line-color": [
          "match",
          ["get", "activity"],
          "SCHOOL",
          "cyan",
          "WORK",
          "red",
          "RETAIL",
          "green",
          "black",
        ],
        "line-width": ["*", 50, ["get", "pct"]],
      },
    });
  });

  // Resample people when sample_size changes
  $: people = geometricReservoirSample(sample_size, pop.people);
  $: schoolsPerPerson = people.map(pickSchool);

  let averages = {
    values: [0.25, 0.25, 0.25, 0.25],
    labels: ["Home", "Work", "Shop", "School"],
    type: "pie",
  };

  // Swap out GJ data when day or people change
  $: {
    // TODO Hack, how do we also not do this until onMount is done?
    if (map.getSource(source)) {
      let is_weekday = today.getDay() != 0 && today.getDay() != 6;

      let gj = emptyGeojson();

      // In the order matching averages
      let sums = [0.0, 0.0, 0.0, 0.0];

      for (let [index, person] of people.entries()) {
        // Pick a diary for them (arbitrarily)
        let list = is_weekday ? person.weekdayDiaries : person.weekendDiaries;
        let diary_id = list[date_offset % list.length];
        let diary = pop.timeUseDiaries[diary_id];
        // TODO Bad data coming in
        if (!diary) {
          continue;
        }

        sums[0] += diary.phomeTotal;
        sums[1] += diary.pwork;
        sums[2] += diary.pshop;
        sums[3] += diary.pschool;

        // Make a circle representing how long they spend at home
        let home = homeLocation(person);
        gj.features.push({
          type: "Feature",
          properties: {
            phome_total: diary.phomeTotal,
          },
          geometry: {
            coordinates: home,
            type: "Point",
          },
        });

        // Go to work?
        if (person.hasOwnProperty("workplace") && diary.pwork > 0.0) {
          let work = pointToGeojson(
            pop.venuesPerActivity[synthpop.Activity.WORK].venues[
              person.workplace
            ].location
          );
          gj.features.push({
            type: "Feature",
            properties: {
              activity: "WORK",
              pct: diary.pwork,
            },
            geometry: {
              coordinates: [home, work],
              type: "LineString",
            },
          });
        }

        // Shop?
        if (diary.pshop > 0.0) {
          // Pick a different venue every day
          let pt = pickVenueForActivity(person, synthpop.Activity.RETAIL);
          gj.features.push({
            type: "Feature",
            properties: {
              activity: "RETAIL",
              pct: diary.pshop,
            },
            geometry: {
              coordinates: [home, pt],
              type: "LineString",
            },
          });
        }

        // Go to school?
        if (diary.pschool > 0.0) {
          let pt = schoolsPerPerson[index];
          if (pt != null) {
            gj.features.push({
              type: "Feature",
              properties: {
                activity: "SCHOOL",
                pct: diary.pschool,
              },
              geometry: {
                coordinates: [home, pt],
                type: "LineString",
              },
            });
          }
        }
      }

      averages.values = sums.map((x) => x / sample_size);

      map.getSource(source).setData(gj);
    }
  }

  onDestroy(() => {
    if (map.getLayer(homeLayer)) {
      map.removeLayer(homeLayer);
    }
    if (map.getLayer(flowsLayer)) {
      map.removeLayer(flowsLayer);
    }
    map.removeSource(source);
  });

  function homeLocation(person) {
    let msoa = pop.infoPerMsoa[pop.households[person.household].msoa11cd];
    if (msoa.buildings.length > 0) {
      return pointToGeojson(msoa.buildings[person.id % msoa.buildings.length]);
    } else {
      // TODO Fallback to MSOA centroid
      return pointToGeojson(msoa.shape[0]);
    }
  }

  // Returns the venue location
  function pickVenueForActivity(person, activity) {
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
    return pickVenueForActivity(person, activity);
  }

  function pointToGeojson(pt) {
    return [pt.longitude, pt.latitude];
  }

  function addDays(date, offset) {
    let copy = new Date(date);
    copy.setDate(copy.getDate() + offset);
    return copy;
  }

  function pieChart(node, { data }) {
    Plotly.purge(node);
    Plotly.newPlot(node, [data], { height: 300, width: 400 });

    return {
      update({ data: newData }) {
        Plotly.newPlot(node, [newData], { height: 300, width: 400 });
      },
      destroy() {
        Plotly.purge(node);
      },
    };
  }
</script>

<div class="legend">
  Number of people: <input
    type="range"
    bind:value={sample_size}
    min="1"
    max="100"
  />
  <br />
  Day: <input type="number" bind:value={date_offset} min="0" max="100" />
  {today.toDateString()}
  <br />
  <div use:pieChart={{ data: averages }} />
</div>

<style>
  .legend {
    z-index: 1;
    position: absolute;
    bottom: 50px;
    left: 10px;
    background: white;
    padding: 10px;
  }
</style>
