import type { PDFFont } from "pdf-lib";

export function fontAscent(font: PDFFont, size: number): number {
  return font.heightAtSize(size, { descender: false });
}

export function fontLineHeight(font: PDFFont, size: number): number {
  return font.heightAtSize(size, { descender: true });
}

export function fontDescent(font: PDFFont, size: number): number {
  return fontLineHeight(font, size) - fontAscent(font, size);
}

export function fontLineMetrics(
  font: PDFFont,
  size: number,
  lineHeight = fontLineHeight(font, size)
): { ascent: number; descent: number } {
  const ascent = fontAscent(font, size);
  const descent = fontDescent(font, size);
  const leading = lineHeight - ascent - descent;
  return {
    ascent: ascent + leading / 2,
    descent: descent + leading / 2
  };
}

export function fontXHeight(font: PDFFont, size: number): number {
  const embedder = (font as unknown as { embedder?: FontkitEmbedder }).embedder;
  const fontkitXHeight = embedder?.font?.xHeight;
  if (typeof fontkitXHeight === "number" && typeof embedder?.font?.unitsPerEm === "number") {
    return (fontkitXHeight / embedder.font.unitsPerEm) * size;
  }
  const standardXHeight = (embedder?.font as { XHeight?: unknown } | undefined)?.XHeight;
  if (typeof standardXHeight === "number") return (standardXHeight / 1000) * size;
  return fontAscent(font, size) * 0.5;
}

export function measureText(font: PDFFont, size: number, value: string): number {
  return font.widthOfTextAtSize(value, size);
}

export function measureTextSpaced(
  font: PDFFont,
  size: number,
  value: string,
  letterSpacing = 0
): number {
  return measureText(font, size, value) + letterSpacing * Math.max(0, value.length - 1);
}

type FontkitEmbedder = {
  font?: {
    unitsPerEm?: number;
    xHeight?: number;
  };
};

/**
 * Wrap text into lines that fit within `maxWidth`, breaking on whitespace where
 * possible. Words that exceed maxWidth on their own are hard-broken at the
 * character that overflows.
 */
export function wrapText(
  font: PDFFont,
  size: number,
  value: string,
  maxWidth: number,
  options: { wrap?: boolean; letterSpacing?: number } = {}
): string[] {
  if (maxWidth <= 0) return [value];
  if (options.wrap === false) return value.split(/\r?\n/);
  const letterSpacing = options.letterSpacing ?? 0;
  const lines: string[] = [];
  for (const paragraph of value.split(/\r?\n/)) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/(\s+)/).filter((part) => part.length > 0);
    let current = "";
    for (const word of words) {
      const candidate = current + word;
      const width = measureTextSpaced(font, size, candidate, letterSpacing);
      if (width <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current.length > 0) {
        lines.push(current.replace(/\s+$/, ""));
        current = word.replace(/^\s+/, "");
        if (measureTextSpaced(font, size, current, letterSpacing) <= maxWidth) continue;
      }
      // current is empty or the single word is too wide; hard-break by char
      const hardBroken = hardBreak(font, size, current.length > 0 ? current : word, maxWidth, letterSpacing);
      lines.push(...hardBroken.slice(0, -1));
      const tail = hardBroken[hardBroken.length - 1];
      current = tail ?? "";
    }
    if (current.length > 0) lines.push(current);
  }
  return lines.length === 0 ? [""] : lines;
}

function hardBreak(
  font: PDFFont,
  size: number,
  value: string,
  maxWidth: number,
  letterSpacing: number
): string[] {
  const out: string[] = [];
  let current = "";
  for (const char of value) {
    const next = current + char;
    if (measureTextSpaced(font, size, next, letterSpacing) > maxWidth && current.length > 0) {
      out.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  out.push(current);
  return out;
}

export function ellipsize(
  font: PDFFont,
  size: number,
  value: string,
  maxWidth: number,
  letterSpacing = 0
): string {
  if (measureTextSpaced(font, size, value, letterSpacing) <= maxWidth) return value;
  const ellipsis = "…";
  const ellipsisWidth = measureTextSpaced(font, size, ellipsis, letterSpacing);
  if (ellipsisWidth > maxWidth) return "";
  let lo = 0;
  let hi = value.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (measureTextSpaced(font, size, value.slice(0, mid) + ellipsis, letterSpacing) <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return value.slice(0, lo) + ellipsis;
}
