<script>
  import { onMount } from "svelte";
  import Plotly from "plotly.js-dist";
  import {
    PER_PERSON_NUMERIC_PROPS,
    PER_PERSON_CATEGORICAL_PROPS,
  } from "../data.js";

  export let pop;
  export let clickedMsoa;

  let theme = "Demographics";

  let numericData = {};
  let categoricalData = {};

  $: {
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      numericData[key] = [];
    }
    for (let key of Object.keys(PER_PERSON_CATEGORICAL_PROPS)) {
      // A count for each category item
      categoricalData[key] = {};
    }

    for (let hh of pop.households) {
      if (clickedMsoa == null || hh.msoa11cd == clickedMsoa) {
        for (let id of hh.members) {
          let person = pop.people[id];
          for (let [key, list] of Object.entries(numericData)) {
            let value = PER_PERSON_NUMERIC_PROPS[key].get(person);
            if (value != null) {
              numericData[key].push(value);
            }
          }
          for (let [key, list] of Object.entries(categoricalData)) {
            let prop = PER_PERSON_CATEGORICAL_PROPS[key];
            let value = prop.lookup[prop.get(person)];
            let dict = categoricalData[key];
            if (!dict.hasOwnProperty(value)) {
              dict[value] = 0;
            }
            dict[value]++;
          }
        }
      }
    }
  }

  function histogram(node, { dataset, title }) {
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

  function barChart(node, { dataset, title }) {
    console.log(`display ${JSON.stringify(dataset)}`);
    Plotly.purge(node);
    Plotly.newPlot(
      node,
      [{ x: Object.keys(dataset), y: Object.values(dataset), type: "bar" }],
      { title }
    );

    return {
      update({ dataset: newData }) {
        Plotly.newPlot(
          node,
          [{ x: Object.keys(newData), y: Object.values(newData), type: "bar" }],
          { title }
        );
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

Theme:
<select bind:value={theme}>
  <option value="Demographics">Demographics</option>
  <option value="Employment">Employment</option>
  <option value="Health">Health</option>
</select>

{#each Object.entries(numericData) as [key, dataset]}
  {#if PER_PERSON_NUMERIC_PROPS[key].theme == theme}
    <div
      use:histogram={{ title: PER_PERSON_NUMERIC_PROPS[key].label, dataset }}
    />
  {/if}
{/each}

{#each Object.entries(categoricalData) as [key, dataset]}
  {#if PER_PERSON_CATEGORICAL_PROPS[key].theme == theme}
    <div
      use:barChart={{ title: PER_PERSON_CATEGORICAL_PROPS[key].label, dataset }}
    />
  {/if}
{/each}