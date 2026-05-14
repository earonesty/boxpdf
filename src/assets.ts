import type { PDFDocument, PDFFont, PDFImage } from "pdf-lib";

export type AssetSource = string | Uint8Array | ArrayBuffer;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function bytesStartWith(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.length < magic.length) return false;
  for (let i = 0; i < magic.length; i += 1) {
    if (bytes[i] !== magic[i]) return false;
  }
  return true;
}

async function readSource(source: AssetSource): Promise<Uint8Array> {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (typeof source === "string") {
    if (source.startsWith("data:")) {
      const comma = source.indexOf(",");
      if (comma === -1) throw new Error("Malformed data URL");
      const header = source.slice(5, comma);
      const payload = source.slice(comma + 1);
      if (header.includes(";base64")) {
        return decodeBase64(payload);
      }
      return new TextEncoder().encode(decodeURIComponent(payload));
    }
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source}: ${response.status} ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  throw new Error("Unsupported asset source — expected string URL/data URL, Uint8Array, or ArrayBuffer.");
}

function decodeBase64(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, "");
  if (typeof atob === "function") {
    const binary = atob(clean);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  // Node fallback — `Buffer` is global in Node.
  const buf = (globalThis as { Buffer?: { from: (data: string, encoding: string) => { buffer: ArrayBuffer; byteOffset: number; byteLength: number } } }).Buffer;
  if (buf) {
    const b = buf.from(clean, "base64");
    return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  }
  throw new Error("No base64 decoder available in this runtime.");
}

/**
 * Embed an image into the PDF, auto-detecting PNG vs JPEG from magic bytes.
 * Accepts an HTTP URL, a `data:image/...` URL, raw bytes, or an ArrayBuffer.
 *
 * @example
 *   const logo = await loadImage(pdf, "https://example.com/logo.png");
 *   const headshot = await loadImage(pdf, fs.readFileSync("./headshot.jpg"));
 *   image(logo, { width: 120, height: 40 });
 */
export async function loadImage(pdf: PDFDocument, source: AssetSource): Promise<PDFImage> {
  const bytes = await readSource(source);
  if (bytesStartWith(bytes, PNG_MAGIC)) return pdf.embedPng(bytes);
  if (bytesStartWith(bytes, JPEG_MAGIC)) return pdf.embedJpg(bytes);
  throw new Error("loadImage: unsupported format — only PNG and JPEG are recognized.");
}

/**
 * Embed a TTF/OTF font into the PDF. Accepts an HTTP URL, raw bytes, or an
 * `ArrayBuffer`. Returns the same `PDFFont` you'd get from
 * `pdf.embedFont(bytes)` — plug it into any `text({ font })`.
 *
 * @example
 *   const inter = await embedFont(pdf, {
 *     source: "https://example.com/Inter-Regular.ttf"
 *   });
 *   text("Hi", { size: 14, font: inter });
 */
export async function embedFont(
  pdf: PDFDocument,
  options: { source: AssetSource; subset?: boolean }
): Promise<PDFFont> {
  const bytes = await readSource(options.source);
  // Custom fonts require fontkit; dynamic-imported so it only loads when this
  // helper is actually called (keeps the boxpdf core bundle slim for users
  // who only use the built-in StandardFonts).
  const fontkitMod = (await import("@pdf-lib/fontkit")) as unknown as { default?: unknown };
  const fontkit = fontkitMod.default ?? fontkitMod;
  pdf.registerFontkit(fontkit as Parameters<typeof pdf.registerFontkit>[0]);
  return pdf.embedFont(bytes, { subset: options.subset ?? true });
}
