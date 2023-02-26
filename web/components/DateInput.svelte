<script>
  // Thanks to https://svelte.dev/repl/dc963bbead384b69aad17824149d6d27?version=3.25.1
  // See https://github.com/sveltejs/svelte/issues/3937
  import { onMount } from "svelte";
  import dayjs from "dayjs";

  export let date = new Date();
  const format = "YYYY-MM-DD";

  let internal;

  const input = (x) => (internal = dayjs(x).format(format));
  const output = (x) => (date = dayjs(x, format).toDate());

  $: input(date);
  $: output(internal);
</script>

<input type="date" bind:value={internal} />
