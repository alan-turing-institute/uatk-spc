<script>
  import Modal from "./Modal.svelte";

  let showModal = false;
</script>

<button on:click={() => (showModal = true)}> About </button>

<Modal bind:show={showModal}>
  <h1>About SPC</h1>
  <div>
    SPC makes it easier for researchers to work with synthetic population data
    in England. It combines a variety of data sources and outputs a single file
    in protocol buffer format, describing the population in a given study area
    and at a given date. The data includes demographic, health, and daily
    activity data per person, and information about the venues where people
    conduct activities.
  </div>
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
  <div>
    The source code is distributed under the MIT License. Some of the raw
    datasets are safeguarded and require registration to the UK Data Service for
    access.
  </div>
  <br />
  <br />
  <div>
    Web app created by Dustin Carlino, designed by Fernando Benitez-Paez and
    Hadrien Salat
  </div>
  <br />
  <div>&copy;2020 Urban-Analytics</div>
</Modal>

<style>
  @font-face {
    font-family: "Poppins", sans-serif;
    font-style: normal;
    font-weight: 400, 600;
    font-display: swap;
    src: local("Poppins Regular"), local("Poppins-SemiBold"),
      url(https://fonts.googleapis.com/css2?family=Poppins:wght@400..600&display=swap)
        format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
      U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212,
      U+2215, U+FEFF, U+FFFD;
  }
  div,
  h1,
  ul,
  a {
    font-family: "Poppins", sans-serif;
  }

  button {
    background-color: white;
    font-family: "Poppins-SemiBold", sans-serif;
  }
</style>
