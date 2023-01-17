<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import MsoaBoundaries from "./components/MsoaBoundaries.svelte";

  import { onMount } from "svelte";
  import { Population } from "./pb/synthpop_pb.js";
  import { msoaStats } from "./data.js";

  let pop;
  let msoas;
  let hoveredMsoa;

  onMount(async () => {
    let resp = await fetch("rutland.pb");
    let buffer = await resp.arrayBuffer();
    let bytes = new Uint8Array(buffer);
    pop = Population.fromBinary(bytes);
    msoas = msoaStats(pop);
  });
</script>

{#if pop}
  <Layout>
    <div slot="left">
      <h1>SPC</h1>
      <Sidebar {msoas} {hoveredMsoa} />
    </div>
    <div slot="main">
      <Map>
        <MsoaBoundaries {msoas} bind:hoveredMsoa />
      </Map>
    </div>
  </Layout>
{:else}
  <p>Loading</p>
{/if}
