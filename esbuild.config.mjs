import esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/server.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: resolve(__dirname, "dist/server.js"),
  packages: "external",
  minify: false,
  sourcemap: false,
  banner: {
    js: "import { createRequire as __cR } from 'module'; const require = __cR(import.meta.url);",
  },
  logLevel: "info",
});
