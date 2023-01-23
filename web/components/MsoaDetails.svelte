<script>
  export let pop;
  export let clickedMsoa;

  let ages = [];
  $: {
    ages = [];
    if (clickedMsoa) {
      for (let hh of pop.households) {
        if (hh.msoa11cd == clickedMsoa) {
          for (let id of hh.members) {
            ages.push(pop.people[id].demographics.ageYears);
          }
        }
      }
    }
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
  <p>{JSON.stringify(ages)}></p>
{:else}
  <p>Click an MSOA for more details</p>
{/if}
