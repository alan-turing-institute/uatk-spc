<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import bbox from "@turf/bbox";

  const { getMap, setCamera } = getContext("map");
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

    if (setCamera) {
      map.fitBounds(bbox(data), {
        padding: 20,
        animate: false,
      });
    }

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
