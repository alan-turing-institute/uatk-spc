<script>
  import { loadArrayBuffer } from "../data.js";
  import { onMount } from 'svelte';

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

  let buttonStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '50px',
    fontSize: '16px',
    zIndex: '1' // Ensure the button is on top of other elements
  };


  function updateButtonPosition() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Adjust button position based on screen size
    buttonStyle.top = `${screenHeight / 2}px`;
    buttonStyle.left = `${screenWidth / 2}px`;
  }

  onMount(() => {
    // Update button position when the component is mounted
    updateButtonPosition();

    // Update button position when the window is resized
    window.addEventListener('resize', updateButtonPosition);

    return () => {
      // Cleanup event listener when the component is unmounted
      window.removeEventListener('resize', updateButtonPosition);
    };
  });

</script>

<!-- TODO Interactive elements inside a label are apparently invalid, but this works -->
<div >
  <button class="button"
  onclick="document.getElementById('load_file').click();"
  class:homepagePosition={homepageStyle}
  >
    Load the file here!
  </button>
  <input type="file" id="load_file" on:change={loadFile} />
</div>

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

  input[type="file"] {
    cursor: pointer;
    /* Make the input type=file effectively invisible, but still let browser accessibility stuff work */
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
  }

  .button {
    background-color: #fff0;
    outline-style: auto;
    font-family: "Poppins-SemiBold", sans-serif;
  }

  .homepagePosition {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 50px;
    font-size: 20px;
    z-index: 2;
    font-family: "Poppins-SemiBold", sans-serif;
    outline-color: #fff0;
    outline-color: invert;
  }
</style>