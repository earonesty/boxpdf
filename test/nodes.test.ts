import { describe, expect, it } from "vitest";
import type { PDFImage } from "pdf-lib";
import { aspectRatio, imageFit } from "../src/nodes.js";

describe("image helpers", () => {
  const pdfImage = { width: 400, height: 200 } as PDFImage;

  it("scales images to contain a target rectangle by default", () => {
    const node = imageFit(pdfImage, { width: 100, height: 100 });
    expect(node).toMatchObject({
      kind: "imageBox",
      width: 100,
      height: 100,
      imageWidth: 100,
      imageHeight: 50,
      offsetX: 0,
      offsetY: 25
    });
  });

  it("scales images to cover a target rectangle when requested", () => {
    const node = imageFit(pdfImage, { width: 100, height: 100, fit: "cover" });
    expect(node).toMatchObject({
      kind: "imageBox",
      width: 100,
      height: 100,
      imageWidth: 200,
      imageHeight: 100,
      offsetX: -50,
      offsetY: 0
    });
  });

  it("rejects impossible image sizing", () => {
    expect(() => imageFit(pdfImage, { width: 0, height: 100 })).toThrow(/positive/);
    expect(() => imageFit({ width: 0, height: 10 } as PDFImage, { width: 100, height: 100 })).toThrow(/positive/);
  });
});

describe("aspectRatio", () => {
  it("derives height from width", () => {
    expect(aspectRatio(16 / 9, { width: 160 })).toEqual({ width: 160, height: 90 });
  });

  it("derives width from height", () => {
    expect(aspectRatio(16 / 9, { height: 90 })).toEqual({ width: 160, height: 90 });
  });

  it("rejects non-positive ratios", () => {
    expect(() => aspectRatio(0, { width: 100 })).toThrow(/positive finite/);
  });
});
