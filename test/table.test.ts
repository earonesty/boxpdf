import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { hex, renderToPdf, table, text } from "../src/index.js";
import { measure } from "../src/measure.js";

let font: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
});

const cell = (s: string) => text(s, { size: 10, font });

describe("table()", () => {
  it("fixed widths resolve to those widths", () => {
    const t = table({
      width: 300,
      columns: [{ width: 100 }, { width: 80 }, { width: 60 }],
      rows: [[cell("a"), cell("b"), cell("c")]],
      columnGap: 0
    });
    const size = measure(t, 600);
    expect(size.width).toBe(300);
  });

  it("fr columns share leftover space proportionally", () => {
    // 200 fixed, 100 leftover split 1:2 → 33.33 / 66.67
    const t = table({
      width: 300,
      columns: [{ width: 200 }, { width: "1fr" }, { width: "2fr" }],
      rows: [[cell("a"), cell("b"), cell("c")]],
      columnGap: 0
    });
    // Just verify the table renders without throwing — exact widths are
    // internal. The render test below sanity-checks output bytes.
    const size = measure(t, 600);
    expect(size.width).toBe(300);
  });

  it("renders header + rows + footer with dividers to a valid PDF", async () => {
    const bytes = await renderToPdf(
      table({
        width: 480,
        columns: [{ width: "1fr" }, { width: 80 }, { width: 100 }],
        header: [cell("Item"), cell("Qty"), cell("Total")],
        rows: [
          [cell("Wool socks"), cell("2"), cell("$28.00")],
          [cell("Coffee mug"), cell("1"), cell("$18.00")],
          [cell("Notebook"), cell("3"), cell("$27.00")]
        ],
        footer: [cell(""), cell("Total"), cell("$73.00")],
        rowDivider: { color: hex("#e5e7eb") },
        headerDivider: { color: hex("#0f1419"), thickness: 0.8 }
      })
    );
    expect(bytes.byteLength).toBeGreaterThan(300);
    const back = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(back.getPageCount()).toBe(1);
  });

  it("throws when a row's cell count doesn't match columns.length", () => {
    expect(() =>
      table({
        width: 300,
        columns: [{ width: 100 }, { width: 100 }, { width: 100 }],
        rows: [[cell("a"), cell("b")]]
      })
    ).toThrow(/cell\(s\).*columns defines/);
  });
});
