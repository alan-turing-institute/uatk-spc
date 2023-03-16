<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import { synthpop } from "../pb/synthpop_pb.js";
  import { emptyGeojson, getFlows } from "../data.js";

  const { getMap } = getContext("map");
  let map = getMap();

  export let pop;
  export let msoas;
  export let hoveredMsoa;
  export let showDiaries;
  export let msoasColorBy;

  let show = "all";

  // TODO Another possible pattern -- store the Source / Layer themselves, not the names, here
  let source = "flows";
  let layerStatic = "flows-static";
  let layerDynamic = "flows-dynamic";

  $: if (showDiaries) {
    show = "none";
  }

  // Flows depend on some MSOA layer being shown
  $: if (msoasColorBy == "none") {
    show = "none";
  }

  // Set up the source and two layers once, with no data
  onMount(() => {
    map.addSource(source, { type: "geojson", data: emptyGeojson() });
    map.addLayer({
      id: layerStatic,
      source,
      type: "line",
      paint: {
        "line-color": "red",
        "line-width": ["*", 20, ["get", "weight"]],
        "line-opacity": 0.4,
      },
    });
    addAntPathLayer();
  });

  // Swap out data when hoveredMsoa or show change
  $: {
    // TODO Hack, how do we also not do this until onMount is done?
    if (map.getSource(source)) {
      if (hoveredMsoa) {
        map.getSource(source).setData(getFlows(pop, msoas, hoveredMsoa, show));
      } else {
        map.getSource(source).setData(emptyGeojson());
      }
    }
  }

  function addAntPathLayer() {
    // Thanks to https://docs.mapbox.com/mapbox-gl-js/example/animate-ant-path/
    map.addLayer({
      id: layerDynamic,
      source,
      type: "line",
      paint: {
        "line-color": "red",
        "line-width": ["*", 20, ["get", "weight"]],
        "line-dasharray": [0, 4, 3],
      },
    });

    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
    ];

    let step = 0;

    function animateDashArray(timestamp) {
      // Update line-dasharray using the next value in dashArraySequence. The
      // divisor in the expression `timestamp / 50` controls the animation speed.
      const newStep = parseInt((timestamp / 50) % dashArraySequence.length);

      if (newStep !== step) {
        map.setPaintProperty(
          layerDynamic,
          "line-dasharray",
          dashArraySequence[step]
        );
        step = newStep;
      }

      requestAnimationFrame(animateDashArray);
    }

    animateDashArray(0);
  }

  onDestroy(() => {
    if (map.getLayer(layerStatic)) {
      map.removeLayer(layerStatic);
    }
    if (map.getLayer(layerDynamic)) {
      map.removeLayer(layerDynamic);
    }
    map.removeSource(source);
  });
</script>

<div class="legend">
  Flows:
  <select bind:value={show}>
    <option value="all">All</option>
    <option value="none">None</option>
    <option value={synthpop.Activity.RETAIL}>Retail</option>
    <option value={synthpop.Activity.PRIMARY_SCHOOL}>Primary school</option>
    <option value={synthpop.Activity.SECONDARY_SCHOOL}>Secondary school</option>
  </select>
</div>

<style>
  .legend {
    z-index: 1;
    position: absolute;
    top: 10px;
    right: 10px;
    width: 280px;
    background: whitesmoke;
    border: solid 1px black;
    padding: 10px 20px;
  }

  select {
    font-size: 16px;
    padding: 4px 8px;
  }
</style>
