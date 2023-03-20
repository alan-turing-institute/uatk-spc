<script>
  import Modal from "./Modal.svelte";

  let showModal = false;
</script>

<button on:click={() => (showModal = true)}> About </button>

<Modal bind:show={showModal}>
  <h1>About SPC</h1>
  SPC makes it easier for researchers to work with synthetic population data in England.
  It combines a variety of data sources and outputs a single file in protocol buffer
  format, describing the population in a given study area and at a given date. The
  data includes demographic, health, and daily activity data per person, and information
  about the venues where people conduct activities.
  <ul>
    <li>
      <a
        href="https://alan-turing-institute.github.io/uatk-spc/"
        target="_blank"
        rel="noreferrer">Detailed documentation</a
      > (see in particular sections 7 and 8 to learn about the caveats of the data
      and methods)
    </li>
    <li>
      <a
        href="https://github.com/alan-turing-institute/uatk-spc"
        target="_blank"
        rel="noreferrer">Source code</a
      >
    </li>
  </ul>
  The source code is distributed under the MIT License. Some of the raw datasets
  are safeguarded and require registration to the UK Data Service for access.
  <br />
  <br />
  Web app created by Dustin Carlino, designed by Fernando Benitez-Paez and Hadrien Salat
  <br />
  &copy;2020 Urban-Analytics
</Modal>

<style>
  button {
    background-color: white;
  }
</style>
