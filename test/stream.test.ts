import { describe, expect, it, beforeAll, vi } from "vitest";
import { PassThrough } from "node:stream";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  PageSizes,
  flowContinuation,
  hline,
  hstack,
  hex,
  link,
  nodeAdapter,
  pageInner,
  streamFlow,
  table,
  text,
  vstack,
  type Node
} from "../src/index.js";

let font: PDFFont;
let bold: PDFFont;

beforeAll(async () => {
  const tmp = await PDFDocument.create({ updateMetadata: false });
  font = await tmp.embedFont(StandardFonts.Helvetica);
  bold = await tmp.embedFont(StandardFonts.HelveticaBold);
});

function collector() {
  const chunks: Uint8Array[] = [];
  const writable = new WritableStream<Uint8Array>({
    write(c) {
      chunks.push(c);
    }
  });
  function bytes(): Uint8Array {
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
  return { writable, bytes };
}

async function newDocWithFonts(): Promise<{
  pdf: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
}> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const f = await pdf.embedFont(StandardFonts.Helvetica);
  const b = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { pdf, font: f, bold: b };
}

describe("streamFlow basics", () => {
  it("produces a valid PDF byte stream starting with %PDF- and ending with %%EOF", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(
      pdf,
      writable,
      [text("hello stream", { size: 14, font })],
      { size: PageSizes.Letter, margin: 36 }
    );
    expect(pageCount).toBe(1);
    const out = bytes();
    const head = new TextDecoder().decode(out.slice(0, 8));
    expect(head).toBe("%PDF-1.7");
    const tail = new TextDecoder().decode(out.slice(out.length - 6));
    expect(tail).toBe("%%EOF\n");
    // Reload via pdf-lib to confirm structural validity.
    const reloaded = await PDFDocument.load(out);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it("handles 0 nodes by emitting a valid 0-page document", async () => {
    const { pdf } = await newDocWithFonts();
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, [], {
      size: PageSizes.Letter,
      margin: 36
    });
    expect(pageCount).toBe(0);
    const out = bytes();
    const reloaded = await PDFDocument.load(out);
    expect(reloaded.getPageCount()).toBe(0);
  });

  it("paginates across multiple pages when content overflows", async () => {
    const { pdf, font } = await newDocWithFonts();
    const INNER = pageInner(PageSizes.Letter, 36);
    const nodes: Node[] = [];
    for (let i = 0; i < 200; i++) {
      nodes.push(text(`Line ${i}`, { size: 10, font, width: INNER }));
    }
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, nodes, {
      size: PageSizes.Letter,
      margin: 36
    });
    expect(pageCount).toBeGreaterThan(1);
    const reloaded = await PDFDocument.load(bytes());
    expect(reloaded.getPageCount()).toBe(pageCount);
  });

  it("accepts async iterables", async () => {
    const { pdf, font } = await newDocWithFonts();
    async function* gen(): AsyncIterable<Node> {
      for (let i = 0; i < 3; i++) {
        yield text(`Async ${i}`, { size: 12, font });
      }
    }
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, gen(), {
      size: PageSizes.Letter,
      margin: 36
    });
    expect(pageCount).toBe(1);
    expect(bytes().byteLength).toBeGreaterThan(500);
  });

  it("fragments a top-level vstack between children", async () => {
    const { pdf, font } = await newDocWithFonts();
    const blocks = Array.from({ length: 6 }, (_, index) =>
      vstack(
        { height: 54, padding: 6, border: { color: hex("#dddddd"), width: 1 } },
        text(`Fragment ${index + 1}`, { size: 10, font })
      )
    );
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, [vstack({ gap: 4 }, ...blocks)], {
      size: { width: 240, height: 220 },
      margin: 20
    });

    expect(pageCount).toBeGreaterThan(1);
    expect((await PDFDocument.load(bytes())).getPageCount()).toBe(pageCount);
  });

  it("fragments tables between rows", async () => {
    const { pdf, font, bold } = await newDocWithFonts();
    const node = table({
      width: 180,
      columns: [{ width: "1fr" }, { width: 50 }],
      header: [
        text("Item", { size: 10, font: bold }),
        text("Qty", { size: 10, font: bold })
      ],
      rows: Array.from({ length: 10 }, (_, index) => [
        vstack(
          { padding: { top: 5, bottom: 5 } },
          text(`Row ${index + 1}`, { size: 10, font })
        ),
        text(String(index + 1), { size: 10, font })
      ]),
      rowDivider: { color: hex("#dddddd"), thickness: 1 },
      headerDivider: { color: hex("#111111"), thickness: 1 },
      columnGap: 0
    });
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, [node], {
      size: { width: 240, height: 220 },
      margin: 20
    });

    expect(pageCount).toBeGreaterThan(1);
    expect((await PDFDocument.load(bytes())).getPageCount()).toBe(pageCount);
  });

  it("merges bounded continuation fragments before pagination", async () => {
    const { pdf, font } = await newDocWithFonts();
    const fragments = Array.from({ length: 12 }, (_, index) =>
      flowContinuation(
        vstack(
          { gap: 4, padding: 6, border: { width: 1, color: hex("#444444") } },
          vstack({ height: 42 }, text(`Fragment ${index + 1}`, { font, size: 10 }))
        ),
        "report",
        index === 11
      )
    );
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, fragments, {
      size: { width: 240, height: 220 },
      margin: 20
    });

    expect(pageCount).toBeGreaterThan(1);
    expect((await PDFDocument.load(bytes())).getPageCount()).toBe(pageCount);
  });

  it("rejects a continuation without a final fragment", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable } = collector();
    await expect(
      streamFlow(
        pdf,
        writable,
        [flowContinuation(vstack({}, text("unfinished", { font, size: 10 })), "unfinished")],
        { margin: 20 }
      )
    ).rejects.toThrow(/without a final fragment/);
  });

  it("merges table continuations while retaining row fragmentation", async () => {
    const { pdf, font, bold } = await newDocWithFonts();
    const makeChunk = (start: number, final: boolean) =>
      flowContinuation(
        table({
          width: 180,
          columns: [{ width: "1fr" }],
          header: [text("Header", { font: bold, size: 10 })],
          rows: Array.from({ length: 4 }, (_, index) => [
            vstack({ height: 28 }, text(`Row ${start + index}`, { font, size: 9 }))
          ])
        }),
        "table",
        final
      );
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(
      pdf,
      writable,
      [makeChunk(1, false), makeChunk(5, false), makeChunk(9, true)],
      { size: { width: 220, height: 180 }, margin: 20 }
    );

    expect(pageCount).toBeGreaterThan(1);
    expect((await PDFDocument.load(bytes())).getPageCount()).toBe(pageCount);
  });
});

