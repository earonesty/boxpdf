import { describe, expect, it } from "vitest";
import {
  PDFDocument,
  StandardFonts,
  cleanTheme,
  editorialTheme,
  flowToPdf,
  standardFonts,
  text,
  vstack
} from "../src/index.js";

describe("standardFonts", () => {
  it("embeds all four faces of the default Helvetica family", async () => {
    const pdf = await PDFDocument.create();
    const fonts = await standardFonts(pdf);
    expect(fonts.font).toBeDefined();
    expect(fonts.bold).toBeDefined();
    expect(fonts.italic).toBeDefined();
    expect(fonts.boldItalic).toBeDefined();
  });

  it("supports the times and courier families", async () => {
    const pdf = await PDFDocument.create();
    const times = await standardFonts(pdf, "times");
    const courier = await standardFonts(pdf, "courier");
    expect(times.font).not.toBe(courier.font);
  });
});

describe("theme font overloads", () => {
  it("accepts a ThemeFonts object", async () => {
    const pdf = await PDFDocument.create();
    const fonts = await standardFonts(pdf);
    const theme = cleanTheme(fonts);
    expect(theme.font).toBe(fonts.font);
    expect(theme.bold).toBe(fonts.bold);
  });

  it("still accepts positional fonts (legacy path)", async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const theme = cleanTheme(font, bold);
    expect(theme.font).toBe(font);
    expect(theme.bold).toBe(bold);
  });

  it("fills the italic slot from a ThemeFonts object", async () => {
    const pdf = await PDFDocument.create();
    const fonts = await standardFonts(pdf, "times");
    const theme = editorialTheme(fonts);
    expect(theme.italic).toBe(fonts.italic);
  });

  it("throws a helpful error when bold is missing", async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    // @ts-expect-error intentionally calling with a missing bold argument
    expect(() => cleanTheme(font)).toThrow(/bold font/);
  });
});

describe("flowToPdf", () => {
  it("creates a document, renders, and returns saved bytes", async () => {
    const bytes = await flowToPdf(async (pdf) => {
      const theme = cleanTheme(await standardFonts(pdf));
      return [vstack({ gap: 8 }, text("Hello", theme.type.h1), text("World", theme.type.body))];
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});
