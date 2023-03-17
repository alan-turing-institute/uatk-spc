<script>
  import Tabs from "./Tabs.svelte";
  import { onMount } from "svelte";
  import Plotly from "plotly.js-dist";
  import {
    PER_PERSON_NUMERIC_PROPS,
    PER_PERSON_CATEGORICAL_PROPS,
    PER_HOUSEHOLD_CATEGORICAL_PROPS,
  } from "../data.js";

  export let pop;
  export let clickedMsoa;

  let theme = "Demographics";

  let numericData = {};
  let categoricalPersonData = {};
  let categoricalHouseholdData = {};

  $: {
    for (let key of Object.keys(PER_PERSON_NUMERIC_PROPS)) {
      numericData[key] = [];
    }
    for (let key of Object.keys(PER_PERSON_CATEGORICAL_PROPS)) {
      // A count for each category item
      categoricalPersonData[key] = {};
    }
    for (let key of Object.keys(PER_HOUSEHOLD_CATEGORICAL_PROPS)) {
      categoricalHouseholdData[key] = {};
    }

    for (let hh of pop.households) {
      if (clickedMsoa == null || hh.msoa11cd == clickedMsoa) {
        for (let id of hh.members) {
          let person = pop.people[id];
          for (let [key, list] of Object.entries(numericData)) {
            let value = PER_PERSON_NUMERIC_PROPS[key].get(person);
            if (value == null) {
              continue;
            }
            numericData[key].push(value);
          }
          for (let [key, list] of Object.entries(categoricalPersonData)) {
            let prop = PER_PERSON_CATEGORICAL_PROPS[key];
            let value = prop.lookup[prop.get(person)];
            if (value == null) {
              continue;
            }
            let dict = categoricalPersonData[key];
            if (!dict.hasOwnProperty(value)) {
              dict[value] = 0;
            }
            dict[value]++;
          }
        }

        for (let [key, list] of Object.entries(categoricalHouseholdData)) {
          let prop = PER_HOUSEHOLD_CATEGORICAL_PROPS[key];
          let value = prop.lookup[prop.get(hh.details)];
          if (value == null) {
            continue;
          }
          let dict = categoricalHouseholdData[key];
          if (!dict.hasOwnProperty(value)) {
            dict[value] = 0;
          }
          dict[value]++;
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

  function pieChart(node, { dataset, title }) {
    Plotly.purge(node);
    Plotly.newPlot(
      node,
      [
        {
          labels: Object.keys(dataset),
          values: Object.values(dataset),
          type: "pie",
        },
      ],
      { title }
    );

    return {
      update({ dataset: newData }) {
        Plotly.newPlot(
          node,
          [
            {
              labels: Object.keys(newData),
              values: Object.values(newData),
              type: "pie",
            },
          ],
          { title }
        );
      },
      destroy() {
        Plotly.purge(node);
      },
    };
  }

  function maybeNote(note) {
    if (note) {
      return `<small>${note}</small>`;
    }
    return "";
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
{:else}
  <h2>Click an MSOA to filter</h2>
{/if}

<Tabs
  tabs={["Demographics", "Employment", "Health", "Household"]}
  bind:active={theme}
/>

<br />
<br />

{#each Object.entries(numericData) as [key, dataset]}
  {@const props = PER_PERSON_NUMERIC_PROPS[key]}
  {#if props.theme == theme}
    <div use:histogram={{ title: props.label, dataset }} />
    {@html maybeNote(props.note)}
  {/if}
{/each}

{#each Object.entries(categoricalPersonData) as [key, dataset]}
  {@const props = PER_PERSON_CATEGORICAL_PROPS[key]}
  {#if props.theme == theme}
    {#if props.pieChart}
      <div
        use:pieChart={{
          title: props.label,
          dataset,
        }}
      />
    {:else}
      <div
        use:barChart={{
          title: props.label,
          dataset,
        }}
      />
    {/if}
    {@html maybeNote(props.note)}
  {/if}
{/each}
{#each Object.entries(categoricalHouseholdData) as [key, dataset]}
  {@const props = PER_HOUSEHOLD_CATEGORICAL_PROPS[key]}
  {#if props.theme == theme}
    {#if props.pieChart}
      <div
        use:pieChart={{
          title: props.label,
          dataset,
        }}
      />
    {:else}
      <div
        use:barChart={{
          title: props.label,
          dataset,
        }}
      />
    {/if}
    {@html maybeNote(props.note)}
  {/if}
{/each}
