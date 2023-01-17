<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import bbox from "@turf/bbox";

  const { getMap, setCamera } = getContext("map");
  let map = getMap();

  export let msoas;
  export let hoveredMsoa;

  let source = "msoas";
  let layer = "msoas-polygons";
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

    map.addLayer({
      id: layer,
      source,
      type: "fill",
      paint: {
        "fill-color": "blue",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.8,
          0.4,
        ],
      },
    });

    let hoverId;
    function unhover() {
      if (hoverId !== null) {
        map.setFeatureState({ source, id: hoverId }, { hover: false });
      }
    }

    map.on("mousemove", layer, (e) => {
      if (e.features.length > 0) {
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

  onDestroy(() => {
    if (map.getLayer("msoas-lines")) {
      map.removeLayer("msoas-lines");
    }
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
    map.removeSource(source);
  });
</script>
