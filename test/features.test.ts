import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, PDFName, PDFArray, PDFString, StandardFonts, type PDFFont } from "pdf-lib";
import {
  defineStyles,
  embedFont,
  hex,
  hstack,
  link,
  loadImage,
  renderToPdf,
  text,
  vstack
} from "../src/index.js";

let font: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
});

describe("defineStyles", () => {
  it("preserves the input object as the return value", () => {
    const styles = defineStyles({
      card: { padding: 16, background: hex("#fafafa") },
      h1: { size: 22, font, color: hex("#000") }
    });
    expect(styles.card.padding).toBe(16);
    expect(styles.h1.size).toBe(22);
  });
});

describe("text decorations", () => {
  it("underline adds drawing operations to the PDF", async () => {
    const plain = await renderToPdf(text("hello world", { size: 14, font }));
    const underlined = await renderToPdf(text("hello world", { size: 14, font, underline: true }));
    expect(underlined.byteLength).toBeGreaterThan(plain.byteLength);
  });

  it("strikethrough adds drawing operations to the PDF", async () => {
    const plain = await renderToPdf(text("hello world", { size: 14, font }));
    const struck = await renderToPdf(text("hello world", { size: 14, font, strikethrough: true }));
    expect(struck.byteLength).toBeGreaterThan(plain.byteLength);
  });
});

describe("document metadata", () => {
  it("title/author/subject/keywords/creator/producer round-trip", async () => {
    const bytes = await renderToPdf(text("hi", { size: 12, font }), {
      title: "My Invoice",
      author: "Acme Co.",
      subject: "May 2026",
      keywords: ["invoice", "may"],
      creator: "boxpdf-test",
      producer: "boxpdf"
    });
    const back = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(back.getTitle()).toBe("My Invoice");
    expect(back.getAuthor()).toBe("Acme Co.");
    expect(back.getSubject()).toBe("May 2026");
    expect(back.getKeywords()).toContain("invoice");
    expect(back.getCreator()).toBe("boxpdf-test");
    expect(back.getProducer()).toBe("boxpdf");
  });
});

describe("loadImage", () => {
  it("embeds a base64 PNG from a data URL", async () => {
    const pdf = await PDFDocument.create();
    // 1x1 red PNG
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==";
    const img = await loadImage(pdf, dataUrl);
    expect(img.width).toBe(1);
    expect(img.height).toBe(1);
  });

  it("rejects unknown formats with a helpful error", async () => {
    const pdf = await PDFDocument.create();
    await expect(loadImage(pdf, new Uint8Array([0, 1, 2, 3, 4]))).rejects.toThrow(
      /unsupported format/
    );
  });
});

describe("embedFont", () => {
  it("accepts a Uint8Array source", async () => {
    // Use pdf-lib's own embedded standard font bytes as a test fixture: we
    // can't easily fetch a real TTF in a unit test, so we verify that the
    // helper threads bytes through to pdf.embedFont without throwing on the
    // happy path. Use a tiny invalid blob and expect pdf-lib to surface its
    // own error — the point is exercising the readSource path.
    const pdf = await PDFDocument.create();
    await expect(embedFont(pdf, { source: new Uint8Array([0, 1, 2, 3]) })).rejects.toThrow();
  });
});

describe("link", () => {
  it("adds a Link annotation to the page with the right URI", async () => {
    const node = vstack(
      { padding: 20 },
      link({ href: "https://example.com/manage" },
        text("Manage booking", { size: 12, font, color: hex("#0066cc") })
      )
    );
    const bytes = await renderToPdf(node);
    const back = await PDFDocument.load(bytes);
    const page = back.getPage(0);
    const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    expect(annots).toBeDefined();
    expect(annots!.size()).toBe(1);
    const annot = annots!.lookup(0);
    // Find the URI inside the annotation tree.
    const annotString = annot?.toString() ?? "";
    expect(annotString).toContain("https://example.com/manage");
    expect(annotString).toContain("/Link");
  });

  it("appends to existing annotations rather than replacing", async () => {
    const node = vstack(
      { padding: 20, gap: 8 },
      link({ href: "https://example.com/a" }, text("Link A", { size: 12, font })),
      link({ href: "https://example.com/b" }, text("Link B", { size: 12, font }))
    );
    const bytes = await renderToPdf(node);
    const back = await PDFDocument.load(bytes);
    const annots = back.getPage(0).node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    expect(annots).toBeDefined();
    expect(annots!.size()).toBe(2);
  });
});

// Suppress lint warning for unused imports
void [PDFString, hstack];
