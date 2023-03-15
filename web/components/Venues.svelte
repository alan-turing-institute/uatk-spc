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

  const houseColour = "#AD4BB7";
  const primarySchoolColour = "#F9DEE5";
  const secondarySchoolColour = "#E8BDC9";
  const workplaceColour = "#AFB2F1";
  const shopsColour = "#67A724";

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
  <label style="color: {houseColour}">
    <input type="checkbox" bind:checked={showHome} />
    Home
  </label> <br/>
  <label style="color: {workplaceColour}">
    <input type="checkbox" bind:checked={showWork} />
    Work
  </label> <br/>
  <label style="color: {primarySchoolColour}">
    <input type="checkbox" bind:checked={showPrimarySchool} />
    Primary school
  </label> <br/>
  <label style="color: {secondarySchoolColour}">
    <input type="checkbox" bind:checked={showSecondarySchool} />
    Secondary school
  </label> <br/>
  <label style="color: {shopsColour}">
    <input type="checkbox" bind:checked={showRetail} />
    Retail
  </label>
</div>

<Layer
  source="retail"
  gj={venues(synthpop.Activity.RETAIL)}
  layerStyle={circle(shopsColour)}
  show={showRetail}
/>
<Layer
  source="primary-school"
  gj={venues(synthpop.Activity.PRIMARY_SCHOOL)}
  layerStyle={circle(primarySchoolColour)}
  show={showPrimarySchool}
/>
<Layer
  source="secondary-school"
  gj={venues(synthpop.Activity.SECONDARY_SCHOOL)}
  layerStyle={circle(secondarySchoolColour)}
  show={showSecondarySchool}
/>
<Layer
  source="home"
  gj={homes()}
  layerStyle={circle(houseColour)}
  show={showHome}
/>
<Layer
  source="work"
  gj={venues(synthpop.Activity.WORK)}
  layerStyle={circle(workplaceColour)}
  show={showWork}
/>

<style>
  .legend {
    z-index: 1;
    position: absolute;
    top: 10px;
    left: 10px;
    background: whitesmoke;
    padding: 4px 10px;
    border: solid 1px black;
  }
</style>

