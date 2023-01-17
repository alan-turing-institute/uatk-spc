<script>
  export let pop;
  export let hoveredMsoa;
</script>

<h2>Selected? {hoveredMsoa}</h2>
<p>{pop.households.length} households</p>
<p>{pop.people.length} people</p>
<p>{pop.people[0].toJsonString()} people</p>
