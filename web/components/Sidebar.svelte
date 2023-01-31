<script>
  import { PER_PERSON_NUMERIC_PROPS } from "../data.js";

  export let msoas;
  export let hoveredMsoa;

  // All the things in the per-MSOA GeoJSON feature
  let props;
  $: {
    if (hoveredMsoa) {
      props = msoas[hoveredMsoa].properties;
    } else {
      // Calculate totals over all MSOAs, using the per-MSOA properties
      props = {
        households: 0,
        people: 0,
        avg_household_size: 0.0,
      };
      for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
        props[key] = 0.0;
      }

      // Sum
      for (let msoa of Object.values(msoas)) {
        for (let key of Object.keys(props)) {
          props[key] += msoa.properties[key];
        }
      }
      // Average most things
      for (let key of Object.keys(props)) {
        if (key != "households" && key != "people") {
          props[key] /= Object.keys(msoas).length;
        }
      }
    }
  }
</script>

{#if hoveredMsoa}
  <h2>{hoveredMsoa}</h2>
{:else}
  <h2>{Object.keys(msoas).length} MSOAs</h2>
{/if}
<p>{props.households.toLocaleString("en-us")} households</p>
<p>{props.people.toLocaleString("en-us")} people</p>
<p>Average household size: {props.avg_household_size.toFixed(1)}</p>

{#each Object.entries(PER_PERSON_NUMERIC_PROPS) as [key, prop]}
  <p>Average {prop.label}: {prop.fmt(props[key])}</p>
{/each}
