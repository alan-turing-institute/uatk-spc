<script>
  import { onMount } from "svelte";
  import Plotly from "plotly.js-dist";

  export let pop;
  export let clickedMsoa;

  let ages = [];
  let salary_yearly = [];
  let salary_hourly = [];
  let bmi_new = [];

  $: {
    ages = [];
    salary_yearly = [];
    salary_hourly = [];
    bmi_new = [];

    for (let hh of pop.households) {
      if (clickedMsoa == null || hh.msoa11cd == clickedMsoa) {
        for (let id of hh.members) {
          let p = pop.people[id];
          ages.push(p.demographics.ageYears);
          salary_yearly.push(p.employment.salaryYearly);
          salary_hourly.push(p.employment.salaryHourly);
          bmi_new.push(p.health.bmiNew);
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
<div use:plotly={{ title: "Age", dataset: ages }} />
<div use:plotly={{ title: "Yearly Salary", dataset: salary_yearly }} />
<div use:plotly={{ title: "Hourly Salary", dataset: salary_hourly }} />
<div use:plotly={{ title: "BMI", dataset: bmi_new }} />
