<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
</script>

<Layout>
  <div slot="left">
    <h1>SPC</h1>
  </div>
  <div slot="main">
    <Map>
    </Map>
  </div>
</Layout>
