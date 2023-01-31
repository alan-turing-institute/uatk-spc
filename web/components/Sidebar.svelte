<script>
  export let msoas;
  export let hoveredMsoa;

  // All the things in the per-MSOA GeoJSON feature
  let props;
  $: {
    if (hoveredMsoa) {
      props = msoas[hoveredMsoa].properties;
    } else {
      // Calculate totals over all MSOAs, using the per-MSOA properties
      props = {
        households: 0,
        people: 0,
        avg_age: 0.0,
        avg_household_size: 0.0,
        avg_salary_yearly: 0.0,
        avg_salary_hourly: 0.0,
        avg_bmi_new: 0.0,
      };
      // Sum
      for (let msoa of Object.values(msoas)) {
        for (let key of Object.keys(props)) {
          props[key] += msoa.properties[key];
        }
      }
      for (let key of Object.keys(props)) {
        if (key.startsWith("avg_")) {
          props[key] /= Object.keys(msoas).length;
        }
      }
    }
  }
</script>

{#if hoveredMsoa}
  <h2>{hoveredMsoa}</h2>
{:else}
  <h2>{Object.keys(msoas).length} MSOAs</h2>
{/if}
<p>{props.households.toLocaleString("en-us")} households</p>
<p>{props.people.toLocaleString("en-us")} people</p>
<p>Average age (years): {props.avg_age.toFixed(0)}</p>
<p>Average household size: {props.avg_household_size.toFixed(1)}</p>
<p>Average yearly salary: {props.avg_salary_yearly.toFixed(1)}</p>
<p>Average hourly salary: {props.avg_salary_hourly.toFixed(1)}</p>
<p>Average BMI: {props.avg_bmi_new.toFixed(1)}</p>
