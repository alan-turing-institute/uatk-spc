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
    background-color: #f4f4f5;
    padding: 1rem;
  }
  .tab.active {
    background-color: #e4e4e7;
  }
</style>
