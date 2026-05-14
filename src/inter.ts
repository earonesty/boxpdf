import type { PDFDocument, PDFFont } from "pdf-lib";

/**
 * Embed [Inter](https://rsms.me/inter) Regular + Bold (and optionally Italic)
 * into the PDF document. Returns `PDFFont` objects you can plug straight into
 * any boxpdf theme factory.
 *
 * Inter is a typeface designed for screens by Rasmus Andersson, released under
 * the SIL Open Font License 1.1. Subset shipped with boxpdf covers Basic
 * Latin, Latin-1 Supplement, common punctuation, and a handful of currency
 * symbols (~82 KB per weight, ~325 KB total for all three).
 *
 * The bytes live in a separate module loaded via dynamic import, so importing
 * `boxpdf/inter` is what pulls them in — the core `boxpdf` bundle stays slim
 * if you don't need Inter.
 *
 * @example
 *   import { PDFDocument } from "pdf-lib";
 *   import { cleanTheme, renderFlow, text, vstack } from "boxpdf";
 *   import { embedInter } from "boxpdf/inter";
 *
 *   const pdf = await PDFDocument.create();
 *   const { font, bold } = await embedInter(pdf);
 *   const theme = cleanTheme(font, bold);
 *   // ... build your doc with `theme.type.h1`, etc.
 */
export async function embedInter(
  pdf: PDFDocument,
  options: { italic?: boolean } = {}
): Promise<{ font: PDFFont; bold: PDFFont; italic?: PDFFont }> {
  await ensureFontkit(pdf);
  const mod = await import("./fonts/inter-bytes.js");
  const font = await pdf.embedFont(decodeBase64(mod.interRegularBase64), { subset: true });
  const bold = await pdf.embedFont(decodeBase64(mod.interBoldBase64), { subset: true });
  const italic = options.italic
    ? await pdf.embedFont(decodeBase64(mod.interItalicBase64), { subset: true })
    : undefined;
  return { font, bold, italic };
}

async function ensureFontkit(pdf: PDFDocument): Promise<void> {
  const mod = (await import("@pdf-lib/fontkit")) as unknown as { default?: unknown };
  const fontkit = mod.default ?? mod;
  // pdf.registerFontkit is idempotent — calling it more than once is harmless.
  pdf.registerFontkit(fontkit as Parameters<typeof pdf.registerFontkit>[0]);
}

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(value);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  const buf = (globalThis as { Buffer?: { from: (s: string, enc: string) => Uint8Array } }).Buffer;
  if (buf) return new Uint8Array(buf.from(value, "base64"));
  throw new Error("No base64 decoder available in this runtime.");
}
