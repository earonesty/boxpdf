import type { PDFFont } from "pdf-lib";
import { hex } from "../colors.js";
import type { Theme } from "../theme.js";

/**
 * Neobrutalist aesthetic: monospace everywhere, 2-pt solid black borders,
 * zero rounding, a hot accent (lemon-yellow), pure-white surfaces. Section
 * labels are designed to be set in ALL CAPS by the template author.
 *
 * Best for: indie/dev-facing docs, dev portfolios, indie SaaS receipts,
 * "designed-on-purpose-to-look-rough" branding.
 *
 * Pair with `StandardFonts.Courier` + `StandardFonts.CourierBold`. The
 * theme assigns the same Courier font everywhere — there's no separate
 * sans — to commit to the look.
 */
export function brutalistTheme(mono: PDFFont, monoBold: PDFFont): Theme {
  const ink = hex("#000000");
  const inkSoft = hex("#000000");
  const muted = hex("#000000");
  const accent = hex("#ffeb00"); // lemon yellow
  const surface = hex("#ffffff");
  const surfaceMuted = hex("#f5f5f5");
  const border = hex("#000000");
  const borderStrong = hex("#000000");
  const success = hex("#008000");
  const danger = hex("#ff0033");

  return {
    font: mono,
    bold: monoBold,
    mono,
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
      md: 14,
      lg: 22,
      xl: 32,
      xxl: 48
    },
    radii: {
      none: 0,
      sm: 0,
      md: 0,
      lg: 0
    },
    type: {
      display: { size: 28, font: monoBold, color: ink, lineHeight: 34 },
      h1: { size: 18, font: monoBold, color: ink, lineHeight: 24 },
      h2: { size: 13, font: monoBold, color: ink, lineHeight: 18 },
      h3: { size: 11, font: monoBold, color: ink, lineHeight: 15 },
      body: { size: 10, font: mono, color: ink, lineHeight: 14 },
      bodySmall: { size: 9, font: mono, color: ink, lineHeight: 13 },
      caption: { size: 8, font: mono, color: ink, lineHeight: 12 },
      label: { size: 8, font: monoBold, color: ink, lineHeight: 12 },
      mono: { size: 10, font: mono, color: ink, lineHeight: 14 }
    },
    card: {
      padding: 16,
      background: surface,
      border: { color: ink, width: 2 },
      borderRadius: 0
    },
    hr: { color: ink, thickness: 1.5 }
  };
}
