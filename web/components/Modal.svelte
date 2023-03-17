<script>
  import { onMount } from "svelte";

  let div;

  export let show = false;

  // TODO This is flaky
  onMount(() => {
    window.onclick = (e) => {
      if (show && e.target == div) {
        show = false;
      }
    };
  });
</script>

<div class="background" bind:this={div} class:show class:hide={!show}>
  <div class="content centered-fullscreen">
    <div>
      <button on:click={() => (show = false)}> Close </button>
    </div>
    <slot />
  </div>
</div>

<style>
  .background {
    position: fixed;
    z-index: 10;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  button {
    background-color: whitesmoke;
  }

  .content {
    background: white;
    padding: 30px;
    border: 1px solid black;
  }

  .centered-fullscreen {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 45vh;
    overflow: scroll;
  }

  .show {
    display: block;
  }

  .hide {
    display: none;
  }
</style>
