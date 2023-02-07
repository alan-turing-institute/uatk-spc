<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import { synthpop } from "../pb/synthpop_pb.js";
  import { emptyGeojson } from "../data.js";

  const { getMap } = getContext("map");
  let map = getMap();

  // Input
  export let pop;

  // State
  let showRetail = true;
  let showPrimarySchool = true;
  let showSecondarySchool = true;
  let showHome = true;
  let showWork = true;

  let source = "venues";
  // TODO Probably a bunch of layers
  let layer = "venues-layer";

  onMount(() => {
    let gj = emptyGeojson();
    for (let list of Object.values(pop.venuesPerActivity)) {
      // Undefined for HOME and WORK
      if (list) {
        for (let venue of list.venues) {
          gj.features.push({
            type: "Feature",
            properties: {
              type: venue.activity,
            },
            geometry: {
              coordinates: pointToGeojson(venue.location),
              type: "Point",
            },
          });
        }
      }
    }

    map.addSource(source, {
      type: "geojson",
      data: gj,
    });
    map.addLayer({
      id: layer,
      source,
      type: "circle",
      paint: {
        "circle-color": "red",
        "circle-radius": 5,
        "circle-opacity": 0.5,
      },
    });
  });

  function pointToGeojson(pt) {
    return [pt.longitude, pt.latitude];
  }

  onDestroy(() => {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
    map.removeSource(source);
  });
</script>

<div class="legend">
  <h3>Venues:</h3>
  <input type="checkbox" bind:checked={showRetail} /> Retail<br />
  <input type="checkbox" bind:checked={showPrimarySchool} /> Primary school<br
  />
  <input type="checkbox" bind:checked={showSecondarySchool} /> Secondary school:<br
  />
  <input type="checkbox" bind:checked={showHome} /> Home<br />
  <input type="checkbox" bind:checked={showWork} /> Work<br />
</div>

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
