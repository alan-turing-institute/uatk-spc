<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import MsoaBoundaries from "./components/MsoaBoundaries.svelte";
  import Flows from "./components/Flows.svelte";
  import Plots from "./components/Plots.svelte";
  import Diaries from "./components/Diaries.svelte";

  import { onMount } from "svelte";
  import { synthpop } from "./pb/synthpop_pb.js";
  import { msoaStats } from "./data.js";

  let pop;
  let msoas;
  let hoveredMsoa;
  let clickedMsoa = null;

  // When using 'npm run dev', auto-load a file for quicker development
  if (import.meta.env.DEV) {
    onMount(async () => {
      let resp = await fetch("greater_london.pb");
      loadArrayBuffer(await resp.arrayBuffer());
    });
  }

  function loadArrayBuffer(buffer) {
    try {
      console.time("Load protobuf");
      let bytes = new Uint8Array(buffer);
      pop = synthpop.Population.decode(bytes);
      console.timeEnd("Load protobuf");
      console.time("Calculate msoaStats");
      msoas = msoaStats(pop);
      console.timeEnd("Calculate msoaStats");

      // Debugging
      window.pop = pop;
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
      <hr />
      <Plots {pop} {clickedMsoa} />
    </div>
    <div slot="main">
      <Map>
        <MsoaBoundaries {msoas} bind:hoveredMsoa bind:clickedMsoa />
        <Flows {pop} {msoas} {hoveredMsoa} />
        <Diaries {pop} />
      </Map>
    </div>
  </Layout>
{:else if import.meta.env.PROD}
  <p>
    Download and gunzip a file from <a
      href="https://alan-turing-institute.github.io/uatk-spc/outputs.html"
      >here</a
    >.
  </p>
  <label for="input">Load an SPC .pb file</label>
  <input name="input" type="file" on:change={loadFile} />
{:else}
  <p>Loading</p>
{/if}
