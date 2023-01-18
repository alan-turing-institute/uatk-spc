import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "/uatk-spc/app/",
  plugins: [svelte()],
});
