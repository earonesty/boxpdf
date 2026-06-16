import type { PDFFont } from "pdf-lib";
import { hex } from "../colors.js";
import { resolveThemeFonts, type Theme, type ThemeFonts } from "../theme.js";

/**
 * Modern SaaS receipt/invoice aesthetic, modeled after Stripe's hosted
 * invoice and email-receipt design language: nearly all white surfaces,
 * thin gray borders with **square corners** on tabular blocks, monochrome
 * ink with Stripe's signature purple used sparingly as accent.
 *
 * Best for: receipts, invoices, statements, subscription confirmations,
 * billing emails — anything where the customer expects "a clean SaaS
 * company sent me this."
 *
 * Pair with `StandardFonts.Helvetica` + `HelveticaBold`, or for the
 * authentic experience embed Inter (open-source, SIL OFL) via
 * `embedFont`.
 */
export function stripeTheme(fonts: ThemeFonts): Theme;
export function stripeTheme(font: PDFFont, bold: PDFFont): Theme;
export function stripeTheme(fontOrFonts: PDFFont | ThemeFonts, boldFont?: PDFFont): Theme {
  const { font, bold } = resolveThemeFonts(fontOrFonts, boldFont);
  const ink = hex("#1a1a1a");
  const inkSoft = hex("#3c4257");
  const muted = hex("#697386");
  const accent = hex("#635bff"); // Stripe purple
  const surface = hex("#ffffff");
  const surfaceMuted = hex("#f6f9fc");
  const border = hex("#e3e8ee");
  const borderStrong = hex("#c1c9d2");
  const success = hex("#0e6245");
  const danger = hex("#a41c4e");

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
      lg: 20,
      xl: 32,
      xxl: 48
    },
    radii: {
      // Stripe tables/cards use SQUARE corners deliberately.
      none: 0,
      sm: 0,
      md: 0,
      lg: 4
    },
    type: {
      display: { size: 28, font: bold, color: ink, lineHeight: 34 },
      h1: { size: 20, font: bold, color: ink, lineHeight: 26 },
      h2: { size: 14, font: bold, color: ink, lineHeight: 18 },
      h3: { size: 11, font: bold, color: inkSoft, lineHeight: 15 },
      body: { size: 10, font, color: ink, lineHeight: 14 },
      bodySmall: { size: 9, font, color: inkSoft, lineHeight: 13 },
      caption: { size: 8, font, color: muted, lineHeight: 11 },
      label: { size: 8, font: bold, color: muted, lineHeight: 11 }
    },
    card: {
      padding: 20,
      background: surface,
      border: { color: border, width: 1 },
      borderRadius: 0
    },
    hr: { color: border, thickness: 1 }
  };
}
