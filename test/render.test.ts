import { describe, expect, it, beforeAll, vi } from "vitest";
import { PDFDocument, PDFPage, StandardFonts, type PDFFont } from "pdf-lib";
import { hex } from "../src/colors.js";
import { hline, hstack, imageFit, keepTogether, spacer, text, vstack } from "../src/nodes.js";
import { render } from "../src/render.js";
import { renderFlow, renderToPdf } from "../src/document.js";
import { measure } from "../src/measure.js";
import { fontAscent, fontLineMetrics } from "../src/text.js";
import { table } from "../src/table.js";

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

  it("wrapped hstack applies justify within each full-width row", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 140]);
    const drawText = vi.spyOn(page, "drawText");
    const node = hstack(
      { width: 100, wrap: true, justify: "end", gap: 0 },
      text("A", { size: 12, font }),
      text("B", { size: 12, font }),
      text("C", { size: 12, font })
    );

    render(node, page, 20, 120, 200);

    const first = drawText.mock.calls.find((call) => call[0] === "A");
    expect(first?.[1]?.x).toBeGreaterThan(20);
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

  it("vstack align:stretch gives auto-width children the full cross-axis width", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([200, 120]);
    const drawRectangle = vi.spyOn(page, "drawRectangle");
    const node = vstack(
      { width: 120, align: "stretch" },
      hstack(
        { height: 20, background: hex("#ddeeff") },
        text("stretched", { size: 10, font })
      )
    );

    render(node, page, 10, 100, 200);

    expect(drawRectangle).toHaveBeenCalledWith(
      expect.objectContaining({ x: 10, y: 80, width: 120, height: 20 })
    );
  });

  it("alignSelf overrides stretch for text children", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([200, 120]);
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { width: 120, align: "stretch" },
      text("centered", { size: 10, font, alignSelf: "center" })
    );

    render(node, page, 10, 100, 200);

    const call = drawText.mock.calls.find((entry) => entry[0] === "centered");
    expect(call?.[1]?.x).toBeGreaterThan(10);
  });

  it("hstack align:stretch gives auto-height children the full cross-axis height", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([200, 120]);
    const drawRectangle = vi.spyOn(page, "drawRectangle");
    const node = hstack(
      { width: 120, height: 60, align: "stretch" },
      vstack(
        { width: 30, background: hex("#ddeeff") },
        text("A", { size: 10, font })
      )
    );

    render(node, page, 10, 100, 200);

    expect(drawRectangle).toHaveBeenCalledWith(
      expect.objectContaining({ x: 10, y: 40, width: 30, height: 60 })
    );
  });

  it("hstack align:baseline aligns first-line text baselines", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 140]);
    const drawText = vi.spyOn(page, "drawText");
    const node = hstack(
      { align: "baseline", gap: 8 },
      text("Big", { size: 24, font: bold }),
      text("small", { size: 10, font })
    );

    render(node, page, 20, 100, 200);

    const big = drawText.mock.calls.find((call) => call[0] === "Big");
    const small = drawText.mock.calls.find((call) => call[0] === "small");
    expect(big?.[1]?.y).toBeCloseTo(small?.[1]?.y ?? 0, 5);
  });

  it("hstack align:baseline synthesizes box baselines at their bottom edge", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 140]);
    const drawRectangle = vi.spyOn(page, "drawRectangle");
    const node = hstack(
      { align: "baseline", gap: 8 },
      text("Text", { size: 12, font }),
      vstack({ width: 20, height: 30, background: hex("#ddeeff") })
    );

    render(node, page, 20, 100, 200);

    const sharedBaseline = 100 - Math.max(fontLineMetrics(font, 12).ascent, 30);
    expect(drawRectangle).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number), y: sharedBaseline, width: 20, height: 30 })
    );
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

  it("rotates a stack around its center without changing layout size", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 160]);
    const pushOperatorsSpy = vi.spyOn(page, "pushOperators");
    const node = vstack(
      { width: 100, height: 40, rotate: 90, background: hex("#eeeeee") },
      text("Rotated", { size: 12, font })
    );

    expect(measure(node, 200)).toMatchObject({ width: 100, height: 40 });
    expect(render(node, page, 20, 140, 200)).toBe(40);

    const operators = pushOperatorsSpy.mock.calls.flat().map((operator) => operator.toString());
    expect(operators).toContain("q");
    expect(operators).toContain("Q");
    expect(operators.some((operator) => operator.includes("-1 1") && operator.endsWith("-50 190 cm"))).toBe(true);
  });

  it("applies stack opacity to descendants and text decorations", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 160]);
    const drawText = vi.spyOn(page, "drawText");
    const drawLine = vi.spyOn(page, "drawLine");
    const drawRectangle = vi.spyOn(page, "drawRectangle");
    const node = vstack(
      {
        width: 120,
        opacity: 0.5,
        background: hex("#eeeeee"),
        border: { color: hex("#111111"), width: 1 }
      },
      text("Faded", { size: 12, font, underline: true, opacity: 0.5 })
    );

    render(node, page, 10, 140, 200);

    expect(drawRectangle).toHaveBeenCalledWith(expect.objectContaining({ opacity: 0.5 }));
    expect(drawRectangle).toHaveBeenCalledWith(expect.objectContaining({ borderOpacity: 0.5 }));
    expect(drawText.mock.calls.find((call) => call[0] === "Faded")?.[1]?.opacity).toBe(0.25);
    expect(drawLine.mock.calls[0]?.[0]?.opacity).toBe(0.25);
  });

  it("maxHeight constrains vertical shrink during render", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([200, 160]);
    const drawRectangle = vi.spyOn(page, "drawRectangle");
    const node = vstack(
      { maxHeight: 50 },
      vstack({ height: 80, shrink: 1, background: hex("#ddeeff") })
    );

    render(node, page, 10, 140, 200);

    expect(drawRectangle).toHaveBeenCalledWith(
      expect.objectContaining({ x: 10, y: 90, width: 0, height: 50 })
    );
  });

  it("draws per-side borders inside the box bounds", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 220]);
    const drawLine = vi.spyOn(page, "drawLine");
    const node = vstack({
      width: 100,
      height: 50,
      borderSides: {
        top: { color: hex("#111111"), width: 2 },
        right: { color: hex("#222222"), width: 4 },
        bottom: { color: hex("#333333"), width: 6 },
        left: { color: hex("#444444"), width: 8 }
      }
    });

    render(node, page, 10, 190, 200);

    expect(drawLine).toHaveBeenCalledTimes(4);
    expect(drawLine.mock.calls[0]?.[0]?.start).toMatchObject({ x: 10, y: 189 });
    expect(drawLine.mock.calls[0]?.[0]?.end).toMatchObject({ x: 110, y: 189 });
    expect(drawLine.mock.calls[1]?.[0]?.start).toMatchObject({ x: 108, y: 190 });
    expect(drawLine.mock.calls[1]?.[0]?.end).toMatchObject({ x: 108, y: 140 });
    expect(drawLine.mock.calls[2]?.[0]?.start).toMatchObject({ x: 10, y: 143 });
    expect(drawLine.mock.calls[2]?.[0]?.end).toMatchObject({ x: 110, y: 143 });
    expect(drawLine.mock.calls[3]?.[0]?.start).toMatchObject({ x: 14, y: 190 });
    expect(drawLine.mock.calls[3]?.[0]?.end).toMatchObject({ x: 14, y: 140 });
  });

  it("renders fitted images as a clipped fixed-size box", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 220]);
    const drawImage = vi.spyOn(page, "drawImage").mockImplementation(() => {});
    const pushOperators = vi.spyOn(page, "pushOperators");
    const node = imageFit({ width: 400, height: 200 } as any, {
      width: 100,
      height: 100,
      fit: "cover"
    });

    render(node, page, 10, 190, 200);

    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ x: -40, y: 90, width: 200, height: 100 })
    );
    expect(pushOperators).toHaveBeenCalledTimes(2);
    expect(measure(node, 200)).toEqual({ width: 100, height: 100 });
  });

  it("clips stack descendants when overflow is hidden", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 220]);
    const pushOperators = vi.spyOn(page, "pushOperators");
    const drawText = vi.spyOn(page, "drawText");
    const node = vstack(
      { width: 80, height: 20, overflow: "hidden" },
      text("This line is intentionally taller than the box", { size: 18, font, width: 160 })
    );

    render(node, page, 10, 190, 200);

    expect(drawText).toHaveBeenCalled();
    expect(pushOperators).toHaveBeenCalledTimes(2);
    expect(measure(node, 200)).toEqual({ width: 80, height: 20 });
  });

  it("clips absolute descendants when overflow is hidden", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([240, 220]);
    const pushOperators = vi.spyOn(page, "pushOperators");
    const node = vstack(
      { width: 80, height: 40, position: "relative", overflow: "hidden" },
      vstack({ position: "absolute", left: 60, top: 8, width: 50, height: 20, background: hex("#dbeafe") })
    );

    render(node, page, 10, 190, 200);

    expect(pushOperators).toHaveBeenCalledTimes(2);
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

  it("fragments a top-level vstack between children", async () => {
    const pdf = await PDFDocument.create();
    const blocks = Array.from({ length: 6 }, (_, i) =>
      vstack(
        { height: 54, padding: 6, border: { color: hex("#dddddd"), width: 1 } },
        text(`Fragment ${i + 1}`, { size: 10, font })
      )
    );
    const node = vstack({ gap: 4 }, ...blocks);

    const { pages } = await renderFlow(pdf, [node], {
      size: { width: 240, height: 220 },
      margin: 20
    });

    expect(pages.length).toBeGreaterThan(1);
  });

  it("moves a fragmentable stack when its first child cannot fit", async () => {
    const pdf = await PDFDocument.create();
    const phases: string[] = [];
    const filler = spacer(100);
    const photoCard = vstack(
      { gap: 4 },
      vstack(
        { height: 100, background: hex("#eeeeee") },
        text("photo", { size: 10, font })
      ),
      text("caption", { size: 10, font })
    );

    const { pages } = await renderFlow(pdf, [filler, photoCard], {
      size: { width: 240, height: 220 },
      margin: 20,
      profile: (event) => {
        if (["split-start", "node-render-start", "page-break"].includes(event.phase)) {
          phases.push(event.phase);
        }
      }
    });

    expect(pages).toHaveLength(2);
    expect(phases).toEqual([
      "node-render-start",
      "split-start",
      "page-break",
      "node-render-start"
    ]);
  });

  it("fragments tables between rows and repeats the header", async () => {
    const drawText = vi.spyOn(PDFPage.prototype, "drawText");
    try {
      const pdf = await PDFDocument.create();
      const node = table({
        width: 180,
        columns: [{ width: "1fr" }, { width: 50 }],
        header: [
          text("Item", { size: 10, font: bold }),
          text("Qty", { size: 10, font: bold })
        ],
        rows: Array.from({ length: 10 }, (_, i) => [
          vstack(
            { padding: { top: 5, bottom: 5 } },
            text(`Row ${i + 1}`, { size: 10, font })
          ),
          text(String(i + 1), { size: 10, font })
        ]),
        rowDivider: { color: hex("#dddddd"), thickness: 1 },
        headerDivider: { color: hex("#111111"), thickness: 1 },
        columnGap: 0
      });

      const { pages } = await renderFlow(pdf, [node], {
        size: { width: 240, height: 220 },
        margin: 20
      });

      const headerDraws = drawText.mock.calls.filter((call) => call[0] === "Item").length;
      expect(pages.length).toBeGreaterThan(1);
      expect(headerDraws).toBe(pages.length);
    } finally {
      drawText.mockRestore();
    }
  });

  it("moves a table when its first row cannot fit", async () => {
    const pdf = await PDFDocument.create();
    const phases: string[] = [];
    const node = table({
      width: 180,
      columns: [{ width: "1fr" }],
      header: [text("Item", { size: 10, font: bold })],
      rows: [
        [vstack({ height: 70 }, text("Row 1", { size: 10, font }))],
        [vstack({ height: 40 }, text("Row 2", { size: 10, font }))]
      ],
      cellPadding: 0
    });

    const { pages } = await renderFlow(pdf, [spacer(145), node], {
      size: { width: 240, height: 260 },
      margin: 20,
      profile: (event) => {
        if (["split-start", "node-render-start", "page-break"].includes(event.phase)) {
          phases.push(event.phase);
        }
      }
    });

    expect(pages).toHaveLength(2);
    expect(phases).toEqual([
      "node-render-start",
      "split-start",
      "page-break",
      "node-render-start"
    ]);
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
