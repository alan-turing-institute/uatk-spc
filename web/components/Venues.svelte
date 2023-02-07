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
  let showHome = true;
  let showWork = true;

  function venues(activity) {
    let gj = emptyGeojson();
    for (let venue of pop.venuesPerActivity[activity].venues) {
      gj.features.push({
        type: "Feature",
        geometry: {
          coordinates: pointToGeojson(venue.location),
          type: "Point",
        },
      });
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

  function pointToGeojson(pt) {
    return [pt.longitude, pt.latitude];
  }
</script>

<div class="legend">
  <h3>Venues:</h3>
  <input type="checkbox" bind:checked={showRetail} />
  <label style="color: red">Retail</label><br />
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
