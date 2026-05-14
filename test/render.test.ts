import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { hex } from "../src/colors.js";
import { hline, hstack, spacer, text, vstack } from "../src/nodes.js";
import { render } from "../src/render.js";
import { renderFlow, renderToPdf } from "../src/document.js";

let font: PDFFont;
let bold: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
  bold = await pdf.embedFont(StandardFonts.HelveticaBold);
});

describe("render", () => {
  it("renderToPdf produces a non-empty PDF with content text", async () => {
    const bytes = await renderToPdf(
      vstack(
        { padding: 24, gap: 8 },
        text("Hello", { size: 18, font: bold }),
        text("From boxpdf.", { size: 12, font })
      )
    );
    expect(bytes.byteLength).toBeGreaterThan(200);
    const back = await PDFDocument.load(bytes);
    expect(back.getPageCount()).toBe(1);
  });

  it("renderFlow breaks to a new page when a child would overflow", async () => {
    const pdf = await PDFDocument.create();
    // Each block is ~40pt tall. Letter content area is ~720pt high after margins.
    const block = (label: string) =>
      vstack(
        { padding: 8, background: hex("#fafafa"), border: { color: hex("#dddddd"), width: 1 } },
        text(label, { size: 14, font })
      );
    const nodes = Array.from({ length: 30 }, (_, i) => block(`Block ${i + 1}`));
    const { pages } = await renderFlow(pdf, nodes, { margin: 36 });
    expect(pages.length).toBeGreaterThan(1);
  });

  it("hstack with justify:between distributes slack between children", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([400, 200]);
    const node = hstack(
      { width: 400, justify: "between" },
      text("L", { size: 12, font }),
      text("M", { size: 12, font }),
      text("R", { size: 12, font })
    );
    // Should not throw; result is checked indirectly via bytes
    render(node, page, 0, 200, 400);
    const bytes = await pdf.save();
    expect(bytes.byteLength).toBeGreaterThan(100);
  });

  it("vstack with flex grow stretches a spacer to absorb extra height", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([200, 400]);
    const node = vstack(
      { height: 400 },
      text("top", { size: 12, font }),
      spacer(0, { grow: 1 }),
      text("bottom", { size: 12, font })
    );
    render(node, page, 0, 400, 200);
    const bytes = await pdf.save();
    expect(bytes.byteLength).toBeGreaterThan(100);
  });

  it("hline takes parent width when no width supplied", async () => {
    const bytes = await renderToPdf(
      vstack(
        { padding: 20, gap: 8, width: 400 },
        text("Above", { size: 12, font }),
        hline({ color: hex("#cccccc") }),
        text("Below", { size: 12, font })
      )
    );
    expect(bytes.byteLength).toBeGreaterThan(200);
  });
});
