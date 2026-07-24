import type { PDFDocument, SaveOptions } from "pdf-lib";
import type { PdfEncryptionOptions } from "./encryption/types.js";

export interface SavePdfOptions extends SaveOptions {
  encryption?: PdfEncryptionOptions;
}

export async function savePdf(
  pdf: PDFDocument,
  options: SavePdfOptions = {}
): Promise<Uint8Array> {
  const { encryption, ...saveOptions } = options;
  if (!encryption) return pdf.save(saveOptions);
  const { saveEncryptedPdf } = await import("./encryption/writer.js");
  return saveEncryptedPdf(pdf, { ...saveOptions, encryption });
}
