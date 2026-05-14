/**
 * Memory bench: peak heap during renderFlow vs streamFlow across a range
 * of page counts. Each scenario runs in isolation with a forced GC
 * baseline. Sampling at 5ms intervals catches peaks during pdf-lib's
 * `objectsPerTick` yields and during stream flushes.
 *
 * Run with:  pnpm exec tsx --expose-gc scripts/bench-memory.ts
 * (the --expose-gc flag is needed for accurate baselines)
 */
import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  PageSizes,
  renderFlow,
  streamFlow,
  text,
  pageInner,
  type Node
} from "../src/index.js";

const PAGE_COUNTS = [10, 50, 100, 250, 500, 1000];

async function buildDoc(pageCount: number): Promise<{ pdf: PDFDocument; nodes: Node[] }> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const INNER = pageInner(PageSizes.Letter, 36);
  const nodes: Node[] = [];
  for (let i = 1; i <= pageCount; i++) {
    nodes.push(text(`Section ${i}`, { size: 16, font: bold, width: INNER }));
    // 50 lines per "section". Mix of short/medium/long to vary content stream size.
    for (let line = 0; line < 50; line++) {
      nodes.push(
        text(
          `Line ${line.toString().padStart(2, "0")}: Lorem ipsum dolor sit amet, ` +
            `consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.`,
          { size: 10, font, width: INNER, margin: { top: 1, bottom: 1 } }
        )
      );
    }
  }
  return { pdf, nodes };
}

interface BenchResult {
  pages: number;
  mode: "renderFlow" | "streamFlow";
  baselineKB: number;
  peakKB: number;
  deltaKB: number;
  rssBaseKB: number;
  rssPeakKB: number;
  outputKB: number;
  millis: number;
}