describe("streamFlow headers and footers", () => {
  it("renders headers and footers on every page", async () => {
    const { pdf, font, bold } = await newDocWithFonts();
    const INNER = pageInner(PageSizes.Letter, 36);
    const nodes: Node[] = [];
    // 100 nodes of size-14 text (~10.5pt line height) ≈ 1050pt, overflows
    // the ~680pt content-area-minus-header/footer to force multiple pages.
    for (let i = 0; i < 100; i++) {
      nodes.push(text(`Body line ${i}`, { size: 14, font, width: INNER }));
    }
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(pdf, writable, nodes, {
      size: PageSizes.Letter,
      margin: 36,
      header: (ctx) => text(`Header — page ${ctx.pageNumber}`, { size: 9, font: bold }),
      footer: (ctx) => text(`Footer — page ${ctx.pageNumber}`, { size: 9, font })
    });
    expect(pageCount).toBeGreaterThan(1);
    const reloaded = await PDFDocument.load(bytes());
    expect(reloaded.getPageCount()).toBe(pageCount);
  });

  it("accessing ctx.totalPages from a header callback throws", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable } = collector();
    await expect(
      streamFlow(pdf, writable, [text("x", { size: 12, font })], {
        size: PageSizes.Letter,
        margin: 36,
        header: (ctx) => {
          const total = (ctx as unknown as { totalPages: number }).totalPages;
          return text(`Page ${ctx.pageNumber} of ${total}`, { size: 9, font });
        }
      })
    ).rejects.toThrow(/totalPages/);
  });
});

