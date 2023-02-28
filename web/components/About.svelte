<script>
  import Modal from "./Modal.svelte";

  let showModal = false;
</script>

<button type="button" on:click={() => (showModal = true)}>About</button>

<Modal bind:show={showModal}>
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
</Modal>
