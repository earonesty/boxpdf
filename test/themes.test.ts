import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  brutalistTheme,
  cleanTheme,
  editorialTheme,
  stripeTheme,
  type Theme
} from "../src/index.js";

let font: PDFFont;
let bold: PDFFont;
let italic: PDFFont;
let courier: PDFFont;
let courierBold: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
  bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  courier = await pdf.embedFont(StandardFonts.Courier);
  courierBold = await pdf.embedFont(StandardFonts.CourierBold);
});

const assertShape = (theme: Theme, name: string): void => {
  expect(theme.font, `${name}.font`).toBeDefined();
  expect(theme.bold, `${name}.bold`).toBeDefined();
  expect(theme.colors.ink, `${name}.colors.ink`).toBeDefined();
  expect(theme.colors.muted, `${name}.colors.muted`).toBeDefined();
  expect(theme.colors.surface, `${name}.colors.surface`).toBeDefined();
  expect(theme.colors.border, `${name}.colors.border`).toBeDefined();
  expect(theme.spacing.md, `${name}.spacing.md`).toBeGreaterThan(0);
  expect(theme.spacing.xxl, `${name}.spacing.xxl`).toBeGreaterThan(theme.spacing.md);
  expect(theme.type.h1.size).toBeGreaterThan(theme.type.body.size);
  expect(theme.type.body.size).toBeGreaterThan(theme.type.caption.size);
  expect(theme.card).toBeDefined();
  expect(theme.hr.color).toBeDefined();
};

describe("themes", () => {
  it("cleanTheme exposes the full token shape", () => {
    assertShape(cleanTheme(font, bold), "cleanTheme");
  });
  it("stripeTheme exposes the full token shape", () => {
    assertShape(stripeTheme(font, bold), "stripeTheme");
  });
  it("editorialTheme exposes the full token shape and uses italic when provided", () => {
    const theme = editorialTheme(font, bold, italic);
    assertShape(theme, "editorialTheme");
    expect(theme.italic).toBe(italic);
    // Caption falls back to base font when italic isn't supplied
    const noItalic = editorialTheme(font, bold);
    expect(noItalic.italic).toBeUndefined();
    expect(noItalic.type.caption.font).toBe(font);
  });
  it("brutalistTheme exposes the full token shape and uses monospace fonts", () => {
    const theme = brutalistTheme(courier, courierBold);
    assertShape(theme, "brutalistTheme");
    expect(theme.font).toBe(courier);
    expect(theme.bold).toBe(courierBold);
    expect(theme.mono).toBe(courier);
  });
  it("each theme yields distinct visual identity", () => {
    const clean = cleanTheme(font, bold);
    const stripe = stripeTheme(font, bold);
    const editorial = editorialTheme(font, bold, italic);
    const brutalist = brutalistTheme(courier, courierBold);
    // Border radius: clean rounds, stripe is square, editorial is square, brutalist is square.
    expect(clean.radii.md).toBeGreaterThan(0);
    expect(stripe.radii.md).toBe(0);
    expect(editorial.radii.md).toBe(0);
    expect(brutalist.radii.md).toBe(0);
    // Brutalist uses pure black borders, others are softer
    expect(brutalist.colors.border.r).toBe(0);
    expect(clean.colors.border.r).toBeGreaterThan(0.5);
  });
});