describe("streamFlow mid-stream embed detection", () => {
  it("throws when a font is embedded mid-stream (inside the async iterable)", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable } = collector();
    async function* gen(): AsyncIterable<Node> {
      yield text("first page", { size: 12, font });
      // Mid-stream embed — should be caught by detection.
      await pdf.embedFont(StandardFonts.Courier);
      yield text("second page", { size: 12, font });
    }
    await expect(
      streamFlow(pdf, writable, gen(), { size: PageSizes.Letter, margin: 36 })
    ).rejects.toThrow(/streamFlow|after streamFlow|mid-stream|Embed/i);
  });
});

describe("streamFlow output equivalence", () => {
  it("byte size stays within 15% of renderFlow + pdf.save() for the same content", async () => {
    const { renderFlow } = await import("../src/index.js");
    // Build twice, render each way.
    async function build(): Promise<{ pdf: PDFDocument; nodes: Node[] }> {
      const { pdf, font, bold } = await newDocWithFonts();
      const INNER = pageInner(PageSizes.Letter, 36);
      const nodes: Node[] = [];
      for (let i = 0; i < 10; i++) {
        nodes.push(text(`Section ${i}`, { size: 14, font: bold, width: INNER }));
        for (let l = 0; l < 30; l++) {
          nodes.push(text(`Line ${l} of section ${i}`, { size: 10, font, width: INNER }));
        }
      }
      return { pdf, nodes };
    }

    const { pdf: pdf1, nodes: nodes1 } = await build();
    await renderFlow(pdf1, nodes1, { size: PageSizes.Letter, margin: 36 });
    const rfBytes = await pdf1.save();

    const { pdf: pdf2, nodes: nodes2 } = await build();
    const { writable, bytes } = collector();
    await streamFlow(pdf2, writable, nodes2, { size: PageSizes.Letter, margin: 36 });
    const sfBytes = bytes();

    expect(sfBytes.byteLength).toBeGreaterThan(0);
    const ratio = sfBytes.byteLength / rfBytes.byteLength;
    expect(ratio).toBeGreaterThanOrEqual(0.95);
    expect(ratio).toBeLessThanOrEqual(1.15);
  });

  it("shared fonts are emitted exactly once across many pages", async () => {
    const { pdf, font, bold } = await newDocWithFonts();
    const INNER = pageInner(PageSizes.Letter, 36);
    const nodes: Node[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push(text(`Heading ${i}`, { size: 14, font: bold, width: INNER }));
      nodes.push(text(`Body ${i}`, { size: 10, font, width: INNER }));
    }
    const { writable, bytes } = collector();
    // Disable ObjStm packing so font dicts appear in the raw output and
    // we can grep for them; with packing, they're inside flate streams.
    await streamFlow(pdf, writable, nodes, {
      size: PageSizes.Letter,
      margin: 36,
      objectsPerStream: 1
    });
    const out = new TextDecoder("latin1").decode(bytes());
    // Negative lookahead (?!-) so /Helvetica doesn't also match /Helvetica-Bold.
    const helvCount = (out.match(/\/BaseFont \/Helvetica(?!-)/g) ?? []).length;
    const boldCount = (out.match(/\/BaseFont \/Helvetica-Bold\b/g) ?? []).length;
    expect(helvCount).toBe(1);
    expect(boldCount).toBe(1);
  });

  it("respects objectsPerStream = 1 (no ObjStm packing)", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable, bytes } = collector();
    await streamFlow(
      pdf,
      writable,
      [text("hi", { size: 12, font })],
      { size: PageSizes.Letter, margin: 36, objectsPerStream: 1 }
    );
    const out = new TextDecoder("latin1").decode(bytes());
    // With objectsPerStream=1, no /Type /ObjStm objects should appear.
    expect(out).not.toContain("/Type /ObjStm");
    // Still has /Type /XRef (we always use a cross-ref stream).
    expect(out).toContain("/Type /XRef");
  });
});

