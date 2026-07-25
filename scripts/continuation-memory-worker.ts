/**
 * Isolated worker for the continuation memory check. It constructs each
 * fragment only when the async iterable is advanced and reports peak heap.
 */
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  PageSizes,
  flowContinuation,
  pageInner,
  streamFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

const fragmentCount = Number(process.argv[2]);
if (!Number.isInteger(fragmentCount) || fragmentCount <= 0) {
  throw new Error("usage: continuation-memory-worker.ts <positive-fragment-count>");
}

const pdf = await PDFDocument.create({ updateMetadata: false });
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
global.gc?.();

const baselineHeap = process.memoryUsage().heapUsed;
let peakHeap = baselineHeap;
let outputBytes = 0;
const sample = (): void => {
  peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);
};
const timer = setInterval(sample, 1);
const startedAt = performance.now();

try {
  const result = await streamFlow(
    pdf,
    new WritableStream<Uint8Array>({
      write(chunk) {
        outputBytes += chunk.byteLength;
        sample();
      }
    }),
    fragments(fragmentCount, font, bold),
    { size: PageSizes.Letter, margin: 36 }
  );
  sample();
  global.gc?.();
  console.log(JSON.stringify({
    fragments: fragmentCount,
    pages: result.pageCount,
    baselineHeap,
    peakHeap,
    retainedHeap: process.memoryUsage().heapUsed,
    outputBytes,
    millis: Math.round(performance.now() - startedAt)
  }));
} finally {
  clearInterval(timer);
}

/** Generate one page-scale continuation fragment at a time. */
async function* fragments(
  count: number,
  bodyFont: PDFFont,
  headingFont: PDFFont
): AsyncIterable<Node> {
  const width = pageInner(PageSizes.Letter, 36);
  for (let fragment = 0; fragment < count; fragment += 1) {
    const children: Node[] = [
      text(`Section ${fragment + 1}`, { size: 16, font: headingFont, width })
    ];
    for (let line = 0; line < 50; line += 1) {
      children.push(
        text(
          `Line ${line.toString().padStart(2, "0")}: bounded continuation content for section ${fragment + 1}.`,
          { size: 10, font: bodyFont, width, margin: { top: 1, bottom: 1 } }
        )
      );
    }
    yield flowContinuation(
      vstack({}, ...children),
      "memory-benchmark",
      fragment === count - 1
    );
  }
}
