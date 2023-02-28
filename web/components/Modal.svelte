<script>
  export let contents = null;
</script>

{#if contents != null}
  <div>
    <button type="button" on:click={() => (contents = null)}>Close</button>
    <pre>{contents}</pre>
  </div>
{/if}

<style>
  div {
    background: white;
    padding: 30px;
    border: 1px solid black;

    position: absolute;
    width: 60vw;
    height: 60vh;
    z-index: 10;
    overflow: scroll;
  }
</style>
