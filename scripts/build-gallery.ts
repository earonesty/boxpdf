// Renders every template + theme combination, produces PDFs + PNG thumbnails
// in docs/gallery/, suitable for the public gallery site.
//
// Run with: pnpm run gallery

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const GALLERY = resolve(ROOT, "docs/gallery");
const FIXTURES = resolve(ROOT, "fixtures");

if (!existsSync(GALLERY)) mkdirSync(GALLERY, { recursive: true });
if (!existsSync(`${GALLERY}/pdf`)) mkdirSync(`${GALLERY}/pdf`, { recursive: true });
if (!existsSync(`${GALLERY}/png`)) mkdirSync(`${GALLERY}/png`, { recursive: true });

const scripts = [
  "templates/receipt.ts",
  "templates/boarding-pass.ts",
  "templates/resume.ts",
  "templates/order-confirmation.ts",
  "templates/certificate.ts",
  "examples/themes-showcase.ts",
  "examples/itinerary.ts",
  "examples/invoice.ts",
  "examples/debug.ts",
  "examples/absolute-positioning.ts",
  "examples/rich-content.ts"
];

console.log("→ rendering all templates");
for (const script of scripts) {
  const result = spawnSync("npx", ["tsx", script], { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`✗ ${script} failed`);
    process.exit(1);
  }
}

console.log("→ converting to PNG thumbnails");
const fixturePdfs = readdirSync(FIXTURES).filter((f) => f.endsWith(".pdf"));
for (const pdf of fixturePdfs) {
  const base = pdf.replace(/\.pdf$/, "");
  const result = spawnSync(
    "pdftoppm",
    ["-r", "120", "-png", `${FIXTURES}/${pdf}`, `${GALLERY}/png/${base}`],
    { stdio: "inherit" }
  );
  if (result.status !== 0) console.warn(`! pdftoppm failed for ${pdf}`);
  copyFileSync(`${FIXTURES}/${pdf}`, `${GALLERY}/pdf/${pdf}`);
}

const total = readdirSync(`${GALLERY}/png`).length;
console.log(`✓ wrote ${total} PNG thumbnail(s) to docs/gallery/png and PDFs to docs/gallery/pdf`);

// Summary table
console.log("\nGallery contents:");
for (const f of readdirSync(`${GALLERY}/png`).sort()) {
  const stat = statSync(`${GALLERY}/png/${f}`);
  console.log(`  ${f}  (${(stat.size / 1024).toFixed(1)} KB)`);
}
