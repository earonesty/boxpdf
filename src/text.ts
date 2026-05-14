import type { PDFFont } from "pdf-lib";

export function fontAscent(font: PDFFont, size: number): number {
  return font.heightAtSize(size, { descender: false });
}

export function fontLineHeight(font: PDFFont, size: number): number {
  return font.heightAtSize(size, { descender: true });
}

export function measureText(font: PDFFont, size: number, value: string): number {
  return font.widthOfTextAtSize(value, size);
}

/**
 * Wrap text into lines that fit within `maxWidth`, breaking on whitespace where
 * possible. Words that exceed maxWidth on their own are hard-broken at the
 * character that overflows.
 */
export function wrapText(font: PDFFont, size: number, value: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [value];
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
      const width = measureText(font, size, candidate);
      if (width <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current.length > 0) {
        lines.push(current.replace(/\s+$/, ""));
        current = word.replace(/^\s+/, "");
        if (measureText(font, size, current) <= maxWidth) continue;
      }
      // current is empty or the single word is too wide; hard-break by char
      const hardBroken = hardBreak(font, size, current.length > 0 ? current : word, maxWidth);
      lines.push(...hardBroken.slice(0, -1));
      const tail = hardBroken[hardBroken.length - 1];
      current = tail ?? "";
    }
    if (current.length > 0) lines.push(current);
  }
  return lines.length === 0 ? [""] : lines;
}

function hardBreak(font: PDFFont, size: number, value: string, maxWidth: number): string[] {
  const out: string[] = [];
  let current = "";
  for (const char of value) {
    const next = current + char;
    if (measureText(font, size, next) > maxWidth && current.length > 0) {
      out.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  out.push(current);
  return out;
}

export function ellipsize(font: PDFFont, size: number, value: string, maxWidth: number): string {
  if (measureText(font, size, value) <= maxWidth) return value;
  const ellipsis = "…";
  const ellipsisWidth = measureText(font, size, ellipsis);
  if (ellipsisWidth > maxWidth) return "";
  let lo = 0;
  let hi = value.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (measureText(font, size, value.slice(0, mid)) + ellipsisWidth <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return value.slice(0, lo) + ellipsis;
}
