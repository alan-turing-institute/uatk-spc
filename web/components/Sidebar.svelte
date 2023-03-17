<script>
  import { PER_PERSON_NUMERIC_PROPS } from "../data.js";

  export let pop;
  export let msoas;
  export let allMsoaData;
  export let hoveredMsoa;

  // All the things in the per-MSOA GeoJSON feature
  let props;
  $: {
    if (hoveredMsoa) {
      props = msoas[hoveredMsoa].properties;
    } else {
      props = allMsoaData;
    }
  }
</script>

{#if hoveredMsoa}
  <h2>{hoveredMsoa} ({pop.year})</h2>
{:else}
  <h2>{Object.keys(msoas).length} MSOAs ({pop.year})</h2>
{/if}
<p>{props.households.toLocaleString("en-us")} households</p>
<p>{props.people.toLocaleString("en-us")} people</p>

{#each Object.entries(PER_PERSON_NUMERIC_PROPS) as [key, prop]}
  {@const stat = prop.showAverage ? "Average" : "Median"}
  <p>{stat} {prop.label}: {prop.fmt(props[key])}</p>
{/each}
