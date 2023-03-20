<script>
  import { loadArrayBuffer } from "../data.js";

  export let pop;
  export let msoas;
  export let allMsoaData;

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
  <button type="button" onclick="document.getElementById('load_file').click();">
    Load region
  </button>
</label>

<style>
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
    background-color: white;
    position: absolute;
    top: 65%;
    right: 50%;
    text-align: center;
    font-size: 28px;
  }
</style>
