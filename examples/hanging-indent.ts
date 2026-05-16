import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { paragraph, renderFlow, run, text, vstack } from "../src/index.js";

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

const markerWidth = 18;
const body = vstack(
  {
    width: 320,
    padding: 16,
    border: { width: 1, color: { r: 0.58, g: 0.65, b: 0.75 } },
    borderRadius: 8,
    background: { r: 0.97, g: 0.98, b: 0.99 },
    gap: 8
  },
  text("Hanging indent", { size: 18, font: bold }),
  paragraph(
    {
      width: 288,
      paddingLeft: markerWidth,
      textIndent: -markerWidth
    },
    run("•  Wrapped list item with enough text to continue on the next line cleanly.", { size: 12, font })
  ),
  paragraph(
    {
      width: 288,
      paddingLeft: markerWidth,
      textIndent: -markerWidth
    },
    run("1.  Ordered item aligns wrapped text under the content, not under the marker.", { size: 12, font })
  )
);

await renderFlow(pdf, [body], { margin: 40 });
const bytes = await pdf.save();
writeFileSync(new URL("../fixtures/hanging-indent.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/hanging-indent.pdf (${bytes.byteLength} bytes)`);
