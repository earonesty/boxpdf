/**
 * Generate the same documents via renderFlow + streamFlow, save both,
 * compare sizes and validity side by side.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { Writable } from "node:stream";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  PageSizes,
  cleanTheme,
  hex,
  hline,
  hstack,
  renderFlow,
  streamFlow,
  text,
  vstack,
  pageInner,
  type Node
} from "../src/index.js";

const OUT = new URL("../out/compare/", import.meta.url);
mkdirSync(OUT, { recursive: true });

type Scenario = {
  name: string;
  build(): Promise<{ pdf: PDFDocument; nodes: Node[] }>;
};

async function makeSimpleScenario(pageCount: number): Promise<{ pdf: PDFDocument; nodes: Node[] }> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const nodes: Node[] = [];
  const INNER = pageInner(PageSizes.Letter, 36);
  for (let i = 1; i <= pageCount; i++) {
    nodes.push(text(`Section ${i}`, { size: 18, font: bold, width: INNER }));
    nodes.push(hline({ color: { r: 0.7, g: 0.7, b: 0.7 }, margin: { top: 4, bottom: 8 } }));
    for (let line = 0; line < 50; line++) {
      nodes.push(
        text(
          `Line ${line.toString().padStart(2, "0")} of section ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          { size: 10, font, width: INNER, margin: { top: 1, bottom: 1 } }
        )
      );
    }
  }
  return { pdf, nodes };
}

async function makeWithHeaderFooter(): Promise<{
  pdf: PDFDocument;
  nodes: Node[];
}> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const INNER = pageInner(PageSizes.Letter, 36);
  const nodes: Node[] = [];
  for (let i = 0; i < 80; i++) {
    nodes.push(
      hstack(
        { width: INNER, gap: 12, margin: { top: 2, bottom: 2 } },
        text(`Row #${i.toString().padStart(3, "0")}`, { size: 11, font: bold, width: 90 }),
        text(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
          { size: 11, font, shrink: 1 }
        )
      )
    );
  }
  return { pdf, nodes };
}

async function makeReceipt(): Promise<{ pdf: PDFDocument; nodes: Node[] }> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const theme = cleanTheme(font, bold);
  const INNER = pageInner(PageSizes.Letter, 36);
  return {
    pdf,
    nodes: [
      text("Order #18472", theme.type.h1),
      text("Confirmation — May 14, 2026", theme.type.caption),
      hline(theme.hr),
      ...[
        ["Customer", "Erik Aronesty"],
        ["Item", "Wool socks × 2 — $28.00"],
        ["Item", "Coffee mug × 1 — $18.00"],
        ["Subtotal", "$46.00"],
        ["Tax (8.75%)", "$4.03"],
        ["Total", "$50.03"]
      ].map(([label, value]) =>
        hstack(
          { width: INNER, gap: 16, margin: { top: 4, bottom: 4 } },
          text(label!, { ...theme.type.body, font: bold, width: 140 }),
          text(value!, { ...theme.type.body, shrink: 1 })
        )
      )
    ]
  };
}

const scenarios: Scenario[] = [
  { name: "01-simple-5pages", build: () => makeSimpleScenario(5) },
  { name: "02-simple-50pages", build: () => makeSimpleScenario(50) },
  { name: "03-rows-shrink", build: () => makeWithHeaderFooter() },
  { name: "04-receipt", build: () => makeReceipt() }
];

interface Result {
  name: string;
  renderFlowBytes: number;
  streamFlowBytes: number;
  delta: number;
  rfPages: number;
  sfPages: number;
  rfValid: boolean;
  sfValid: boolean;
}

async function runScenario(s: Scenario): Promise<Result> {
  // --- renderFlow path ---
  const { pdf: pdfRf, nodes: nodesRf } = await s.build();
  await renderFlow(pdfRf, nodesRf, { size: PageSizes.Letter, margin: 36 });
  const rfBytes = await pdfRf.save();
  const rfPath = new URL(`./${s.name}-renderFlow.pdf`, OUT);
  writeFileSync(rfPath, rfBytes);

  // --- streamFlow path ---
  const { pdf: pdfSf, nodes: nodesSf } = await s.build();
  let collected = new Uint8Array(0);
  const sink = new WritableStream<Uint8Array>({
    write(chunk) {
      const next = new Uint8Array(collected.length + chunk.length);
      next.set(collected, 0);
      next.set(chunk, collected.length);
      collected = next;
    }
  });
  const { pageCount: sfPages } = await streamFlow(pdfSf, sink, nodesSf, {
    size: PageSizes.Letter,
    margin: 36
  });
  const sfPath = new URL(`./${s.name}-streamFlow.pdf`, OUT);
  writeFileSync(sfPath, collected);

  // --- validate ---
  const rfValid = pdfinfoClean(rfPath);
  const sfValid = pdfinfoClean(sfPath);
  const rfPages = pdfinfoPages(rfPath);

  return {
    name: s.name,
    renderFlowBytes: rfBytes.byteLength,
    streamFlowBytes: collected.byteLength,
    delta: collected.byteLength - rfBytes.byteLength,
    rfPages,
    sfPages,
    rfValid,
    sfValid
  };
}

function pdfinfoClean(p: URL): boolean {
  try {
    const out = execSync(`pdfinfo ${p.pathname} 2>&1`, { encoding: "utf8" });
    return !/Syntax Error|Error \(/i.test(out);
  } catch {
    return false;
  }
}

function pdfinfoPages(p: URL): number {
  try {
    const out = execSync(`pdfinfo ${p.pathname} 2>&1`, { encoding: "utf8" });
    const m = out.match(/Pages:\s+(\d+)/);
    return m ? parseInt(m[1]!, 10) : -1;
  } catch {
    return -1;
  }
}

async function main() {
  const results: Result[] = [];
  for (const s of scenarios) {
    process.stdout.write(`Running ${s.name}... `);
    try {
      const r = await runScenario(s);
      results.push(r);
      process.stdout.write("done\n");
    } catch (e) {
      process.stdout.write(`FAILED: ${(e as Error).message}\n`);
    }
  }

  console.log("\n" + "=".repeat(96));
  console.log(
    "scenario                  pages  renderFlow   streamFlow      delta    %    rfOK   sfOK"
  );
  console.log("-".repeat(96));
  for (const r of results) {
    const pct = ((r.delta / r.renderFlowBytes) * 100).toFixed(1);
    const pagesStr = `${r.rfPages}/${r.sfPages}`.padStart(6);
    console.log(
      `${r.name.padEnd(26)} ${pagesStr}  ` +
        `${String(r.renderFlowBytes).padStart(9)} B  ` +
        `${String(r.streamFlowBytes).padStart(9)} B  ` +
        `${String(r.delta).padStart(7)} B  ` +
        `${pct.padStart(5)}%  ` +
        `${r.rfValid ? "  ✓ " : "  ✗ "}  ${r.sfValid ? "  ✓ " : "  ✗ "}`
    );
  }
  console.log("=".repeat(96));
  console.log(`\nOutput files in ${OUT.pathname}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
