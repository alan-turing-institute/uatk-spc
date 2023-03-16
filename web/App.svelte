<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import MsoaBoundaries from "./components/MsoaBoundaries.svelte";
  import Flows from "./components/Flows.svelte";
  import Plots from "./components/Plots.svelte";
  import Diaries from "./components/Diaries.svelte";
  import Venues from "./components/Venues.svelte";
  import About from "./components/About.svelte";
  import FileLoader from "./components/FileLoader.svelte";
  import { loadArrayBuffer } from "./data.js";
  import logo from "./assets/logo.png";
  import { onMount } from "svelte";

  let pop;
  let msoas;
  let hoveredMsoa;
  let clickedMsoa = null;
  let showDiaries = false;
  let msoasColorBy = "households";

  // When using 'npm run dev', auto-load a file for quicker development
  if (import.meta.env.DEV) {
    onMount(async () => {
      let resp = await fetch("somerset.pb");
      [pop, msoas] = loadArrayBuffer(await resp.arrayBuffer());
    });
  }
</script>

{#if pop}
  <Layout>
    <div slot="left" class="base">
      <img src={logo} alt="SPC logo" width="100px" />
      <h1>Synthetic Population Catalyst</h1>
      <About />
      <hr />
      <h2>Load region</h2>
      <FileLoader bind:pop bind:msoas />
      <Sidebar {pop} {msoas} {hoveredMsoa} />
      <Plots {pop} {clickedMsoa} />
    </div>
    <div slot="main">
      <Map>
        <MsoaBoundaries
          {msoas}
          bind:hoveredMsoa
          bind:clickedMsoa
          {showDiaries}
          bind:colorBy={msoasColorBy}
        />
        <Flows {pop} {msoas} {hoveredMsoa} {showDiaries} {msoasColorBy} />
        <Diaries {pop} bind:show={showDiaries} />
        <Venues {pop} />
      </Map>
    </div>
  </Layout>
{:else if import.meta.env.PROD}
  <h2>Load region</h2>
  <p>
    Run SPC or download and gunzip a file from <a
      href="https://alan-turing-institute.github.io/uatk-spc/outputs.html"
      >here</a
    >.
  </p>
  <FileLoader bind:pop bind:msoas />
{:else}
  <p>Loading</p>
{/if}

<style>
  .base {
    background-color: whitesmoke;
    padding: 10px;
    width: 360px;
  }
</style>
