<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import MsoaBoundaries from "./components/MsoaBoundaries.svelte";
  import Flows from "./components/Flows.svelte";

  import { onMount } from "svelte";
  import { synthpop } from "./pb/synthpop_pb.js";
  import { msoaStats } from "./data.js";

  let pop;
  let msoas;
  let hoveredMsoa;

  // Switch to false to auto-load a local file, useful for quicker development
  let githubDeployment = true;

  if (!githubDeployment) {
    onMount(async () => {
      let resp = await fetch("rutland.pb");
      loadArrayBuffer(await resp.arrayBuffer());
    });
  }

  function loadArrayBuffer(buffer) {
    try {
      let bytes = new Uint8Array(buffer);
      pop = synthpop.Population.decode(bytes);
      msoas = msoaStats(pop);
    } catch (err) {
      window.alert(`Couldn't load SPC proto file: ${err}`);
    }
  }

  function loadFile(e) {
    const reader = new FileReader();
    reader.onload = (e) => {
      loadArrayBuffer(e.target.result);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  }
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
        <Flows {pop} {msoas} {hoveredMsoa} />
      </Map>
    </div>
  </Layout>
{:else if githubDeployment}
  <label for="input">Load an SPC .pb file</label>
  <input name="input" type="file" on:change={loadFile} />
{:else}
  <p>Loading</p>
{/if}
