import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/inter.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: true,
  // Keep peer / runtime deps external. Users install pdf-lib themselves
  // (peerDependency), and @pdf-lib/fontkit is our regular dep — userland
  // resolves it from node_modules. Bundling either inline doubles tarball
  // size and breaks installations that pin specific pdf-lib versions.
  external: ["pdf-lib", "@pdf-lib/fontkit"]
});
