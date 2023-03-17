<script>
  import Modal from "./Modal.svelte";
  import { getContext, onMount, onDestroy } from "svelte";
  import { geometricReservoirSample, createWeightedChoice } from "pandemonium";
  import Plotly from "plotly.js-dist";
  import { synthpop } from "../pb/synthpop_pb.js";
  import { emptyGeojson } from "../data.js";
  import DateInput from "./DateInput.svelte";
  import { prettyPrintJson } from "pretty-print-json";
  import "pretty-print-json/css/pretty-print-json.css";
  import dayjs from "dayjs";

  const { getMap } = getContext("map");
  let map = getMap();

  // Input
  export let pop;

  // State
  export let show = false;
  let hoverId;
  let modalContents;
  let showModal = false;

  let sample_size = 50;
  let start_date = new Date("February 5, 2020");
  let date_offset = 0;
  let lockdown;
  $: today = addDays(start_date, date_offset);

  let source = "people";
  let homeLayer = "people-home";
  let flowsLayer = "people-flows";

  const homeColor = "#0d0d0d";
  const schoolColor = "#952611";
  const workColor = "#0979B5";
  const retailColor = "#008E4A";
  const otherColor = "#d9d9d9";

  // Set up the source and two layers once, with no data
  onMount(() => {
    map.addSource(source, {
      type: "geojson",
      data: emptyGeojson(),
      generateId: true,
    });
    map.addLayer({
      id: homeLayer,
      source,
      // Don't show endpoints of a LineString
      filter: ["has", "phome_total"],
      type: "circle",
      paint: {
        "circle-color": homeColor,
        "circle-radius": ["*", 20, ["get", "phome_total"]],
        "circle-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.8,
          0.4,
        ],
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
          schoolColor,
          "WORK",
          workColor,
          "RETAIL",
          retailColor,
          "black",
        ],
        "line-width": ["*", 10, ["^", ["get", "pct"], 0.5]],
      },
    });

    setupHovering(homeLayer);
    map.on("click", (e) => {
      let features = map.queryRenderedFeatures(e.point, {
        layers: [homeLayer],
      });
      if (features.length == 1) {
        let person = pop.people[features[0].properties.id];
        modalContents = prettyPrintJson.toHtml(person, { lineNumbers: true });
        showModal = true;
      }
    });
  });

  // Resample people when sample_size changes
  // TODO Revisit filtering when all data available. For now, skip people without stuff
  let validPeople = pop.people.filter(
    (p) => p.weekdayDiaries.length > 0 && p.weekdayDiaries[0] != "Baby"
  );

  $: people = geometricReservoirSample(sample_size, validPeople);
  $: schoolsPerPerson = people.map(pickSchool);

  let averageActivities = {
    values: [0.2, 0.2, 0.2, 0.2, 0.2],
    labels: ["Home", "Work", "Retail", "School", "Other"],
    marker: {
      colors: [homeColor, workColor, retailColor, schoolColor, otherColor],
    },
    type: "pie",
  };
  let averageTransport = {
    values: [0.25, 0.25, 0.25, 0.25],
    labels: ["Walk", "Cycle", "Public transport", "Unknown"],
    type: "pie",
  };

  // Swap out GJ data when day or people change
  $: {
    // TODO Hack, how do we also not do this until onMount is done?
    if (map.getSource(source)) {
      let is_weekday = today.getDay() != 0 && today.getDay() != 6;
      let month_number = today.getMonth() + 1;

      let gj = emptyGeojson();

      // In the order matching averages
      let sumActivities = [0.0, 0.0, 0.0, 0.0, 0.0];
      let sumTransport = [0.0, 0.0, 0.0, 0.0];

      for (let [index, person] of people.entries()) {
        // Pick a diary for them (arbitrarily)
        let list = is_weekday ? person.weekdayDiaries : person.weekendDiaries;
        list = list.filter(
          (id) => pop.timeUseDiaries[id].month == month_number
        );
        let diary_id = list[date_offset % list.length];
        let diary = pop.timeUseDiaries[diary_id];
        // TODO Bad data coming in
        if (!diary) {
          continue;
        }

        sumActivities[0] += diary.phomeTotal;
        sumActivities[1] += diary.pwork;
        sumActivities[2] += diary.pshop;
        sumActivities[3] += diary.pschool;
        sumActivities[4] +=
          diary.pservices + diary.pleisure + diary.pescort + diary.ptransport;

        sumTransport[0] += diary.pmwalk;
        sumTransport[1] += diary.pmcycle;
        sumTransport[2] += diary.pmpublic;
        sumTransport[3] += diary.pmunknown;

        // Make a circle representing how long they spend at home
        let home = homeLocation(person);
        gj.features.push({
          type: "Feature",
          properties: {
            phome_total: diary.phomeTotal,
            id: person.id,
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

      averageActivities.values = sumActivities.map((x) => x / sample_size);
      averageTransport.values = sumTransport.map((x) => x / sample_size);

      if (!show) {
        gj.features = [];
      }

      map.getSource(source).setData(gj);
    }
  }

  onDestroy(() => {
    unhover();
    // TODO Remove all the Map event listeners
    if (map.getLayer(homeLayer)) {
      map.removeLayer(homeLayer);
    }
    if (map.getLayer(flowsLayer)) {
      map.removeLayer(flowsLayer);
    }
    map.removeSource(source);
  });

  // Calculate lockdown when today changes
  $: {
    let lockdownStart = dayjs(pop.lockdown.startDate, "YYYY-MM-DD").toDate();
    // TODO Can't get dayjs/plugin/duration to work. The below probably breaks
    // with leap seconds and stuff.
    let dayIndex = Math.floor((today - lockdownStart) / (1000 * 60 * 60 * 24));
    if (dayIndex < 0) {
      lockdown = `${-dayIndex} days before lockdown started`;
    } else if (dayIndex >= pop.lockdown.changePerDay.length) {
      lockdown = `${
        dayIndex - pop.lockdown.changePerDay.length
      } days after available mobility data`;
    } else {
      lockdown = pop.lockdown.changePerDay[dayIndex];
    }
  }

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
    const layout = {
      width: 300,
      height: 300,
      margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    };
    Plotly.purge(node);
    Plotly.newPlot(node, [data], layout);

    return {
      update({ data: newData }) {
        Plotly.newPlot(node, [newData], layout);
      },
      destroy() {
        Plotly.purge(node);
      },
    };
  }

  // TODO Share hoverable/clickable logic somehow
  function unhover() {
    if (hoverId != null) {
      map.setFeatureState({ source, id: hoverId }, { hover: false });
    }
  }
  function setupHovering(layer) {
    map.on("mousemove", layer, (e) => {
      if (e.features.length > 0 && hoverId != e.features[0].id) {
        unhover();
        hoverId = e.features[0].id;
        map.setFeatureState({ source, id: hoverId }, { hover: true });
      }
    });
    map.on("mouseleave", layer, () => {
      unhover();
      hoverId = null;
    });
  }
</script>

<div class="legend" style:top={show ? "120px" : "382px"}>
  <div><input type="checkbox" bind:checked={show} />Daily diaries</div>
  {#if show}
    <div>
      Number of people: {sample_size}
      <input type="range" bind:value={sample_size} min="1" max="100" />
    </div>
    <div>
      Start date: <DateInput bind:date={start_date} />
    </div>
    <div>
      Day: <input type="number" bind:value={date_offset} min="0" />
      {today.toDateString()}
    </div>
    Lockdown change: {lockdown}
    <div use:pieChart={{ data: averageActivities }} />
    <div use:pieChart={{ data: averageTransport }} />
  {/if}
</div>

<Modal bind:show={showModal}>
  {@html modalContents}
</Modal>

<style>
  .legend {
    z-index: 1;
    position: absolute;
    right: 10px;
    width: 290px;
    background: whitesmoke;
    border: solid 1px black;
    padding: 15px;
  }
</style>
