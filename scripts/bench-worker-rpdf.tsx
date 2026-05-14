/**
 * Worker for @react-pdf/renderer measurement. Same shape as
 * bench-worker.ts but builds a React tree and calls renderToBuffer.
 *
 * Standard Helvetica (no font embedding) to keep it apples-to-apples
 * with the pdf-lib path.
 */
import React from "react";
import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";

const pages = parseInt(process.argv[2] ?? "0", 10);
if (!pages) {
  console.error("usage: bench-worker-rpdf.tsx <pages>");
  process.exit(1);
}

function buildElement(pageCount: number) {
  const sections: React.ReactNode[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const lines: React.ReactNode[] = [];
    for (let l = 0; l < 50; l++) {
      lines.push(
        React.createElement(
          Text,
          { key: `l${l}`, style: { fontSize: 10, marginVertical: 1 } },
          `Line ${l.toString().padStart(2, "0")}: Lorem ipsum dolor sit amet, ` +
            `consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.`
        )
      );
    }
    sections.push(
      React.createElement(
        Page,
        { key: `p${i}`, size: "LETTER", style: { padding: 36 } },
        React.createElement(
          Text,
          { style: { fontSize: 16, fontWeight: "bold", marginBottom: 8 } },
          `Section ${i}`
        ),
        React.createElement(View, null, lines)
      )
    );
  }
  return React.createElement(Document, null, sections);
}

const doc = buildElement(pages);

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
  const buffer = await renderToBuffer(doc);
  outputBytes = buffer.byteLength;
} finally {
  clearInterval(sampler);
}

const millis = performance.now() - t0;

console.log(
  JSON.stringify({
    pages,
    mode: "react-pdf",
    baselineKB: Math.round(baseline.heapUsed / 1024),
    peakKB: Math.round(peakHeap / 1024),
    deltaKB: Math.round((peakHeap - baseline.heapUsed) / 1024),
    outputKB: Math.round(outputBytes / 1024),
    millis: Math.round(millis)
  })
);
