import {
  LCAT,
  MAP_TO_NOTHING,
  NON_ASCII_SPACE,
  PROHIBITED,
  RANDAL,
  UNASSIGNED
} from "./saslprep-tables.js";
import { PdfEncryptionError } from "./types.js";

function inRanges(codePoint: number, ranges: readonly number[]): boolean {
  let low = 0;
  let high = ranges.length / 2 - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const start = ranges[middle * 2]!;
    const end = ranges[middle * 2 + 1]!;
    if (codePoint < start) high = middle - 1;
    else if (codePoint > end) low = middle + 1;
    else return true;
  }
  return false;
}

function invalidPassword(message: string): PdfEncryptionError {
  return new PdfEncryptionError("INVALID_PASSWORD", message);
}

export function preparePassword(value: string, field = "password"): Uint8Array {
  let mapped = "";
  for (const char of value) {
    const codePoint = char.codePointAt(0)!;
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      throw invalidPassword(`${field} contains an unpaired Unicode surrogate`);
    }
    if (inRanges(codePoint, MAP_TO_NOTHING)) continue;
    mapped += inRanges(codePoint, NON_ASCII_SPACE) ? " " : char;
  }

  const prepared = mapped.normalize("NFKC");
  const codePoints = Array.from(prepared, (char) => char.codePointAt(0)!);
  let hasRandAL = false;
  let hasLCat = false;
  for (const codePoint of codePoints) {
    if (inRanges(codePoint, UNASSIGNED)) {
      throw invalidPassword(`${field} contains a Unicode 3.2-unassigned code point`);
    }
    if (inRanges(codePoint, PROHIBITED)) {
      throw invalidPassword(`${field} contains a prohibited SASLprep code point`);
    }
    hasRandAL ||= inRanges(codePoint, RANDAL);
    hasLCat ||= inRanges(codePoint, LCAT);
  }

  if (
    hasRandAL &&
    (hasLCat ||
      codePoints.length === 0 ||
      !inRanges(codePoints[0]!, RANDAL) ||
      !inRanges(codePoints[codePoints.length - 1]!, RANDAL))
  ) {
    throw invalidPassword(`${field} violates the SASLprep bidirectional-text rule`);
  }

  const bytes = new TextEncoder().encode(prepared);
  if (bytes.length === 0) {
    throw invalidPassword(`${field} must not be empty after SASLprep`);
  }
  if (bytes.length > 127) {
    throw new PdfEncryptionError(
      "PASSWORD_TOO_LONG",
      `${field} must be at most 127 UTF-8 bytes after SASLprep`
    );
  }
  return bytes;
}

export function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left[index]! ^ right[index]!;
  }
  return difference === 0;
}
