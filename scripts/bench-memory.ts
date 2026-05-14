/**
 * Memory bench. Each measurement runs in its own subprocess so V8 heap
 * state from one test cannot bleed into another. The worker script
 * (bench-worker.ts) does the actual rendering and reports peak heap
 * as a JSON line; this parent process orchestrates and collates.
 *
 * Both modes start from a pre-built Node[] inside the worker, so the
 * input cost is in baseline for both. What's measured is what each
 * rendering layer ADDS on top of holding the input.
 *
 * Run with:  node --import tsx scripts/bench-memory.ts
 */
import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

const PAGE_COUNTS = [10, 50, 100, 250, 500, 1000];

interface BenchResult {
  pages: number;
  mode: "renderFlow" | "streamFlow";
  baselineKB: number;
  peakKB: number;
  deltaKB: number;
  outputKB: number;
  millis: number;
}

function runWorker(mode: "renderFlow" | "streamFlow", pages: number): Promise<BenchResult> {
  return new Promise((resolve, reject) => {
    const worker = spawn(
      "node",
      ["--expose-gc", "--import", "tsx", "scripts/bench-worker.ts", mode, String(pages)],
      { stdio: ["ignore", "pipe", "inherit"] }
    );
    let stdout = "";
    worker.stdout.on("data", (c) => (stdout += c.toString()));
    worker.on("close", (code) => {
      if (code !== 0) return reject(new Error(`worker exited ${code}`));
      const line = stdout.trim().split("\n").filter((l) => l.startsWith("{")).pop();
      if (!line) return reject(new Error(`no JSON output from worker (got: ${stdout})`));
      try {
        resolve(JSON.parse(line) as BenchResult);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function main() {
  const results: BenchResult[] = [];

  for (const pages of PAGE_COUNTS) {
    for (const mode of ["renderFlow", "streamFlow"] as const) {
      process.stdout.write(`  ${mode.padEnd(11)} × ${String(pages).padStart(4)} pages... `);
      const r = await runWorker(mode, pages);
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
  <title>Peak heap during render</title>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fafafa"/>
  <text x="${W / 2}" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#111">Peak heap during render (per-test subprocess)</text>
  <text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#666">Document pages (50 lines of text each)</text>
  <text x="22" y="${padT + plotH / 2}" text-anchor="middle" font-size="11" fill="#666" transform="rotate(-90 22 ${padT + plotH / 2})">Peak heap used (MB)</text>

  ${niceKBLabels
    .map((mb, i) => {
      const y = padT + plotH - (i / 4) * plotH;
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e5e5e5" stroke-width="1"/>
  <text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#555">${mb} MB</text>`;
    })
    .join("\n  ")}

  ${xs
    .map((pages) => {
      const x = xAt(pages);
      return `<line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 4}" stroke="#666"/>
  <text x="${x}" y="${padT + plotH + 18}" text-anchor="middle" font-size="10" fill="#555">${pages}</text>`;
    })
    .join("\n  ")}

  <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="#333" stroke-width="1"/>
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#333" stroke-width="1"/>

  ${polyline(rf, "#c1272d")}
  ${dots(rf, "#c1272d")}
  ${polyline(sf, "#1f7a4d")}
  ${dots(sf, "#1f7a4d")}

  <g transform="translate(${padL + 20}, ${padT + 10})">
    <rect x="0" y="0" width="170" height="48" fill="white" stroke="#ccc" rx="4"/>
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
