<script>
  import { onMount } from "svelte";
  import Plotly from "plotly.js-dist";
  import { PER_PERSON_NUMERIC_PROPS } from "../data.js";

  export let pop;
  export let clickedMsoa;

  let data = {};

  $: {
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      data[key] = [];
    }

    for (let hh of pop.households) {
      if (clickedMsoa == null || hh.msoa11cd == clickedMsoa) {
        for (let id of hh.members) {
          let person = pop.people[id];
          for (let [key, list] of Object.entries(data)) {
            data[key].push(PER_PERSON_NUMERIC_PROPS[key].get(person));
          }
        }
      }
    }
  }

  function plotly(node, { dataset, title }) {
    Plotly.purge(node);
    Plotly.newPlot(node, [{ x: dataset, type: "histogram" }], { title });

    return {
      update({ dataset: newData }) {
        Plotly.react(node, [{ x: newData, type: "histogram" }], { title });
      },
      destroy() {
        Plotly.purge(node);
      },
    };
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
{:else}
  <p>Click an MSOA to filter</p>
{/if}

{#each Object.entries(data) as [key, dataset]}
  <div use:plotly={{ title: PER_PERSON_NUMERIC_PROPS[key].label, dataset }} />
{/each}
