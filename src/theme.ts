import type { PDFFont } from "pdf-lib";
import type { BoxStyle, RGB, TextProps } from "./types.js";

/**
 * Public-facing TextOptions shape (mirrors the one in nodes.ts but exported
 * so theme builders can return ready-to-use option blobs).
 */
export interface ThemedTextStyle {
  size: number;
  font: PDFFont;
  color?: RGB;
  align?: "left" | "center" | "right";
  width?: number;
  lineHeight?: number;
  maxLines?: number;
  underline?: boolean;
  strikethrough?: boolean;
}

export interface ThemeColors {
  ink: RGB;
  muted: RGB;
  accent: RGB;
  surface: RGB;
  surfaceMuted: RGB;
  border: RGB;
  borderStrong: RGB;
  success: RGB;
  danger: RGB;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  none: number;
  sm: number;
  md: number;
  lg: number;
}

export interface ThemeType {
  display: ThemedTextStyle;
  h1: ThemedTextStyle;
  h2: ThemedTextStyle;
  h3: ThemedTextStyle;
  body: ThemedTextStyle;
  bodySmall: ThemedTextStyle;
  caption: ThemedTextStyle;
  label: ThemedTextStyle;
  /** "Tabular numerals would be nice here" — for money columns etc. */
  mono?: ThemedTextStyle;
}

/**
 * A theme bundles every reusable visual token: colors, type scale, spacing
 * scale, corner radii, and a couple of pre-baked container styles (card, hr).
 * Templates compose these without picking individual hex/size literals.
 */
export interface Theme {
  /** The base font (regular weight) used by body styles. */
  font: PDFFont;
  /** The bold font used by headings and emphasis. */
  bold: PDFFont;
  /** Italic font, used for editorial captions and emphasis where the theme calls for it. */
  italic?: PDFFont;
  /** Optional monospace font; some themes ship one, others leave it undefined. */
  mono?: PDFFont;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  type: ThemeType;
  /** Reusable card container — padding + surface fill + border + radius. */
  card: BoxStyle;
  /** Reusable thin divider — color + thickness. */
  hr: { color: RGB; thickness: number };
}

/**
 * The fonts a theme needs. Pass this object to any theme factory instead of
 * positional `(font, bold, italic?)` arguments — it plugs straight into the
 * result of `standardFonts(pdf)` or `embedInter(pdf)`:
 *
 * @example
 *   const theme = cleanTheme(await standardFonts(pdf));
 *   const theme = editorialTheme(await standardFonts(pdf, "times"));
 */
export interface ThemeFonts {
  font: PDFFont;
  bold: PDFFont;
  italic?: PDFFont;
}

/**
 * Normalize a theme factory's font arguments. Accepts either a single
 * {@link ThemeFonts} object (the preferred form) or the legacy positional
 * `(font, bold, italic?)` arguments, so both call styles keep working.
 */
export function resolveThemeFonts(
  fontOrFonts: PDFFont | ThemeFonts,
  bold?: PDFFont,
  italic?: PDFFont
): ThemeFonts {
  if (isThemeFonts(fontOrFonts)) return fontOrFonts;
  if (!bold) {
    throw new Error("Theme factory needs a bold font: pass `(font, bold)` or `{ font, bold }`.");
  }
  return { font: fontOrFonts, bold, italic };
}

function isThemeFonts(value: PDFFont | ThemeFonts): value is ThemeFonts {
  return typeof value === "object" && value !== null && "font" in value && "bold" in value;
}

/**
 * Helper TextProps converter — themes return ready-to-spread `TextOptions`,
 * but internally TextProps requires `align` to be present. This is just for
 * library-side use when composing themed text manually.
 */
export function styleToProps(style: ThemedTextStyle): TextProps {
  return {
    size: style.size,
    font: style.font,
    color: style.color,
    align: style.align ?? "left",
    width: style.width,
    lineHeight: style.lineHeight,
    maxLines: style.maxLines,
    underline: style.underline,
    strikethrough: style.strikethrough
  };
}
