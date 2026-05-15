import { describe, expect, it, beforeAll, vi } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { hex } from "../src/colors.js";
import { hline, hstack, keepTogether, spacer, text, vstack } from "../src/nodes.js";
import { render } from "../src/render.js";
import { renderFlow, renderToPdf } from "../src/document.js";
import { measure } from "../src/measure.js";
import { fontAscent } from "../src/text.js";

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

  it("borderRadius emits an SVG path stroke instead of throwing", async () => {
    const bytes = await renderToPdf(
      vstack(
        {
          padding: 16,
          background: hex("#fff7e0"),
          border: { color: hex("#d29922"), width: 1 },
          borderRadius: 12,
          width: 300
        },
        text("Rounded", { size: 14, font })
      )
    );
    expect(bytes.byteLength).toBeGreaterThan(200);
  });

  it("debug option produces a larger PDF than non-debug for the same layout", async () => {
    const tree = vstack(
      { padding: 16, gap: 8, width: 300 },
      text("Line one", { size: 12, font }),
      hstack({ gap: 6 }, text("L", { size: 10, font }), text("R", { size: 10, font }))
    );
    const plain = await renderToPdf(tree);
    const debugged = await renderToPdf(tree, { debug: true });
    expect(debugged.byteLength).toBeGreaterThan(plain.byteLength);
  });

  it("header callback runs on every page with correct pageNumber and totalPages", async () => {
    const pdf = await PDFDocument.create();
    const calls: Array<{ pageNumber: number; totalPages: number }> = [];
    const block = (label: string) =>
      vstack(
        { padding: 8, border: { color: hex("#dddddd"), width: 1 } },
        text(label, { size: 14, font })
      );
    const nodes = Array.from({ length: 30 }, (_, i) => block(`Block ${i + 1}`));
    const { pages } = await renderFlow(pdf, nodes, {
      margin: 36,
      header: (ctx) => {
        calls.push(ctx);
        return text(`Page ${ctx.pageNumber} of ${ctx.totalPages}`, { size: 9, font });
      }
    });
    expect(pages.length).toBeGreaterThan(1);
    expect(calls.length).toBeGreaterThanOrEqual(pages.length);
    // The final pass should have totalPages === pages.length on every call.
    const renderingCalls = calls.slice(-pages.length);
    for (const call of renderingCalls) {
      expect(call.totalPages).toBe(pages.length);
    }
    expect(renderingCalls.map((c) => c.pageNumber)).toEqual(
      pages.map((_, i) => i + 1)
    );
  });

  it("footer reserves space so content doesn't overlap it", async () => {
    const pdf = await PDFDocument.create();
    const tall = vstack(
      { height: 700, padding: 12, background: hex("#fafafa") },
      text("Tall block that nearly fills the page", { size: 12, font })
    );
    const { pages } = await renderFlow(pdf, [tall, tall], {
      margin: 36,
      footer: () => text("(footer)", { size: 9, font })
    });
    // First tall fits; second is pushed to page 2 because footer reserves space.
    expect(pages.length).toBe(2);
  });

  it("keepTogether pages atomically", async () => {
    const pdf = await PDFDocument.create();
    const row = text("a row", { size: 12, font });
    // Filler nearly fills an A4 content area (770pt) so the 3-row group can't fit.
    const filler = vstack({ height: 750 }, text("filler", { size: 12, font }));
    const group = keepTogether({ gap: 4 }, row, row, row);
    const { pages } = await renderFlow(pdf, [filler, group], { margin: 36 });
    // Group should land on page 2 intact, not split across pages.
    expect(pages.length).toBe(2);
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

  it("absolute stack children are ignored by parent measurement", () => {
    const flow = text("Flow", { size: 12, font });
    const node = vstack(
      { gap: 10 },
      flow,
      hstack(
        { position: "absolute", width: 300, height: 40 },
        text("Absolute", { size: 12, font })
      )
    );
    expect(measure(node, 500)).toEqual(measure(flow, 500));
  });

  it("positions an absolute child with top and right against a relative parent", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([300, 200]);
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { position: "relative", width: 200, height: 100 },
      text("Flow", { size: 12, font }),
      hstack(
        { position: "absolute", top: 12, right: 20, width: 50 },
        text("ABS", { size: 12, font })
      )
    );

    render(node, page, 10, 190, 200);

    const absCall = drawText.mock.calls.find((call) => call[0] === "ABS");
    expect(absCall).toBeDefined();
    expect(absCall![1]?.x).toBeCloseTo(140, 5);
    expect(absCall![1]?.y).toBeCloseTo(178 - fontAscent(font, 12), 5);
  });

  it("uses the nearest relative ancestor as the absolute containing block", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([400, 240]);
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { position: "relative", width: 300, height: 160, padding: 10 },
      vstack(
        { width: 100, padding: 5 },
        text("Inner", { size: 12, font }),
        hstack(
          { position: "absolute", top: 20, left: 250, width: 40 },
          text("Pin", { size: 12, font })
        )
      )
    );

    render(node, page, 10, 220, 300);

    const pinCall = drawText.mock.calls.find((call) => call[0] === "Pin");
    expect(pinCall).toBeDefined();
    expect(pinCall![1]?.x).toBeCloseTo(260, 5);
    expect(pinCall![1]?.y).toBeCloseTo(200 - fontAscent(font, 12), 5);
  });

  it("stretches absolute boxes when left/right or top/bottom are both set", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([300, 200]);
    const drawLine = vi.spyOn(page, "drawLine");
    const node = vstack(
      { position: "relative", width: 200, height: 100 },
      vstack(
        { position: "absolute", left: 20, right: 30, top: 10, bottom: 70 },
        hline({ color: hex("#111111") })
      )
    );

    render(node, page, 10, 190, 200);

    const lineCall = drawLine.mock.calls[0]?.[0];
    expect(lineCall?.start.x).toBeCloseTo(30, 5);
    expect(lineCall?.end.x).toBeCloseTo(180, 5);
    expect(lineCall?.start.y).toBeCloseTo(179.5, 5);
  });

  it("lets absolute boxes contain their own absolute descendants", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([300, 200]);
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { position: "relative", width: 200, height: 100 },
      vstack(
        { position: "absolute", left: 20, top: 10, width: 100, height: 50 },
        hstack(
          { position: "absolute", left: 30, top: 15, width: 40 },
          text("Nested", { size: 12, font })
        )
      )
    );

    render(node, page, 10, 190, 200);

    const nestedCall = drawText.mock.calls.find((call) => call[0] === "Nested");
    expect(nestedCall).toBeDefined();
    expect(nestedCall![1]?.x).toBeCloseTo(60, 5);
    expect(nestedCall![1]?.y).toBeCloseTo(165 - fontAscent(font, 12), 5);
  });

  it("renders absolute siblings by zIndex, preserving document order for ties", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([300, 200]);
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { position: "relative", width: 200, height: 100 },
      hstack(
        { position: "absolute", top: 10, left: 10, width: 40, zIndex: 2 },
        text("top", { size: 12, font })
      ),
      hstack(
        { position: "absolute", top: 10, left: 10, width: 40, zIndex: 1 },
        text("bottom", { size: 12, font })
      ),
      hstack(
        { position: "absolute", top: 10, left: 10, width: 40, zIndex: 2 },
        text("top-tie", { size: 12, font })
      )
    );

    render(node, page, 10, 190, 200);

    const rendered = drawText.mock.calls.map((call) => call[0]);
    expect(rendered).toEqual(["bottom", "top", "top-tie"]);
  });
});
