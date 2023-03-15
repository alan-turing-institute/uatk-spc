<script>
  export let tabs = [];
  export let active = tabs[0];
</script>

{#each tabs as tab}
  <button
    class="tab"
    class:active={active == tab}
    on:click={() => (active = tab)}
  >
    {tab}
  </button>
{/each}

<style>
  .tab {
    background-color: white;
    padding: 10px;
  }
  .tab.active {
    background-color: #b3b3b3;
  }
</style>
