import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { embedInter } from "../src/inter.js";

describe("embedInter", () => {
  it("returns Regular + Bold by default", async () => {
    const pdf = await PDFDocument.create();
    const { font, bold, italic, tabularFont, tabularBold } = await embedInter(pdf);
    expect(font).toBeDefined();
    expect(bold).toBeDefined();
    expect(italic).toBeUndefined();
    expect(tabularFont).toBeUndefined();
    expect(tabularBold).toBeUndefined();
  });

  it("returns italic when requested", async () => {
    const pdf = await PDFDocument.create();
    const { italic } = await embedInter(pdf, { italic: true });
    expect(italic).toBeDefined();
  });

  it("tabularFigures: true returns extra tabular variants", async () => {
    const pdf = await PDFDocument.create();
    const { tabularFont, tabularBold } = await embedInter(pdf, { tabularFigures: true });
    expect(tabularFont).toBeDefined();
    expect(tabularBold).toBeDefined();
  });

  it("tabular variant aligns digits to a fixed grid (different widths than proportional)", async () => {
    const pdf = await PDFDocument.create();
    const { font, tabularFont } = await embedInter(pdf, { tabularFigures: true });
    expect(tabularFont).toBeDefined();

    // Proportional Inter has narrow "1" and wider "0", so "11111" is
    // significantly narrower than "00000". Tabular Inter forces equal
    // advance widths, so both should measure the same.
    const size = 12;
    const propOnes = font.widthOfTextAtSize("11111", size);
    const propZeros = font.widthOfTextAtSize("00000", size);
    const tabOnes = tabularFont!.widthOfTextAtSize("11111", size);
    const tabZeros = tabularFont!.widthOfTextAtSize("00000", size);

    // Proportional differs between digits (sanity check on baseline)
    expect(Math.abs(propOnes - propZeros)).toBeGreaterThan(1);

    // Tabular makes them identical (or near-identical with subpixel rounding)
    expect(Math.abs(tabOnes - tabZeros)).toBeLessThan(0.5);
  });
});
