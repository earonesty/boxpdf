import type { PDFFont } from "pdf-lib";
import { hex } from "../colors.js";
import type { Theme } from "../theme.js";

/**
 * A modern, monochrome theme inspired by the Stripe / Linear / Notion
 * aesthetic. Body type is comfortable, headings have weight without
 * shouting, surfaces are near-white, and borders are gentle.
 *
 * Pass your own embedded fonts so the theme works in any runtime — the
 * library doesn't ship a default TTF on purpose (keeps bundle size honest).
 *
 * @example
 *   import { PDFDocument, StandardFonts } from "pdf-lib";
 *   import { cleanTheme, renderFlow, text, vstack } from "boxpdf";
 *
 *   const pdf = await PDFDocument.create();
 *   const font = await pdf.embedFont(StandardFonts.Helvetica);
 *   const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
 *   const theme = cleanTheme(font, bold);
 *
 *   vstack(theme.card,
 *     text("Statement", theme.type.h1),
 *     text("April 2026",  theme.type.caption)
 *   );
 */
export function cleanTheme(font: PDFFont, bold: PDFFont): Theme {
  const ink = hex("#0f1419");
  const inkSoft = hex("#374151");
  const muted = hex("#6b7280");
  const accent = hex("#2563eb");
  const surface = hex("#fafbfc");
  const surfaceMuted = hex("#f3f4f6");
  const border = hex("#e5e7eb");
  const borderStrong = hex("#d1d5db");
  const success = hex("#15803d");
  const danger = hex("#b91c1c");

  return {
    font,
    bold,
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
      xs: 4,
      sm: 8,
      md: 12,
      lg: 18,
      xl: 28,
      xxl: 40
    },
    radii: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 14
    },
    type: {
      display: { size: 32, font: bold, color: ink, lineHeight: 36 },
      h1: { size: 22, font: bold, color: ink, lineHeight: 26 },
      h2: { size: 16, font: bold, color: ink, lineHeight: 20 },
      h3: { size: 13, font: bold, color: inkSoft, lineHeight: 17 },
      body: { size: 11, font, color: ink, lineHeight: 15 },
      bodySmall: { size: 10, font, color: inkSoft, lineHeight: 14 },
      caption: { size: 9, font, color: muted, lineHeight: 12 },
      label: { size: 9, font: bold, color: muted, lineHeight: 12 }
    },
    card: {
      padding: 18,
      background: surface,
      border: { color: border, width: 1 },
      borderRadius: 8
    },
    hr: { color: border, thickness: 1 }
  };
}
