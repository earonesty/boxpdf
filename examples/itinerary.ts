import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderFlow, spacer, text, vstack, type Node } from "../src/index.js";

interface Leg {
  depTime: string;
  depCode: string;
  depTerminal?: string;
  arrTime: string;
  arrCode: string;
  arrTerminal?: string;
  stops: number;
}

const legs: Leg[] = [
  { depTime: "17:01", depCode: "HAN", arrTime: "00:33", arrCode: "NRT", arrTerminal: "Terminal 2", stops: 0 },
  { depTime: "06:58", depCode: "NRT", depTerminal: "Terminal 2", arrTime: "10:30", arrCode: "HAN", stops: 0 }
];

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const ink = hex("#15171a");
const muted = hex("#6b7280");
const success = hex("#1f8a4d");
const surface = hex("#fafbfc");
const borderColor = hex("#e5e7eb");
const lineColor = hex("#d6d9de");

const buildBand = (leg: Leg): Node => {
  const stopsLabel = leg.stops === 0 ? "Direct" : `${leg.stops} stop${leg.stops > 1 ? "s" : ""}`;
  return vstack(
    {
      width: 515,
      padding: { top: 18, right: 24, bottom: 18, left: 24 },
      background: surface,
      border: { color: borderColor, width: 1 }
    },
    hstack(
      { width: 467, justify: "between" },
      vstack(
        { width: 90, gap: 4 },
        text(leg.depTime, { size: 22, font: bold, color: ink }),
        text(leg.depCode, { size: 17, font: bold, color: ink }),
        leg.depTerminal ? text(leg.depTerminal, { size: 8.5, font, color: muted }) : spacer(0)
      ),
      vstack(
        { width: 240, gap: 6 },
        text(stopsLabel, { size: 10, font: bold, color: muted, align: "center", width: 240 }),
        hline({ color: lineColor, thickness: 1.2, width: 220 })
      ),
      vstack(
        { width: 90, gap: 4 },
        text(leg.arrTime, { size: 22, font: bold, color: ink, align: "right", width: 90 }),
        text(leg.arrCode, { size: 17, font: bold, color: ink, align: "right", width: 90 }),
        leg.arrTerminal ? text(leg.arrTerminal, { size: 8.5, font, color: muted, align: "right", width: 90 }) : spacer(0)
      )
    )
  );
};

const header = vstack(
  { gap: 4 },
  text("Your Itinerary", { size: 14, font: bold, color: ink }),
  hstack(
    { justify: "between", width: 515 },
    text("Hanoi to Tokyo and back", { size: 15, font: bold, color: ink }),
    text("Confirmed", { size: 11, font: bold, color: success })
  ),
  text("Thursday, Jul 23, 2026", { size: 10, font, color: muted, margin: { top: 4 } })
);

const bands = vstack({ gap: 10 }, ...legs.map(buildBand));

await renderFlow(
  doc,
  [header, spacer(18), bands],
  { margin: 40, reserveBottom: 60 }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/itinerary.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/itinerary.pdf (${bytes.byteLength} bytes)`);
