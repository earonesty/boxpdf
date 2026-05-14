/**
 * One-shot worker: takes mode + page count via argv, runs the
 * measurement once in this isolated process, prints a single JSON
 * line. Spawned by scripts/bench-memory.ts.
 */
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  PageSizes,
  renderFlow,
  streamFlow,
  text,
  pageInner,
  type Node
} from "../src/index.js";

const mode = process.argv[2] as "renderFlow" | "streamFlow";
const pages = parseInt(process.argv[3] ?? "0", 10);

if (!mode || !pages) {
  console.error("usage: bench-worker.ts <renderFlow|streamFlow> <pages>");
  process.exit(1);
}

function buildNodes(pageCount: number, font: PDFFont, bold: PDFFont): Node[] {
  const INNER = pageInner(PageSizes.Letter, 36);
  const out: Node[] = [];
  for (let i = 1; i <= pageCount; i++) {
    out.push(text(`Section ${i}`, { size: 16, font: bold, width: INNER }));
    for (let line = 0; line < 50; line++) {
      out.push(
        text(
          `Line ${line.toString().padStart(2, "0")}: Lorem ipsum dolor sit amet, ` +
            `consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.`,
          { size: 10, font, width: INNER, margin: { top: 1, bottom: 1 } }
        )
      );
    }
  }
  return out;
}

const pdf = await PDFDocument.create({ updateMetadata: false });
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const nodes = buildNodes(pages, font, bold);

if (global.gc) global.gc();
const baseline = process.memoryUsage();
let peakHeap = baseline.heapUsed;
const sampler = setInterval(() => {
  const u = process.memoryUsage();
  if (u.heapUsed > peakHeap) peakHeap = u.heapUsed;
}, 1);

const t0 = performance.now();
let outputBytes = 0;

try {
  if (mode === "renderFlow") {
    await renderFlow(pdf, nodes, { size: PageSizes.Letter, margin: 36 });
    const out = await pdf.save();
    outputBytes = out.byteLength;
  } else {
    const sink = new WritableStream<Uint8Array>({
      write(chunk) {
        outputBytes += chunk.length;
      }
    });
    await streamFlow(pdf, sink, nodes, { size: PageSizes.Letter, margin: 36 });
  }
} finally {
  clearInterval(sampler);
}

const millis = performance.now() - t0;

console.log(
  JSON.stringify({
    pages,
    mode,
    baselineKB: Math.round(baseline.heapUsed / 1024),
    peakKB: Math.round(peakHeap / 1024),
    deltaKB: Math.round((peakHeap - baseline.heapUsed) / 1024),
    outputKB: Math.round(outputBytes / 1024),
    millis: Math.round(millis)
  })
);
