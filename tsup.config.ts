import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/inter.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: true
});
