<script>
  import { onMount } from "svelte";
  import { Population } from "../pb/synthpop_pb.js";

  let pop;

  onMount(async () => {
    let resp = await fetch("rutland.pb");
    let buffer = await resp.arrayBuffer();
    let bytes = new Uint8Array(buffer);
    pop = Population.fromBinary(bytes);
  });
</script>

{#if pop}
<p>{pop.households.length} households</p>
<p>{pop.people.length} people</p>
<p>{pop.people[0].toJsonString()} people</p>
{:else}
Loading
{/if}
