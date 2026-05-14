import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

interface TemplateCase {
  name: string;
  script: string;
  out: string;
  minPages?: number;
  maxPages?: number;
}

const templates: TemplateCase[] = [
  { name: "receipt", script: "templates/receipt.ts", out: "fixtures/receipt.pdf", minPages: 1, maxPages: 1 },
  { name: "boarding pass", script: "templates/boarding-pass.ts", out: "fixtures/boarding-pass.pdf", minPages: 1, maxPages: 1 },
  { name: "resume", script: "templates/resume.ts", out: "fixtures/resume.pdf", minPages: 1, maxPages: 3 },
  { name: "order confirmation", script: "templates/order-confirmation.ts", out: "fixtures/order-confirmation.pdf", minPages: 1, maxPages: 1 },
  { name: "certificate", script: "templates/certificate.ts", out: "fixtures/certificate.pdf", minPages: 1, maxPages: 1 }
];

describe("templates render to valid PDFs", () => {
  for (const t of templates) {
    it(t.name, async () => {
      const result = spawnSync("npx", ["tsx", t.script], { cwd: ROOT, stdio: "pipe" });
      if (result.status !== 0) {
        throw new Error(`Template ${t.name} failed:\n${result.stderr.toString()}`);
      }
      const outPath = resolve(ROOT, t.out);
      expect(existsSync(outPath)).toBe(true);
      const bytes = readFileSync(outPath);
      expect(bytes.byteLength).toBeGreaterThan(800);
      const back = await PDFDocument.load(bytes, { updateMetadata: false });
      const pages = back.getPageCount();
      if (t.minPages !== undefined) expect(pages).toBeGreaterThanOrEqual(t.minPages);
      if (t.maxPages !== undefined) expect(pages).toBeLessThanOrEqual(t.maxPages);
    }, 30_000);
  }
});
