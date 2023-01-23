<script>
  import Plotly from "plotly.js-dist";

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

  // TODO This doesn't use latest ages, you have to click on and off an MSOA.
  function plotlyAction(div) {
    Plotly.newPlot(div, [{ x: ages, type: "histogram" }]);
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
  <div use:plotlyAction />
{:else}
  <p>Click an MSOA for more details</p>
{/if}
