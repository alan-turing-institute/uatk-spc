<script>
  import { loadArrayBuffer } from "../data.js";

  export let pop;
  export let msoas;

  function loadFile(e) {
    const reader = new FileReader();
    reader.onload = (e) => {
      [pop, msoas] = loadArrayBuffer(e.target.result);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  }
</script>

<input name="input" type="file" class="chooseFile" on:change={loadFile} />

<style>
  .chooseFile {
    background-color: white;
    padding: 3px;
    border-radius: 0%;
    border: 2px solid;
    border-bottom-color: black;
    border-right-color: black;
    border-top-color: #737373;
    border-left-color: #737373;
  }
</style>