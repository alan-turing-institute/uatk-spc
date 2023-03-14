<script>
  import { synthpop } from "../pb/synthpop_pb.js";
  import { emptyGeojson } from "../data.js";
  import Layer from "./Layer.svelte";

  // Input
  export let pop;

  // State
  let showRetail = true;
  let showPrimarySchool = true;
  let showSecondarySchool = true;
  // Too many to show by default
  let showHome = false;
  let showWork = true;

  function venues(activity) {
    let gj = emptyGeojson();
    for (let venue of pop.venuesPerActivity[activity].venues) {
      gj.features.push(feature(venue.location));
    }
    return gj;
  }

  function homes() {
    let gj = emptyGeojson();
    for (let info of Object.values(pop.infoPerMsoa)) {
      for (let pt of info.buildings) {
        gj.features.push(feature(pt));
      }
    }
    return gj;
  }

  function circle(color) {
    return {
      type: "circle",
      paint: {
        "circle-color": color,
        "circle-radius": 5,
        "circle-opacity": 0.5,
      },
    };
  }

  function feature(pt) {
    return {
      type: "Feature",
      geometry: {
        coordinates: pointToGeojson(pt),
        type: "Point",
      },
    };
  }

  function pointToGeojson(pt) {
    return [pt.longitude, pt.latitude];
  }
</script>

<div class="legend">
  <h3>Venues:</h3>
  <input type="checkbox" bind:checked={showRetail} />
  <label style="color: #9CD891">Retail</label><br />
  <input type="checkbox" bind:checked={showPrimarySchool} />
  <label style="color: green">Primary school</label><br />
  <input type="checkbox" bind:checked={showSecondarySchool} />
  <label style="color: brown">Secondary school</label><br />
  <input type="checkbox" bind:checked={showHome} />
  <label style="color: purple">Home</label><br />
  <input type="checkbox" bind:checked={showWork} />
  <label style="color: orange">Work</label><br />
</div>

<Layer
  source="retail"
  gj={venues(synthpop.Activity.RETAIL)}
  layerStyle={circle("red")}
  show={showRetail}
/>
<Layer
  source="primary-school"
  gj={venues(synthpop.Activity.PRIMARY_SCHOOL)}
  layerStyle={circle("green")}
  show={showPrimarySchool}
/>
<Layer
  source="secondary-school"
  gj={venues(synthpop.Activity.SECONDARY_SCHOOL)}
  layerStyle={circle("brown")}
  show={showSecondarySchool}
/>
<Layer
  source="home"
  gj={homes()}
  layerStyle={circle("purple")}
  show={showHome}
/>
<Layer
  source="work"
  gj={venues(synthpop.Activity.WORK)}
  layerStyle={circle("orange")}
  show={showWork}
/>

<style>
  .legend {
    z-index: 1;
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    padding: 10px;
  }
</style>
