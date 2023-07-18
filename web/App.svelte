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
  import logo from "./assets/SPC_WebExplorerLogo.png";
  import bgImage from "./assets/Big_Image.png";
  import { onMount } from "svelte";

  let pop;
  let msoas;
  let allMsoaData;
  let hoveredMsoa;
  let clickedMsoa = null;
  let showDiaries = false;
  let msoasColorBy = "households";

  // When using 'npm run dev', auto-load a file for quicker development
  if (import.meta.env.DEV) {
    onMount(async () => {
      let resp = await fetch("somerset.pb");
      [pop, msoas, allMsoaData] = loadArrayBuffer(await resp.arrayBuffer());
    });
  }
</script>

{#if pop}
  <Layout>
    <div slot="left" class="base">
      <img src={logo} alt="SPC logo" width="100%" /><br />
      <br />
      <FileLoader bind:pop bind:msoas bind:allMsoaData />
      &emsp;&emsp;
      <About />
      <hr />
      <Sidebar {pop} {msoas} {allMsoaData} {hoveredMsoa} />
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
<div class="container">
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img  class="bg_image" src={bgImage} alt="bg_image"/>
  <FileLoader bind:pop bind:msoas bind:allMsoaData homepageStyle={true} />
</div>
{:else}
  <p>Loading file, it will take some seconds, please wait...</p>
{/if}

<style>
  @font-face {
    font-family: "Poppins", sans-serif;
    font-style: normal;
    font-weight: 400, 600;
    font-display: swap;
    src: local("Poppins Regular"), local("Poppins-SemiBold"),
      url(https://fonts.googleapis.com/css2?family=Poppins:wght@400..600&display=swap)
        format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
      U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212,
      U+2215, U+FEFF, U+FFFD;
  }
  .base {
    background-color: whitesmoke;
    padding: 10px;
    width: 400px;
    font-family: "Poppins", sans-serif;
  }
  .bg_image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
  }
  .container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>