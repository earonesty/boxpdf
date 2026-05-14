import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderFlow, text, vstack } from "../src/index.js";

// A small layout rendered twice: once normal, once with the debug overlay
// turned on so every node's content box (red) and margin box (orange) are
// outlined. Use during layout development.

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const ink = hex("#15171a");
const muted = hex("#6b7280");
const border = hex("#e5e7eb");
const surface = hex("#fafbfc");

const card = vstack(
  {
    padding: 16,
    margin: { top: 12 },
    background: surface,
    border: { color: border, width: 1 },
    borderRadius: 8,
    gap: 6
  },
  hstack(
    { justify: "between", width: 515 - 32 },
    text("Statement period", { size: 11, font: bold, color: ink }),
    text("Apr 1 – Apr 30, 2026", { size: 11, font, color: muted })
  ),
  hline({ color: border, margin: { top: 4, bottom: 4 } }),
  text("Account: ****-3210", { size: 10, font, color: muted }),
  text("Available credit: $4,182.00", { size: 10, font, color: ink })
);

const heading = text("Debug overlay demo", { size: 18, font: bold, color: ink });
const note = text(
  "Red outlines are content boxes. Orange outlines are margin boxes. Pass { debug: true } to renderToPdf / renderFlow.",
  { size: 9, font, color: muted, width: 515 }
);

await renderFlow(doc, [heading, note, card], { margin: 40, debug: true });
const bytes = await doc.save();
writeFileSync(new URL("../fixtures/debug.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/debug.pdf (${bytes.byteLength} bytes)`);
