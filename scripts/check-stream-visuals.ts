import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  PageSizes,
  hline,
  hstack,
  pageInner,
  renderFlow,
  streamFlow,
  text,
  type Node,
  type StreamFlowOptions
} from "../src/index.js";

interface Scenario {
  name: string;
  build(): Promise<{ pdf: PDFDocument; nodes: Node[]; options: StreamFlowOptions }>;
}

const scenarios: Scenario[] = [
  {
    name: "multi-page-flow",
    async build() {
      const pdf = await PDFDocument.create({ updateMetadata: false });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const width = pageInner(PageSizes.Letter, 36);
      const nodes: Node[] = [];
      for (let section = 1; section <= 8; section += 1) {
        nodes.push(text(`Section ${section}`, { font: bold, size: 16, width }));
        nodes.push(hline({ margin: { top: 3, bottom: 7 }, color: { r: 0.7, g: 0.7, b: 0.7 } }));
        for (let line = 1; line <= 24; line += 1) {
          nodes.push(
            text(`Line ${line} in section ${section}. Streaming and buffered rendering must place this identically.`, {
              font,
              size: 10,
              width,
              margin: { top: 1, bottom: 1 }
            })
          );
        }
      }
      return { pdf, nodes, options: { size: PageSizes.Letter, margin: 36 } };
    }
  },
  {
    name: "header-footer",
    async build() {
      const pdf = await PDFDocument.create({ updateMetadata: false });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const width = pageInner(PageSizes.A4, 42);
      const nodes = Array.from({ length: 120 }, (_, index) =>
        hstack(
          { width, gap: 12, margin: { top: 2, bottom: 2 } },
          text(`#${String(index + 1).padStart(3, "0")}`, { font: bold, size: 10, width: 45 }),
          text("A row with enough text to exercise width measurement and baseline placement.", {
            font,
            size: 10,
            shrink: 1
          })
        )
      );
      const options: StreamFlowOptions = {
        size: PageSizes.A4,
        margin: 42,
        header: ({ pageNumber }) => text(`Visual parity report · ${pageNumber}`, { font: bold, size: 9, width }),
        footer: ({ pageNumber }) => text(`Page ${pageNumber}`, { font, size: 8, width, align: "right" })
      };
      return { pdf, nodes, options };
    }
  }
];

async function main(): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "boxpdf-stream-visual-"));
  try {
    for (const scenario of scenarios) {
      const scenarioDir = join(root, scenario.name);
      mkdirSync(scenarioDir, { recursive: true });

      const buffered = await scenario.build();
      await renderFlow(buffered.pdf, buffered.nodes, buffered.options);
      const bufferedPdf = join(scenarioDir, "render-flow.pdf");
      writeFileSync(bufferedPdf, await buffered.pdf.save());

      const streamed = await scenario.build();
      const chunks: Uint8Array[] = [];
      const writable = new WritableStream<Uint8Array>({
        write(chunk) {
          chunks.push(chunk);
        }
      });
      await streamFlow(streamed.pdf, writable, streamed.nodes, streamed.options);
      const streamedPdf = join(scenarioDir, "stream-flow.pdf");
      writeFileSync(streamedPdf, concat(chunks));

      const bufferedPages = rasterize(bufferedPdf, join(scenarioDir, "render"));
      const streamedPages = rasterize(streamedPdf, join(scenarioDir, "stream"));
      if (bufferedPages.length !== streamedPages.length) {
        throw new Error(
          `${scenario.name}: page count differs (${bufferedPages.length} buffered, ${streamedPages.length} streamed)`
        );
      }
      for (let index = 0; index < bufferedPages.length; index += 1) {
        const expected = readFileSync(bufferedPages[index]!);
        const actual = readFileSync(streamedPages[index]!);
        if (!expected.equals(actual)) {
          throw new Error(`${scenario.name}: page ${index + 1} differs`);
        }
      }
      console.log(`${scenario.name}: ${bufferedPages.length} page(s) match`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function rasterize(pdf: string, prefix: string): string[] {
  execFileSync("pdftoppm", ["-png", "-r", "144", pdf, prefix], { stdio: "pipe" });
  const directory = join(prefix, "..");
  const stem = prefix.slice(prefix.lastIndexOf("/") + 1);
  return readdirSync(directory)
    .filter((name) => name.startsWith(`${stem}-`) && name.endsWith(".png"))
    .sort((left, right) => pageNumber(left) - pageNumber(right))
    .map((name) => join(directory, name));
}

function pageNumber(name: string): number {
  const match = name.match(/-(\d+)\.png$/);
  if (!match) throw new Error(`unexpected raster filename: ${name}`);
  return Number(match[1]);
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
