<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import DumpProto from "./components/DumpProto.svelte";
</script>

<Layout>
  <div slot="left">
    <h1>SPC</h1>
    <DumpProto/>
  </div>
  <div slot="main">
    <Map>
    </Map>
  </div>
</Layout>
