import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { loadFont, embedFont } from "../src/index.js";
import { interBoldBase64, interRegularBase64 } from "../src/fonts/inter-bytes.js";

describe("loadFont", () => {
  it("accepts a raw base64 string", async () => {
    const pdf = await PDFDocument.create();
    const font = await loadFont(pdf, interRegularBase64);
    expect(font).toBeDefined();
    expect(font.widthOfTextAtSize("hello", 12)).toBeGreaterThan(0);
  });

  it("accepts a Uint8Array", async () => {
    const pdf = await PDFDocument.create();
    const bytes = Uint8Array.from(atob(interRegularBase64), (c) => c.charCodeAt(0));
    const font = await loadFont(pdf, bytes);
    expect(font.widthOfTextAtSize("hi", 12)).toBeGreaterThan(0);
  });

  it("rejects garbage strings with a helpful error", async () => {
    const pdf = await PDFDocument.create();
    await expect(loadFont(pdf, "!@#$ not base64")).rejects.toThrow(/Unrecognized asset source/);
  });

  it("features option round-trips through to pdf-lib", async () => {
    // Verifies the same shape that Inter's tabularFigures uses.
    const pdf = await PDFDocument.create();
    const proportional = await loadFont(pdf, interBoldBase64);
    const tabular = await loadFont(pdf, interBoldBase64, { features: { tnum: true } });
    const size = 12;
    expect(
      Math.abs(proportional.widthOfTextAtSize("11111", size) - proportional.widthOfTextAtSize("00000", size))
    ).toBeGreaterThan(1);
    expect(
      Math.abs(tabular.widthOfTextAtSize("11111", size) - tabular.widthOfTextAtSize("00000", size))
    ).toBeLessThan(0.5);
  });

  it("embedFont remains as a deprecated alias", async () => {
    const pdf = await PDFDocument.create();
    const font = await embedFont(pdf, { source: interRegularBase64 });
    expect(font).toBeDefined();
  });
});