async function measure(
  pages: number,
  mode: "renderFlow" | "streamFlow"
): Promise<BenchResult> {
  const { pdf, nodes } = await buildDoc(pages);

  if (global.gc) global.gc();
  const baselineMem = process.memoryUsage();
  let peakHeap = baselineMem.heapUsed;
  let peakRss = baselineMem.rss;
  const sampler = setInterval(() => {
    const u = process.memoryUsage();
    if (u.heapUsed > peakHeap) peakHeap = u.heapUsed;
    if (u.rss > peakRss) peakRss = u.rss;
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

  return {
    pages,
    mode,
    baselineKB: Math.round(baselineMem.heapUsed / 1024),
    peakKB: Math.round(peakHeap / 1024),
    deltaKB: Math.round((peakHeap - baselineMem.heapUsed) / 1024),
    rssBaseKB: Math.round(baselineMem.rss / 1024),
    rssPeakKB: Math.round(peakRss / 1024),
    outputKB: Math.round(outputBytes / 1024),
    millis: Math.round(millis)
  };
}

async function main() {
  const results: BenchResult[] = [];

  for (const pages of PAGE_COUNTS) {
    for (const mode of ["renderFlow", "streamFlow"] as const) {
      process.stdout.write(`  ${mode.padEnd(11)} × ${String(pages).padStart(4)} pages... `);
      const r = await measure(pages, mode);
      results.push(r);
      const mb = (kb: number): string => (kb / 1024).toFixed(1).padStart(6) + " MB";
      process.stdout.write(
        `peak=${mb(r.peakKB)}  Δheap=${mb(r.deltaKB)}  out=${String(r.outputKB).padStart(6)} KB  ${r.millis}ms\n`
      );
    }
  }

  const mb = (kb: number): string => (kb / 1024).toFixed(1);
  console.log("\n" + "=".repeat(82));
  console.log("Pages    renderFlow peak    streamFlow peak    ratio    output    savings");
  console.log("-".repeat(82));
  for (const pages of PAGE_COUNTS) {
    const rf = results.find((r) => r.pages === pages && r.mode === "renderFlow")!;
    const sf = results.find((r) => r.pages === pages && r.mode === "streamFlow")!;
    const ratio = (rf.peakKB / Math.max(sf.peakKB, 1)).toFixed(1);
    const saved = rf.peakKB - sf.peakKB;
    console.log(
      `${String(pages).padStart(5)}    ${mb(rf.peakKB).padStart(6)} MB         ${mb(sf.peakKB).padStart(6)} MB     ${ratio.padStart(4)}×    ${String(rf.outputKB).padStart(6)} KB    -${mb(saved).padStart(5)} MB`
    );
  }
  console.log("=".repeat(82));

  writeFileSync(
    new URL("../out/bench-memory.json", import.meta.url),
    JSON.stringify(results, null, 2)
  );
  writeFileSync(
    new URL("../docs/design/peak-heap.svg", import.meta.url),
    renderChart(results)
  );
  console.log("\nResults  → out/bench-memory.json");
  console.log("Chart    → docs/design/peak-heap.svg");
}

function renderChart(results: BenchResult[]): string {
  const rf = results.filter((r) => r.mode === "renderFlow");
  const sf = results.filter((r) => r.mode === "streamFlow");
  // Plot ABSOLUTE peak heap (not Δ above baseline) so the
  // "streamFlow @ 0 MB" doesn't look like a measurement error —
  // streamFlow really does stay near baseline, but the absolute value
  // tells the honest story.
  const maxKB = Math.max(...rf.map((r) => r.peakKB), ...sf.map((r) => r.peakKB), 1);

  const W = 700;
  const H = 400;
  const padL = 70;
  const padR = 30;
  const padT = 40;
  const padB = 60;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xs = rf.map((r) => r.pages);
  const xMax = Math.max(...xs);
  const xAt = (pages: number): number => padL + (pages / xMax) * plotW;
  const yAt = (kb: number): number => padT + plotH - (kb / maxKB) * plotH;

  const niceKBLabels = [0, maxKB / 4, maxKB / 2, (3 * maxKB) / 4, maxKB].map((kb) =>
    Math.round(kb / 1024)
  );

  const polyline = (pts: BenchResult[], color: string): string => {
    const ds = pts.map((p) => `${xAt(p.pages)},${yAt(p.peakKB)}`).join(" ");
    return `<polyline points="${ds}" fill="none" stroke="${color}" stroke-width="2.5" />`;
  };

  const dots = (pts: BenchResult[], color: string): string =>
    pts
      .map(
        (p) =>
          `<circle cx="${xAt(p.pages)}" cy="${yAt(p.peakKB)}" r="4" fill="${color}" />`
      )
      .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, sans-serif">
  <title>Peak heap during render — renderFlow vs streamFlow</title>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fafafa"/>
  <text x="${W / 2}" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#111">Peak heap during render (absolute)</text>
  <text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#666">Document pages (50 lines of text each)</text>
  <text x="22" y="${padT + plotH / 2}" text-anchor="middle" font-size="11" fill="#666" transform="rotate(-90 22 ${padT + plotH / 2})">Peak heap used (MB)</text>

  <!-- y-axis grid + labels -->
  ${niceKBLabels
    .map((mb, i) => {
      const y = padT + plotH - (i / 4) * plotH;
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e5e5e5" stroke-width="1"/>
  <text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#555">${mb} MB</text>`;
    })
    .join("\n  ")}

  <!-- x-axis labels -->
  ${xs
    .map((pages) => {
      const x = xAt(pages);
      return `<line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 4}" stroke="#666"/>
  <text x="${x}" y="${padT + plotH + 18}" text-anchor="middle" font-size="10" fill="#555">${pages}</text>`;
    })
    .join("\n  ")}

  <!-- axes -->
  <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="#333" stroke-width="1"/>
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#333" stroke-width="1"/>

  <!-- lines -->
  ${polyline(rf, "#c1272d")}
  ${dots(rf, "#c1272d")}
  ${polyline(sf, "#1f7a4d")}
  ${dots(sf, "#1f7a4d")}

  <!-- legend -->
  <g transform="translate(${padL + 20}, ${padT + 10})">
    <rect x="0" y="0" width="160" height="48" fill="white" stroke="#ccc" rx="4"/>
    <circle cx="14" cy="16" r="5" fill="#c1272d"/>
    <text x="26" y="20" font-size="11" fill="#333">renderFlow</text>
    <circle cx="14" cy="36" r="5" fill="#1f7a4d"/>
    <text x="26" y="40" font-size="11" fill="#333">streamFlow</text>
  </g>
</svg>
`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
