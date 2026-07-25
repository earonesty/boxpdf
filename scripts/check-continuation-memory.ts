/**
 * Verify that a 10x increase in lazily-produced continuation fragments stays
 * within a fixed 128 MiB V8 old-space limit without retaining the input.
 */
import { spawnSync } from "node:child_process";

interface MemoryResult {
  fragments: number;
  pages: number;
  baselineHeap: number;
  peakHeap: number;
  retainedHeap: number;
  outputBytes: number;
  millis: number;
}

const small = runWorker(100);
const large = runWorker(1000);
const peakGrowth = large.peakHeap - small.peakHeap;
const retainedGrowth = large.retainedHeap - small.retainedHeap;

if (large.pages < small.pages * 8) {
  throw new Error(`page count did not scale with input (${small.pages} to ${large.pages})`);
}
if (retainedGrowth > 16 * 1024 * 1024) {
  throw new Error(`retained heap grew by ${formatBytes(retainedGrowth)} for a 10x workload`);
}

console.log(
  `continuation memory: ${small.fragments} fragments/${small.pages} pages -> ` +
  `${large.fragments} fragments/${large.pages} pages, peak heap ` +
  `${formatBytes(small.peakHeap)} -> ${formatBytes(large.peakHeap)}, ` +
  `retained heap ${formatBytes(small.retainedHeap)} -> ${formatBytes(large.retainedHeap)}, ` +
  `peak growth ${formatBytes(peakGrowth)}, retained growth ${formatBytes(retainedGrowth)}`
);

/** Run one measurement in a fresh, heap-capped subprocess. */
function runWorker(fragments: number): MemoryResult {
  const child = spawnSync(
    process.execPath,
    [
      "--expose-gc",
      "--max-old-space-size=128",
      "--import",
      "tsx",
      "scripts/continuation-memory-worker.ts",
      String(fragments)
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 }
  );
  if (child.status !== 0) {
    throw new Error(`continuation memory worker failed: ${child.stderr || `exit ${child.status}`}`);
  }
  const line = child.stdout.trim().split("\n").at(-1);
  if (!line) throw new Error("continuation memory worker returned no result");
  return JSON.parse(line) as MemoryResult;
}

/** Format a byte count for stable human-readable benchmark output. */
function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
