<script>
  import Plotly from "plotly.js-dist";

  export let pop;
  export let clickedMsoa;

  // Note this is always present in the template. If we hide it under the
  // clickedMsoa condition, it doesn't get created before the reactive block
  // below runs.
  let div1, div2, div3, div4;

  $: {
    for (let div of [div1, div2, div3, div4]) {
      if (div) {
        Plotly.purge(div);
      }
    }

    if (clickedMsoa) {
      let ages = [];
      let salary_yearly = [];
      let salary_hourly = [];
      let bmi_new = [];
      for (let hh of pop.households) {
        if (hh.msoa11cd == clickedMsoa) {
          for (let id of hh.members) {
            let p = pop.people[id];
            ages.push(p.demographics.ageYears);
            salary_yearly.push(p.employment.salaryYearly);
            salary_hourly.push(p.employment.salaryHourly);
            bmi_new.push(p.health.bmiNew);
          }
        }
      }

      Plotly.newPlot(div1, [{ x: ages, type: "histogram" }], {
        title: `Ages in ${clickedMsoa}`,
      });
      Plotly.newPlot(div2, [{ x: salary_yearly, type: "histogram" }], {
        title: `Yearly salary in ${clickedMsoa}`,
      });
      Plotly.newPlot(div3, [{ x: salary_hourly, type: "histogram" }], {
        title: `Hourly salary in ${clickedMsoa}`,
      });
      Plotly.newPlot(div4, [{ x: bmi_new, type: "histogram" }], {
        title: `BMI in ${clickedMsoa}`,
      });
    }
  }
</script>

{#if clickedMsoa}
  <h2>{clickedMsoa}</h2>
{:else}
  <p>Click an MSOA for more details</p>
{/if}
<div bind:this={div1} />
<div bind:this={div2} />
<div bind:this={div3} />
<div bind:this={div4} />
