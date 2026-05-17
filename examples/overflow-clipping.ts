import { readFileSync, writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  hex,
  imageFit,
  loadImage,
  renderFlow,
  text,
  vstack
} from "../src/index.js";

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const photo = await loadImage(pdf, readFileSync(new URL("../html/fixtures/background-source.png", import.meta.url)));

const ink = hex("#111827");
const muted = hex("#4b5563");
const border = hex("#94a3b8");
const red = hex("#b91c1c");
const redSoft = hex("#fee2e2");
const blue = hex("#1d4ed8");

const doc = vstack(
  {
    width: 500,
    padding: 24,
    gap: 16,
    border: { color: border, width: 1 },
    borderRadius: 8,
    background: hex("#f8fafc")
  },
  text("Overflow clipping", { size: 20, font: bold, color: ink }),
  text("The red badge and oversized background image are clipped to their boxes.", {
    size: 11,
    font,
    color: muted,
    width: 430
  }),
  vstack(
    {
      width: 210,
      height: 118,
      overflow: "hidden",
      position: "relative",
      border: { color: blue, width: 1 },
      borderRadius: 8,
      backgroundImage: {
        image: photo,
        width: 260,
        height: 146,
        offsetX: -24,
        offsetY: -14,
        repeat: "no-repeat"
      }
    },
    vstack(
      {
        position: "absolute",
        right: -16,
        top: 12,
        width: 86,
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
        background: redSoft,
        border: { color: red, width: 1 },
        borderRadius: 5
      },
      text("CLIPPED", { size: 10, font: bold, color: red, align: "center", width: 70 })
    )
  ),
  imageFit(photo, { width: 210, height: 80, fit: "cover" })
);

await renderFlow(pdf, [doc], { margin: 48, debug: true });
const bytes = await pdf.save();
writeFileSync(new URL("../fixtures/overflow-clipping.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/overflow-clipping.pdf (${bytes.byteLength} bytes)`);
