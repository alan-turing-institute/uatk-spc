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

<label for="input">Load an SPC .pb file</label>
<input name="input" type="file" on:change={loadFile} />
