import type { PDFFont } from "pdf-lib";
import { hex } from "../colors.js";
import type { Theme } from "../theme.js";

/**
 * Classic book / magazine typography: serif body, warm off-white surface,
 * generous leading, no card rounding, large display headings. Inspired by
 * Garamond / Caslon trade-paperback typesetting.
 *
 * Best for: resumes, cover letters, white papers, reading-heavy reports,
 * literary or formal documents.
 *
 * Pair with `StandardFonts.TimesRoman` + `TimesRomanBold`, optionally
 * also `TimesRomanItalic` for the italic slot (used by captions and any
 * `text({ font: theme.italic, ... })` in your templates).
 */
export function editorialTheme(
  font: PDFFont,
  bold: PDFFont,
  italic?: PDFFont
): Theme {
  const ink = hex("#1c1611");
  const inkSoft = hex("#3d3327");
  const muted = hex("#7a6e63");
  const accent = hex("#8b1d1d"); // burnt red, like book chapter rules
  const surface = hex("#fdfbf6");
  const surfaceMuted = hex("#f4efe6");
  const border = hex("#d6cfc4");
  const borderStrong = hex("#a89e90");
  const success = hex("#385c2b");
  const danger = hex("#8b1d1d");

  return {
    font,
    bold,
    italic,
    colors: {
      ink,
      muted,
      accent,
      surface,
      surfaceMuted,
      border,
      borderStrong,
      success,
      danger
    },
    spacing: {
      xs: 5,
      sm: 10,
      md: 16,
      lg: 24,
      xl: 36,
      xxl: 56
    },
    radii: {
      none: 0,
      sm: 0,
      md: 0,
      lg: 0
    },
    type: {
      display: { size: 36, font: bold, color: ink, lineHeight: 42 },
      h1: { size: 24, font: bold, color: ink, lineHeight: 30 },
      h2: { size: 16, font: bold, color: ink, lineHeight: 22 },
      h3: { size: 12, font: bold, color: inkSoft, lineHeight: 17 },
      body: { size: 11, font, color: ink, lineHeight: 17 },
      bodySmall: { size: 10, font, color: inkSoft, lineHeight: 15 },
      caption: {
        size: 9,
        font: italic ?? font,
        color: muted,
        lineHeight: 13
      },
      label: { size: 9, font: bold, color: muted, lineHeight: 13 }
    },
    card: {
      padding: 24,
      background: surfaceMuted,
      // No border — editorial cards use background tone alone for separation.
      borderRadius: 0
    },
    hr: { color: border, thickness: 0.75 }
  };
}
