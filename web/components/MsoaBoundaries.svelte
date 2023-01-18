<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import bbox from "@turf/bbox";

  const { getMap, setCamera } = getContext("map");
  let map = getMap();

  export let msoas;
  export let hoveredMsoa;

  let colorBy = "households";

  let source = "msoas";
  let layer = "msoas-polygons";

  let hoverId;
  function unhover() {
    if (hoverId != null) {
      map.setFeatureState({ source, id: hoverId }, { hover: false });
    }
  }

  onMount(() => {
    let gj = {
      type: "FeatureCollection",
      features: Object.values(msoas),
    };

    if (setCamera) {
      map.fitBounds(bbox(gj), {
        padding: 20,
        animate: false,
      });
    }

    // TODO If we pass the MSOA ID as feature.id, it gets dropped?
    map.addSource(source, { type: "geojson", data: gj, generateId: true });

    map.addLayer({
      id: "msoas-lines",
      source,
      type: "line",
      paint: {
        "line-color": "black",
        "line-width": 3,
      },
    });

    setLayer();

    map.on("mousemove", layer, (e) => {
      if (e.features.length > 0 && hoverId != e.features[0].id) {
        unhover();
        hoveredMsoa = e.features[0].properties.id;
        hoverId = e.features[0].id;
        map.setFeatureState({ source, id: hoverId }, { hover: true });
      }
    });
    map.on("mouseleave", layer, () => {
      unhover();
      hoveredMsoa = null;
      hoverId = null;
    });
  });

  function setLayer() {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
    map.addLayer({
      id: layer,
      source,
      type: "fill",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", colorBy],
          1000,
          "#67001f",
          2000,
          "#b2182b",
          3000,
          "#d6604d",
          4000,
          "#f4a582",
          5000,
          "#fddbc7",
          6000,
          "#d1e5f0",
          7000,
          "#92c5de",
          8000,
          "#4393c3",
          9000,
          "#2166ac",
          10000,
          "#053061",
        ],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.8,
          0.4,
        ],
      },
    });
  }

  onDestroy(() => {
    unhover();
    if (map.getLayer("msoas-lines")) {
      map.removeLayer("msoas-lines");
    }
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
    map.removeSource(source);
  });
</script>

<div>
  <select bind:value={colorBy} on:change={setLayer}>
    <option value="households">Number of households</option>
    <option value="people">Number of people</option>
    <option value="avg_age">Average age (years)</option>
    <option value="avg_household_size">Average household size</option>
  </select>
</div>

<style>
  div {
    z-index: 1;
    position: absolute;
    bottom: 250px;
    right: 10px;
    background: white;
    padding: 10px;
  }

  select {
    font-size: 16px;
    padding: 4px 8px;
  }
</style>
