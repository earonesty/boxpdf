import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { ellipsize, measureText, wrapText } from "../src/text.js";

let font: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
});

describe("wrapText", () => {
  it("returns the single line when text fits", () => {
    const lines = wrapText(font, 12, "hello", 1000);
    expect(lines).toEqual(["hello"]);
  });

  it("wraps at whitespace when constrained", () => {
    const lines = wrapText(font, 12, "the quick brown fox jumps", 50);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ")).toContain("quick");
  });

  it("preserves explicit newlines as separate lines", () => {
    const lines = wrapText(font, 12, "line one\nline two", 1000);
    expect(lines).toEqual(["line one", "line two"]);
  });

  it("hard-breaks words too wide for the line", () => {
    const huge = "supercalifragilisticexpialidocious";
    const lines = wrapText(font, 12, huge, 30);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe(huge);
  });
});

describe("ellipsize", () => {
  it("returns the text unchanged when it fits", () => {
    expect(ellipsize(font, 12, "short", 1000)).toBe("short");
  });

  it("truncates with an ellipsis when too long", () => {
    const out = ellipsize(font, 12, "this is a long sentence that will not fit", 60);
    expect(out.endsWith("…")).toBe(true);
    expect(measureText(font, 12, out)).toBeLessThanOrEqual(60);
  });
});
