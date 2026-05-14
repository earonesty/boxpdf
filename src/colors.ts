import type { RGB } from "./types.js";

/**
 * Build an RGB color from 0–255 channel values. Easier to read than the
 * default 0–1 representation that pdf-lib uses internally.
 */
export function rgb255(r: number, g: number, b: number): RGB {
  return { r: r / 255, g: g / 255, b: b / 255 };
}

/**
 * Parse a 3- or 6-digit hex color (`#fff`, `#000000`, with or without #).
 */
export function hex(value: string): RGB {
  const clean = value.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  throw new Error(`Invalid hex color: ${value}`);
}

export const Colors = {
  black: hex("#000000"),
  white: hex("#ffffff"),
  ink: hex("#15171a"),
  muted: hex("#6b7280"),
  border: hex("#e5e7eb"),
  surface: hex("#fafbfc")
} as const;
