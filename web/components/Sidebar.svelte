<script>
  export let msoas;
  export let hoveredMsoa;

  let households;
  let people;
  let avg_age;
  let avg_household_size;
  $: {
    if (hoveredMsoa) {
      households = msoas[hoveredMsoa].properties.households;
      people = msoas[hoveredMsoa].properties.people;
      avg_age = msoas[hoveredMsoa].properties.avg_age;
      avg_household_size = msoas[hoveredMsoa].properties.avg_household_size;
    } else {
      // TODO reduce
      households = 0;
      people = 0;
      avg_age = 0.0;
      avg_household_size = 0.0;
      for (let msoa of Object.values(msoas)) {
        households += msoa.properties.households;
        people += msoa.properties.people;
        avg_age += msoa.properties.avg_age;
        avg_household_size += msoa.properties.avg_household_size;
      }
      avg_age /= Object.keys(msoas).length;
      avg_household_size /= Object.keys(msoas).length;
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
<p>Average age (years): {avg_age.toFixed(0)}</p>
<p>Average household size: {avg_household_size.toFixed(1)}</p>
