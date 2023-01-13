<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import DumpProto from "./components/DumpProto.svelte";
  import MsoaBoundaries from "./components/MsoaBoundaries.svelte";

  import { onMount } from "svelte";
  import { Population } from "./pb/synthpop_pb.js";

  let pop;

  onMount(async () => {
    let resp = await fetch("rutland.pb");
    let buffer = await resp.arrayBuffer();
    let bytes = new Uint8Array(buffer);
    pop = Population.fromBinary(bytes);
  });
</script>

{#if pop}
  <Layout>
    <div slot="left">
      <h1>SPC</h1>
      <DumpProto {pop} />
    </div>
    <div slot="main">
      <Map>
        <MsoaBoundaries {pop} />
      </Map>
    </div>
  </Layout>
{:else}
  <p>Loading</p>
{/if}
