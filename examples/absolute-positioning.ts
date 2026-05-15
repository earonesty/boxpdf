import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderFlow, text, vstack } from "../src/index.js";

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const ink = hex("#172026");
const muted = hex("#667085");
const border = hex("#cbd5e1");
const panel = hex("#f8fafc");
const accent = hex("#0f766e");
const accentSoft = hex("#ccfbf1");
const warn = hex("#b45309");
const warnSoft = hex("#fef3c7");

const paidStamp = hstack(
  {
    position: "absolute",
    top: 16,
    right: 16,
    width: 84,
    height: 36,
    padding: { right: 8, left: 8 },
    border: { color: accent, width: 1.5 },
    background: accentSoft,
    borderRadius: 6,
    align: "center"
  },
  text("PAID", {
    size: 15,
    font: bold,
    color: accent,
    width: 68,
    align: "center"
  })
);

const nestedPin = vstack(
  {
    position: "absolute",
    left: 22,
    bottom: 18,
    width: 185,
    height: 54,
    padding: 8,
    background: warnSoft,
    border: { color: warn, width: 1 },
    borderRadius: 6,
    gap: 4
  },
  text("Nested positioned box", { size: 9, font: bold, color: warn }),
  text("This box also contains an absolute child.", {
    size: 8,
    font,
    color: ink,
    width: 165,
    lineHeight: 9
  }),
  hstack(
    {
      position: "absolute",
      top: 8,
      right: 8,
      width: 24,
      height: 22,
      background: warn,
      borderRadius: 4,
      align: "center"
    },
    text("!", { size: 12, font: bold, color: hex("#ffffff"), width: 24, align: "center" })
  )
);

const fullWidthRule = vstack(
  {
    position: "absolute",
    left: 22,
    right: 22,
    top: 124,
    bottom: 78,
    gap: 5
  },
  hline({ color: accent, thickness: 2 }),
  text("Stretched by left + right, no explicit width", {
    size: 8,
    font,
    color: muted,
    width: 320
  })
);

const card = vstack(
  {
    position: "relative",
    width: 430,
    height: 220,
    padding: 22,
    margin: { top: 16 },
    background: panel,
    border: { color: border, width: 1 },
    borderRadius: 8,
    gap: 8
  },
  text("Invoice #1042", { size: 20, font: bold, color: ink }),
  text("Normal flow content stays in the stack. Absolute boxes are rendered after it.", {
    size: 10,
    font,
    color: muted,
    width: 250,
    lineHeight: 12
  }),
  hstack(
    { gap: 8, margin: { top: 8 } },
    vstack(
      { width: 120, padding: 10, background: hex("#ffffff"), border: { color: border, width: 1 } },
      text("Subtotal", { size: 9, font, color: muted }),
      text("$128.00", { size: 15, font: bold, color: ink })
    ),
    vstack(
      { width: 120, padding: 10, background: hex("#ffffff"), border: { color: border, width: 1 } },
      text("Status", { size: 9, font, color: muted }),
      text("Settled", { size: 15, font: bold, color: accent })
    )
  ),
  paidStamp,
  fullWidthRule,
  nestedPin
);

const heading = text("Absolute positioning debug", { size: 18, font: bold, color: ink });
const note = text(
  "Debug outlines are enabled. The parent is relative; the PAID stamp uses top/right, the rule stretches with left/right, and the yellow panel contains a nested absolute badge.",
  { size: 9, font, color: muted, width: 430, lineHeight: 11 }
);

await renderFlow(doc, [heading, note, card], { margin: 48, debug: true });
const bytes = await doc.save();
writeFileSync(new URL("../fixtures/absolute-positioning.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/absolute-positioning.pdf (${bytes.byteLength} bytes)`);
