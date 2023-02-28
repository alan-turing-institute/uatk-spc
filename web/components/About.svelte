<script>
  import { onMount } from "svelte";

  let div;

  let show = false;

  onMount(() => {
    window.onclick = (e) => {
      if (show && e.target == div) {
        show = false;
      }
    };
  });
</script>

<button type="button" on:click={() => (show = true)}>About</button>

<div class="background" bind:this={div} class:show class:hide={!show}>
  <div class="content centered-fullscreen">
    <h1>About SPC</h1>
    <ul>
      <li>
        <a
          href="https://alan-turing-institute.github.io/uatk-spc/"
          target="_blank">SPC documentation</a
        >
      </li>
      <li>
        All data shown has various caveats; see the documentation for details
      </li>
      <li>
        Web app created by Dustin Carlino, designed by Fernando Benitez and
        Hadrien Salat
      </li>
    </ul>
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
  }

  .show {
    display: block;
  }
  .hide {
    display: none;
  }
</style>
