import { PDFDocument, savePdf } from "../dist/index.js";

async function generate(label: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  pdf.addPage();
  const bytes = await savePdf(pdf, {
    encryption: { password: `${label}-user` }
  });
  const header = new TextDecoder().decode(bytes.slice(0, 8));
  const binary = new TextDecoder("latin1").decode(bytes);
  if (header !== "%PDF-2.0" || !binary.includes("/CFM /AESV3")) {
    throw new Error(`${label} encryption smoke output was not R6 AES-256`);
  }
  return bytes;
}

const runtime = globalThis as typeof globalThis & {
  Deno?: unknown;
  document?: Document;
};

if (runtime.document) {
  generate("browser")
    .then(() => {
      runtime.document!.body.textContent = "boxpdf-browser-encryption-ok";
    })
    .catch((error: Error) => {
      runtime.document!.body.textContent =
        `boxpdf-browser-encryption-failed: ${error.message}`;
    });
}

if (runtime.Deno) {
  void generate("deno").then(() => {
    console.log("verified Deno encrypted save");
  });
}

export default {
  async fetch(): Promise<Response> {
    try {
      await generate("worker");
      return new Response("verified Cloudflare Worker encrypted save");
    } catch (error) {
      return new Response((error as Error).message, { status: 500 });
    }
  }
};
