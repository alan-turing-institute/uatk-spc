<script>
  import Plotly from "plotly.js-dist";

  export let pop;
  export let clickedMsoa;

  // Note this is always present in the template. If we hide it under the
  // clickedMsoa condition, it doesn't get created before the reactive block
  // below runs.
  let div;

  let ages = [];
  $: {
    if (div) {
      Plotly.purge(div);
    }
    ages = [];
    if (clickedMsoa) {
      for (let hh of pop.households) {
        if (hh.msoa11cd == clickedMsoa) {
          for (let id of hh.members) {
            ages.push(pop.people[id].demographics.ageYears);
          }
        }
      }

      Plotly.newPlot(div, [{ x: ages, type: "histogram" }], {
        title: `Ages in ${clickedMsoa}`,
      });
    }
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
{:else}
  <p>Click an MSOA for more details</p>
{/if}
<div bind:this={div} />
