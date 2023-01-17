<script>
  export let pop;
  export let hoveredMsoa;

  let households;
  let people;
  $: {
    households = 0;
    people = 0;
    if (hoveredMsoa) {
      for (let hh of pop.households) {
        if (hh.msoa11cd == hoveredMsoa) {
          households++;
          people += hh.members.length;
        }
      }
    } else {
      households = pop.households.length;
      people = pop.people.length;
    }
  }
</script>

{#if hoveredMsoa}
  <h2>{hoveredMsoa}</h2>
{:else}
  <h2>{Object.keys(pop.infoPerMsoa).length} MSOAs</h2>
{/if}
<p>{households.toLocaleString("en-us")} households</p>
<p>{people.toLocaleString("en-us")} people</p>
