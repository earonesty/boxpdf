import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { ellipsize, fontLineHeight, fontLineMetrics, fontXHeight, measureText, wrapText } from "../src/text.js";
import { inlineNode, linkRun, paragraph, run, vstack } from "../src/nodes.js";
import { measure } from "../src/measure.js";
import { layoutParagraph } from "../src/paragraph.js";

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

describe("fontLineMetrics", () => {
  it("splits extra line height as half-leading above and below the font box", () => {
    const natural = fontLineHeight(font, 12);
    const metrics = fontLineMetrics(font, 12, natural + 6);
    expect(metrics.ascent + metrics.descent).toBeCloseTo(natural + 6, 5);
    expect(metrics.ascent - fontLineMetrics(font, 12, natural).ascent).toBeCloseTo(3, 5);
    expect(metrics.descent - fontLineMetrics(font, 12, natural).descent).toBeCloseTo(3, 5);
  });
});

describe("paragraph", () => {
  it("wraps mixed styled runs as one paragraph", () => {
    const node = paragraph(
      { width: 90 },
      run("Hello ", { size: 12, font }),
      run("bold world", { size: 12, font }),
      linkRun(" link", { size: 12, font, underline: true }, "https://example.com")
    );
    const single = paragraph(
      { width: 500 },
      run("Hello bold world link", { size: 12, font })
    );
    expect(measure(node, 500).height).toBeGreaterThan(measure(single, 500).height);
  });

  it("wraps inline nodes atomically with text runs", () => {
    const badge = vstack({ width: 24, height: 12 });
    const node = paragraph(
      { width: 70 },
      run("Alpha ", { size: 12, font }),
      inlineNode(badge),
      run(" beta gamma", { size: 12, font })
    );
    const lines = measure(node, 500).height / 12;
    expect(lines).toBeGreaterThan(1);
  });

  it("uses inline node height in paragraph line measurement", () => {
    const badge = vstack({ width: 20, height: 30 });
    const node = paragraph(
      { width: 200 },
      run("A ", { size: 12, font }),
      inlineNode(badge),
      run(" B", { size: 12, font })
    );
    expect(measure(node, 500).height).toBeGreaterThanOrEqual(30);
  });

  it("aligns middle inline nodes to the line text x-height", () => {
    const badge = vstack({ width: 20, height: 30 });
    const [line] = layoutParagraph(
      [
        run("A ", { size: 12, font }),
        inlineNode(badge, { verticalAlign: "middle" }),
        run(" B", { size: 12, font })
      ],
      200
    );
    const inline = line?.segments.find((segment) => segment.kind === "inline");
    expect(inline).toBeDefined();
    expect(inline!.ascent - inline!.height / 2).toBeCloseTo(fontXHeight(font, 12) / 2, 5);
  });

  it("supports hanging indents with textIndent and paddingLeft", () => {
    const lines = layoutParagraph(
      [run("• Wrapped list item with enough text to continue on the next line.", { size: 12, font })],
      150,
      undefined,
      { paddingLeft: 18, textIndent: -18 }
    );
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]!.xOffset).toBe(0);
    expect(lines[1]!.xOffset).toBe(18);
    expect(lines[1]!.width).toBeLessThanOrEqual(132);
  });
});
