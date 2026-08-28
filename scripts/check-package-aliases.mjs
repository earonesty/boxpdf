#!/usr/bin/env node
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
run(process.execPath, ["scripts/prepare-packages.mjs", "--pack"], root);
const tarballs = readdirSync(join(root, ".pack"))
  .filter((name) => name.endsWith(".tgz"))
  .map((name) => join(root, ".pack", name));
if (tarballs.length !== 2) throw new Error(`expected two package tarballs, found ${tarballs.length}`);

const temporary = mkdtempSync(join(tmpdir(), "boxpdf-package-aliases-"));
try {
  writeFileSync(join(temporary, "package.json"), '{"type":"module","private":true}\n');
  run("npm", ["install", "--ignore-scripts", ...tarballs], temporary);
  const writer = await import(pathToFileURL(join(temporary, "node_modules/@boxpdf/writer/dist/index.js")));
  const legacy = await import(pathToFileURL(join(temporary, "node_modules/boxpdf/dist/index.js")));
  assertEqual(Object.keys(writer).sort(), Object.keys(legacy).sort(), "root ESM exports");
  const writerInter = await import(
    pathToFileURL(join(temporary, "node_modules/@boxpdf/writer/dist/inter.js"))
  );
  const legacyInter = await import(pathToFileURL(join(temporary, "node_modules/boxpdf/dist/inter.js")));
  assertEqual(Object.keys(writerInter).sort(), Object.keys(legacyInter).sort(), "inter ESM exports");

  const writerPackage = JSON.parse(
    readFileSync(join(temporary, "node_modules/@boxpdf/writer/package.json"), "utf8"),
  );
  const legacyPackage = JSON.parse(
    readFileSync(join(temporary, "node_modules/boxpdf/package.json"), "utf8"),
  );
  assertEqual(writerPackage.exports, legacyPackage.exports, "export maps");
  assertEqual(writerPackage.version, legacyPackage.version, "versions");
  const help = run(process.execPath, [join(temporary, "node_modules/.bin/boxpdf"), "--help"], temporary);
  if (!help.includes("boxpdf")) throw new Error("legacy CLI did not produce help");
  console.log("scoped and legacy writer packages expose identical APIs and the boxpdf CLI");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: false });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} differ:\n${JSON.stringify(actual)}\n${JSON.stringify(expected)}`);
  }
}
