import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { hline, hstack, spacer, text, vstack } from "../src/nodes.js";
import { measure } from "../src/measure.js";
import { fontLineHeight } from "../src/text.js";

let font: PDFFont;
let bold: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
  bold = await pdf.embedFont(StandardFonts.HelveticaBold);
});

describe("measure", () => {
  it("returns intrinsic text width for unconstrained text", () => {
    const node = text("Hello world", { size: 12, font });
    const size = measure(node, 500);
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it("uses full font height as the default text line height", () => {
    const node = text("debug", { size: 12, font });
    expect(measure(node, 500).height).toBeCloseTo(fontLineHeight(font, 12), 5);
  });

  it("wraps text when width is set and intrinsic exceeds it", () => {
    const long = "Hello world ".repeat(20);
    const wrapped = text(long, { size: 12, font, width: 100 });
    const unwrapped = text(long, { size: 12, font });
    const w = measure(wrapped, 500);
    const u = measure(unwrapped, 500);
    expect(w.height).toBeGreaterThan(u.height);
  });

  it("vstack sums child heights plus gaps", () => {
    const node = vstack(
      { gap: 5 },
      text("a", { size: 10, font }),
      text("b", { size: 10, font }),
      text("c", { size: 10, font })
    );
    const size = measure(node, 100);
    // 3 children + 2 gaps of 5
    expect(size.height).toBeGreaterThan(15);
  });

  it("hstack sums child widths plus gaps", () => {
    const node = hstack(
      { gap: 8 },
      text("aa", { size: 10, font }),
      text("bb", { size: 10, font })
    );
    const size = measure(node, 100);
    expect(size.width).toBeGreaterThan(8);
  });

  it("respects padding in containers", () => {
    const padded = vstack({ padding: 10 }, text("x", { size: 10, font }));
    const bare = vstack({}, text("x", { size: 10, font }));
    const a = measure(padded, 100);
    const b = measure(bare, 100);
    expect(a.height - b.height).toBe(20);
    expect(a.width - b.width).toBe(20);
  });

  it("spacer contributes only height to vstack", () => {
    const node = vstack({}, text("a", { size: 10, font }), spacer(20), text("b", { size: 10, font }));
    const without = vstack({}, text("a", { size: 10, font }), text("b", { size: 10, font }));
    expect(measure(node, 100).height - measure(without, 100).height).toBe(20);
  });

  it("hline takes full parent width when no explicit width given", () => {
    const node = hline({ color: { r: 0, g: 0, b: 0 } });
    expect(measure(node, 200).width).toBe(200);
  });

  it("fixed width on a vstack overrides intrinsic", () => {
    const node = vstack({ width: 300 }, text("x", { size: 10, font: bold }));
    expect(measure(node, 100).width).toBe(300);
  });
});
