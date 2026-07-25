import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../docs");
const html = await readFile(join(root, "index.html"), "utf8");
const failures = [];

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const knownIds = new Set();
for (const id of ids) {
  if (knownIds.has(id)) failures.push(`duplicate id: #${id}`);
  knownIds.add(id);
}

for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
  const reference = match[1];
  if (reference.startsWith("#")) {
    if (!knownIds.has(reference.slice(1))) {
      failures.push(`missing page anchor: ${reference}`);
    }
    continue;
  }

  if (/^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  const target = join(root, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
  try {
    await access(target);
  } catch {
    failures.push(`missing local asset: ${reference}`);
  }
}

for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
  if (!/\salt="[^"]*"/.test(match[1])) {
    failures.push(`image is missing alt text: ${match[0]}`);
  }
}

for (const match of html.matchAll(/<a\b([^>]*)target="_blank"([^>]*)>/g)) {
  const attributes = `${match[1]} ${match[2]}`;
  if (!/\srel="[^"]*\bnoopener\b[^"]*"/.test(attributes)) {
    failures.push(`target="_blank" link is missing rel="noopener": ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`docs site OK: ${knownIds.size} anchors and all local assets resolved`);
}
