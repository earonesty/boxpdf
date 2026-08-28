#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stageRoot = join(root, ".pack");
const args = new Set(process.argv.slice(2));
const sourcePackage = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const packages = [
  { name: "@boxpdf/writer", directory: "writer" },
  { name: "boxpdf", directory: "boxpdf" },
];

rmSync(stageRoot, { recursive: true, force: true });
mkdirSync(stageRoot, { recursive: true });

for (const target of packages) {
  const directory = join(stageRoot, target.directory);
  mkdirSync(directory, { recursive: true });
  for (const path of ["dist", "templates", "README.md", "LICENSE"]) {
    const source = join(root, path);
    if (existsSync(source)) cpSync(source, join(directory, path), { recursive: true });
  }
  const manifest = {
    ...sourcePackage,
    name: target.name,
    scripts: undefined,
  };
  writeFileSync(join(directory, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

if (args.has("--pack") || args.has("--publish")) {
  for (const target of packages) {
    const directory = join(stageRoot, target.directory);
    if (args.has("--publish") && isPublished(target.name, sourcePackage.version)) {
      console.log(`${target.name}@${sourcePackage.version} is already published; skipping`);
      continue;
    }
    const commandArgs = args.has("--publish")
      ? ["publish", "--provenance", "--access", "public"]
      : ["pack", "--pack-destination", stageRoot];
    const result = spawnSync("npm", commandArgs, {
      cwd: directory,
      stdio: "inherit",
      shell: false,
      env: { ...process.env, npm_config_cache: join(stageRoot, ".npm-cache") },
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

console.log(`prepared ${packages.map((target) => target.name).join(" and ")} ${sourcePackage.version}`);

function isPublished(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    cwd: root,
    encoding: "utf8",
    shell: false,
    env: { ...process.env, npm_config_cache: join(stageRoot, ".npm-cache") },
  });
  if (result.status === 0) return true;
  if (`${result.stdout ?? ""}\n${result.stderr ?? ""}`.includes("E404")) return false;
  process.stderr.write(result.stderr ?? result.stdout ?? "npm view failed\n");
  process.exit(result.status ?? 1);
}
