import { describe, expect, it } from "vitest";
import {
  PDFDocument,
  PDFName,
  PDFRawStream,
  StandardFonts
} from "pdf-lib";
import { flowToPdf, savePdf, text } from "../../src/index.js";

const asBinaryText = (bytes: Uint8Array): string => {
  let result = "";
  for (const byte of bytes) result += String.fromCharCode(byte);
  return result;
};

async function documentWithText(marker = "encrypted page marker"): Promise<PDFDocument> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.addPage().drawText(marker, { font });
  return pdf;
}

describe("encrypted buffered writer", () => {
  it.each([true, false])(
    "writes a PDF 2.0 R6 encryption dictionary (object streams: %s)",
    async (useObjectStreams) => {
      const pdf = await documentWithText();
      pdf.setTitle("unique encrypted title 62491");
      const bytes = await savePdf(pdf, {
        useObjectStreams,
        encryption: {
          password: "test-user",
          ownerPassword: "test-owner",
          permissions: { copying: false }
        }
      });
      const output = asBinaryText(bytes);
      expect(output.startsWith("%PDF-2.0")).toBe(true);
      expect(output).toContain("/Filter /Standard");
      expect(output).toContain("/R 6");
      expect(output).toContain("/V 5");
      expect(output).toContain("/CFM /AESV3");
      expect(output).toContain("/P -20");
      expect(output).not.toContain("unique encrypted title 62491");
      expect(output.endsWith("%%EOF\n")).toBe(true);
    }
  );

  it("leaves only the catalog metadata stream clear when requested", async () => {
    const marker = new TextEncoder().encode("<x:xmpmeta>clear metadata 41827</x:xmpmeta>");
    const clearPdf = await documentWithText();
    clearPdf.setTitle("encrypted info title 58134");
    const metadata = clearPdf.context.register(
      PDFRawStream.of(
        clearPdf.context.obj({ Type: "Metadata", Subtype: "XML" }),
        marker
      )
    );
    clearPdf.catalog.set(PDFName.of("Metadata"), metadata);
    const clearBytes = await savePdf(clearPdf, {
      encryption: { password: "user", encryptMetadata: false }
    });
    const clearOutput = asBinaryText(clearBytes);
    expect(clearOutput).toContain("clear metadata 41827");
    expect(clearOutput).not.toContain("encrypted info title 58134");
    expect(clearOutput).toContain("/EncryptMetadata false");

    const encryptedPdf = await documentWithText();
    const encryptedMetadata = encryptedPdf.context.register(
      PDFRawStream.of(
        encryptedPdf.context.obj({ Type: "Metadata", Subtype: "XML" }),
        marker
      )
    );
    encryptedPdf.catalog.set(PDFName.of("Metadata"), encryptedMetadata);
    const encryptedBytes = await savePdf(encryptedPdf, {
      encryption: { password: "user" }
    });
    expect(asBinaryText(encryptedBytes)).not.toContain("clear metadata 41827");
  });

  it("does not consume the document and generates fresh encryption material", async () => {
    const pdf = await documentWithText();
    const first = await savePdf(pdf, { encryption: { password: "user" } });
    const second = await savePdf(pdf, { encryption: { password: "user" } });
    expect(first).not.toEqual(second);
    expect(pdf.context.trailerInfo.Encrypt).toBeUndefined();
    await expect(pdf.save()).resolves.toBeInstanceOf(Uint8Array);
  });

  it("rejects signed and already-encrypted contexts before writing", async () => {
    const signed = await documentWithText();
    signed.context.register(
      signed.context.obj({ Type: "Sig", ByteRange: [0, 1, 2, 3] })
    );
    await expect(
      savePdf(signed, { encryption: { password: "user" } })
    ).rejects.toMatchObject({ code: "SIGNED_PDF_UNSUPPORTED" });

    const encrypted = await documentWithText();
    encrypted.context.trailerInfo.Encrypt = encrypted.context.nextRef();
    await expect(
      savePdf(encrypted, { encryption: { password: "user" } })
    ).rejects.toMatchObject({ code: "ENCRYPTED_INPUT_UNSUPPORTED" });
  });

  it("preserves the ordinary pdf-lib save path when encryption is omitted", async () => {
    const pdf = await documentWithText();
    const bytes = await savePdf(pdf, { useObjectStreams: false });
    const output = asBinaryText(bytes);
    expect(output.startsWith("%PDF-1.7")).toBe(true);
    expect(output).not.toContain("/Encrypt");
  });

  it("supports encryption through flowToPdf", async () => {
    const bytes = await flowToPdf(
      async (pdf) => {
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        return [text("flow secret", { font, size: 12 })];
      },
      { encryption: { password: "flow-user" } }
    );
    expect(asBinaryText(bytes)).toContain("/R 6");
  });
});
