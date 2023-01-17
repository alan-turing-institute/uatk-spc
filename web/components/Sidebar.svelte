<script>
  export let msoas;
  export let hoveredMsoa;

  let households;
  let people;
  $: {
    if (hoveredMsoa) {
      households = msoas[hoveredMsoa].properties.households;
      people = msoas[hoveredMsoa].properties.people;
    } else {
      // TODO reduce
      households = 0;
      people = 0;
      for (let msoa of Object.values(msoas)) {
        households += msoa.properties.households;
        people += msoa.properties.people;
      }
    }
  }
</script>

{#if hoveredMsoa}
  <h2>{hoveredMsoa}</h2>
{:else}
  <h2>{Object.keys(msoas).length} MSOAs</h2>
{/if}
<p>{households.toLocaleString("en-us")} households</p>
<p>{people.toLocaleString("en-us")} people</p>
