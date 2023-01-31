<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import { PER_PERSON_NUMERIC_PROPS } from "../data.js";
  import bbox from "@turf/bbox";
  import chroma from "chroma-js";

  const { getMap, setCamera } = getContext("map");
  let map = getMap();

  export let msoas;
  export let hoveredMsoa;
  export let clickedMsoa;

  let colorBy = "households";
  let limits = [];
  let colorScale = [];

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

    // TODO Just fill-outline-color
    map.addLayer({
      id: "msoas-lines",
      source,
      type: "line",
      paint: {
        "line-color": "black",
        "line-width": 3,
        "line-width": [
          "case",
          // TODO This feels backwards, but before the feature state is defined at all, it's unclear
          ["boolean", ["feature-state", "focused"], false],
          10,
          3,
        ],
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

    // TODO These two IDs are getting really annoying
    let clickedId = null;
    map.on("click", (e) => {
      if (clickedId != null) {
        map.setFeatureState({ source, id: clickedId }, { focused: false });
      }

      let features = map.queryRenderedFeatures(e.point, { layers: [layer] });
      if (features.length == 1) {
        clickedMsoa = features[0].properties.id;
        clickedId = features[0].id;
        map.setFeatureState({ source, id: clickedId }, { focused: true });
      } else {
        clickedMsoa = null;
        clickedId = null;
      }
    });
  });

  function setLayer() {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }

    // Get the numeric data we're displaying
    let data = Object.values(msoas).reduce((agg, msoa) => {
      agg.push(msoa.properties[colorBy]);
      return agg;
    }, []);
    // chroma equidistant scale
    limits = chroma.limits(data, "e", 4);
    colorScale = chroma
      .scale(["rgba(222,235,247,1)", "rgba(49,130,189,1)"])
      .mode("lch")
      .colors(5);

    let fillColor = [
      "case",
      ["!=", ["to-number", ["get", colorBy]], 0],
      ["step", ["get", colorBy]],
      "rgba(0, 0, 0, 0)",
    ];
    for (let i = 1; i < limits.length; i++) {
      fillColor[2].push(colorScale[i - 1]);
      fillColor[2].push(limits[i]);
    }
    fillColor[2].push(colorScale[limits.length - 1]);

    map.addLayer({
      id: layer,
      source,
      type: "fill",
      paint: {
        "fill-color": fillColor,
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

<div class="legend">
  <select bind:value={colorBy} on:change={setLayer}>
    <option value="households">Number of households</option>
    <option value="people">Number of people</option>
    <option value="avg_household_size">Average household size</option>
    {#each Object.entries(PER_PERSON_NUMERIC_PROPS) as [key, prop]}
      <option value={key}>{prop.label}</option>
    {/each}
  </select>
  <ul>
    {#each colorScale as color, i}
      <li>
        <div class="square" style="background-color: {color}" />
        {#if i < colorScale.length - 1}
          {limits[i]} &mdash; {limits[i + 1]}
        {:else}
          &gt; {limits[i]}
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .legend {
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

  ul {
    list-style-type: none;
  }

  li {
    display: flex;
  }

  .square {
    width: 50px;
    height: 50px;
  }
</style>
