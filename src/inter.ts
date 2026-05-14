import type { PDFDocument, PDFFont } from "pdf-lib";
import {
  interRegularBase64,
  interBoldBase64,
  interItalicBase64
} from "./fonts/inter-bytes.js";
import { loadFont } from "./assets.js";

/**
 * Inter Regular (Latin + Latin-1 + common punctuation, ~82 KB subset).
 * Pass to `loadFont(pdf, inter)` to embed.
 */
export const inter: string = interRegularBase64;

/** Inter Bold, same subset. */
export const interBold: string = interBoldBase64;

/** Inter Italic, same subset. */
export const interItalic: string = interItalicBase64;

/**
 * Embed [Inter](https://rsms.me/inter) Regular + Bold (and optionally Italic
 * and a tabular-figure variant pair) into the PDF document. Returns
 * `PDFFont` objects you can plug straight into any boxpdf theme factory.
 *
 * Convenience helper around the raw `inter` / `interBold` / `interItalic`
 * exports — you can also call `loadFont(pdf, inter)` etc. directly if you
 * only want one weight.
 *
 * @example
 *   import { PDFDocument } from "pdf-lib";
 *   import { cleanTheme, renderFlow, text, vstack } from "boxpdf";
 *   import { embedInter } from "boxpdf/inter";
 *
 *   const pdf = await PDFDocument.create();
 *   const { font, bold } = await embedInter(pdf);
 *   const theme = cleanTheme(font, bold);
 */
export async function embedInter(
  pdf: PDFDocument,
  options: { italic?: boolean; tabularFigures?: boolean } = {}
): Promise<{
  font: PDFFont;
  bold: PDFFont;
  italic?: PDFFont;
  /** Inter Regular with the OpenType `tnum` feature on — every digit has
   *  the same advance width so money columns and tables align perfectly.
   *  Only returned when `tabularFigures: true`. */
  tabularFont?: PDFFont;
  /** Same as `tabularFont` but bold. Use for emphasized amounts. */
  tabularBold?: PDFFont;
}> {
  const font = await loadFont(pdf, inter);
  const bold = await loadFont(pdf, interBold);
  const italic = options.italic ? await loadFont(pdf, interItalic) : undefined;
  const tabularFont = options.tabularFigures
    ? await loadFont(pdf, inter, { features: { tnum: true } })
    : undefined;
  const tabularBold = options.tabularFigures
    ? await loadFont(pdf, interBold, { features: { tnum: true } })
    : undefined;
  return { font, bold, italic, tabularFont, tabularBold };
}
