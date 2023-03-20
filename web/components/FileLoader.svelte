<script>
  import { loadArrayBuffer } from "../data.js";

  export let pop;
  export let msoas;
  export let allMsoaData;
  export let homepageStyle = false;

  function loadFile(e) {
    const reader = new FileReader();
    reader.onload = (e) => {
      [pop, msoas, allMsoaData] = loadArrayBuffer(e.target.result);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  }
</script>

<!-- TODO Interactive elements inside a label are apparently invalid, but this works -->
<label>
  <input type="file" id="load_file" on:change={loadFile} />
  <button
    type="button"
    onclick="document.getElementById('load_file').click();"
    class:homepagePosition={homepageStyle}
  >
    Load region
  </button>
</label>

<style>

  @font-face {
          font-family: 'Poppins', sans-serif;
          font-style: normal;
          font-weight: 400,600;
          font-display: swap;
          src: local('Poppins Regular'), local('Poppins-SemiBold'), url(https://fonts.googleapis.com/css2?family=Poppins:wght@400..600&display=swap) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }

  input[type="file"] {
    cursor: pointer;

    /* Make the input type=file effectively invisible, but still let browser accessibility stuff work */
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  button {
    background-color: #fff0;
    outline-color: #fff0;
    outline-color: invert;
  }

  .homepagePosition {
    position: absolute;
    top: 650px;
    right: 48%;
    text-align: center;
    font-size: 34px;
    font-family: 'Poppins-SemiBold', sans-serif;
  }
</style>
