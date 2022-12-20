import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  globalName: "Base64",
  minifyWhitespace: true,
  minifySyntax: true,
});
