<script>
  import { getContext, onMount, onDestroy } from "svelte";

  const { getMap } = getContext("map");
  let map = getMap();

  export let pop;

  function boundaryGeojson() {
    let features = [];
    for (let [id, info] of Object.entries(pop.infoPerMsoa)) {
      features.push({
        type: "Feature",
        properties: {
          id,
        },
        geometry: {
          coordinates: [info.shape.map((pt) => [pt.longitude, pt.latitude])],
          type: "Polygon",
        },
      });
    }
    return {
      type: "FeatureCollection",
      features,
    };
  }

  onMount(() => {
    let data = boundaryGeojson();
    window.x = data;
    map.addSource("msoas", { type: "geojson", data });
    map.addLayer({
      id: "msoas",
      source: "msoas",
      type: "line",
      paint: {
        "line-color": "black",
        "line-width": 3,
      },
    });
  });

  onDestroy(() => {
    if (map.getLayer("msoas")) {
      map.removeLayer("msoas");
    }
    map.removeSource("msoas");
  });
</script>