describe("nodeAdapter", () => {
  it("round-trips bytes through a Node Writable", async () => {
    const { pdf, font } = await newDocWithFonts();
    const sink = new PassThrough();
    const chunks: Buffer[] = [];
    sink.on("data", (c: Buffer) => chunks.push(c));
    const done = new Promise<void>((resolve) => sink.on("end", () => resolve()));

    await streamFlow(
      pdf,
      nodeAdapter(sink),
      [text("through node stream", { size: 14, font })],
      { size: PageSizes.Letter, margin: 36 }
    );
    await done;
    const combined = Buffer.concat(chunks);
    expect(combined.subarray(0, 8).toString()).toBe("%PDF-1.7");
    expect(combined.subarray(combined.length - 6).toString()).toBe("%%EOF\n");
    const reloaded = await PDFDocument.load(combined);
    expect(reloaded.getPageCount()).toBe(1);
  });
});

describe("streamFlow error handling", () => {
  it("aborts the writable when the iterable throws", async () => {
    const { pdf, font } = await newDocWithFonts();
    let aborted = false;
    const writable = new WritableStream<Uint8Array>({
      write() {},
      abort() {
        aborted = true;
      }
    });
    async function* gen(): AsyncIterable<Node> {
      yield text("first", { size: 12, font });
      throw new Error("intentional iterator failure");
    }
    await expect(
      streamFlow(pdf, writable, gen(), { size: PageSizes.Letter, margin: 36 })
    ).rejects.toThrow(/intentional iterator failure/);
    expect(aborted).toBe(true);
  });
});

describe("streamFlow encryption", () => {
  it("emits PDF 2.0 R6 output while preserving pagination", async () => {
    const { pdf, font } = await newDocWithFonts();
    const { writable, bytes } = collector();
    const { pageCount } = await streamFlow(
      pdf,
      writable,
      Array.from({ length: 100 }, (_, index) =>
        text(`encrypted stream line ${index}`, { size: 12, font })
      ),
      {
        size: PageSizes.Letter,
        margin: 36,
        title: "stream title marker 73192",
        encryption: {
          password: "stream-user",
          ownerPassword: "stream-owner",
          permissions: { copying: false }
        }
      }
    );
    expect(pageCount).toBeGreaterThan(1);
    const output = new TextDecoder("latin1").decode(bytes());
    expect(output.startsWith("%PDF-2.0")).toBe(true);
    expect(output).toContain("/R 6");
    expect(output).toContain("/CFM /AESV3");
    expect(output).toContain("/P -20");
    expect(output).not.toContain("stream title marker 73192");
    expect(pdf.context.trailerInfo.Encrypt).toBeUndefined();
  });

  it("aborts encrypted output and releases encryption state on failure", async () => {
    const { pdf, font } = await newDocWithFonts();
    let aborted = false;
    const writable = new WritableStream<Uint8Array>({
      write() {},
      abort() {
        aborted = true;
      }
    });
    async function* gen(): AsyncIterable<Node> {
      yield text("first", { size: 12, font });
      throw new Error("encrypted iterator failure");
    }
    await expect(
      streamFlow(pdf, writable, gen(), {
        encryption: { password: "stream-user" }
      })
    ).rejects.toThrow(/encrypted iterator failure/);
    expect(aborted).toBe(true);
    expect(pdf.context.trailerInfo.Encrypt).toBeUndefined();
  });

  it("releases encryption state when header setup throws", async () => {
    const { pdf } = await newDocWithFonts();
    await pdf.flush();
    const objectCount = pdf.context.enumerateIndirectObjects().length;
    const { writable } = collector();

    await expect(
      streamFlow(pdf, writable, [], {
        encryption: { password: "stream-user" },
        header() {
          throw new Error("header setup failure");
        }
      })
    ).rejects.toThrow(/header setup failure/);

    expect(pdf.context.trailerInfo.Encrypt).toBeUndefined();
    expect(pdf.context.trailerInfo.ID).toBeUndefined();
    expect(pdf.context.enumerateIndirectObjects()).toHaveLength(objectCount);
  });
});
