// Copy-paste template: a single-page boarding pass.
//
// Substitute your own passenger / flight / barcode source. Designed at
// A4 portrait with a card occupying the upper portion. The "barcode" at
// the bottom is a placeholder black bar — drop a real QR/Aztec/PDF417
// image in via `image()` for real-world use.

import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  cleanTheme,
  hline,
  hstack,
  renderFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

const flight = {
  airlineName: "Onward Travel",
  passenger: "Paula Andrea Ruiz Gomez",
  pnr: "CHTALI",
  flightNumber: "OT 482",
  date: "23 JUL 2026",
  fromCity: "Hanoi",
  fromCode: "HAN",
  fromTerminal: "Terminal 2",
  toCity: "Tokyo",
  toCode: "NRT",
  toTerminal: "Terminal 2",
  departureTime: "17:01",
  boardingTime: "16:25",
  gate: "B07",
  seat: "14A",
  class: "Economy"
};

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);

const PAGE_INNER = 515;
const SIDE_PAD = theme.spacing.xl;
const INNER = PAGE_INNER - SIDE_PAD * 2;
const WHITE = { r: 1, g: 1, b: 1 };

const labelValue = (label: string, value: string, width: number): Node =>
  vstack(
    { gap: 2, width },
    text(label.toUpperCase(), { ...theme.type.label, color: theme.colors.muted, width }),
    text(value, { ...theme.type.body, font: bold, color: theme.colors.ink, width })
  );

const heroValue = (label: string, value: string, width: number): Node =>
  vstack(
    { gap: 2, width },
    text(label.toUpperCase(), { ...theme.type.label, color: theme.colors.muted, width }),
    text(value, { ...theme.type.h1, color: theme.colors.ink, width })
  );

// Top ribbon
const ribbon: Node = hstack(
  {
    width: PAGE_INNER,
    padding: { top: theme.spacing.md, right: SIDE_PAD, bottom: theme.spacing.md, left: SIDE_PAD },
    background: theme.colors.ink,
    justify: "between"
  },
  text(flight.airlineName, { ...theme.type.h2, color: WHITE }),
  text("BOARDING PASS", { ...theme.type.label, color: WHITE })
);

// Big route
const routeBlock: Node = hstack(
  { width: INNER, justify: "between", padding: { top: theme.spacing.lg, bottom: theme.spacing.lg } },
  vstack(
    { gap: 2, width: 140 },
    text(flight.fromCity, { ...theme.type.body, color: theme.colors.muted, width: 140 }),
    text(flight.fromCode, { ...theme.type.display, color: theme.colors.ink, width: 140 }),
    text(flight.fromTerminal, { ...theme.type.caption, width: 140 })
  ),
  vstack(
    { gap: 6, width: 100, padding: { top: 18 } },
    hline({ color: theme.colors.borderStrong, thickness: 1, width: 100 }),
    text(flight.flightNumber, { ...theme.type.body, font: bold, align: "center", width: 100 })
  ),
  vstack(
    { gap: 2, width: 140 },
    text(flight.toCity, { ...theme.type.body, color: theme.colors.muted, align: "right", width: 140 }),
    text(flight.toCode, { ...theme.type.display, color: theme.colors.ink, align: "right", width: 140 }),
    text(flight.toTerminal, { ...theme.type.caption, align: "right", width: 140 })
  )
);

// Passenger / PNR / Date / Class info row (compact body-size)
const COL1_GAP = 14;
const passengerW = 200;
const pnrW = 70;
const dateW = 90;
const classW = INNER - passengerW - pnrW - dateW - COL1_GAP * 3;

const infoRow: Node = hstack(
  { width: INNER, gap: COL1_GAP, padding: { top: theme.spacing.md, bottom: theme.spacing.md } },
  labelValue("Passenger", flight.passenger, passengerW),
  labelValue("PNR", flight.pnr, pnrW),
  labelValue("Date", flight.date, dateW),
  labelValue("Class", flight.class, classW)
);

// The four hero stats: boarding / departs / gate / seat
const COL2_GAP = 14;
const heroW = (INNER - COL2_GAP * 3) / 4;
const heroRow: Node = hstack(
  { width: INNER, gap: COL2_GAP, padding: { top: theme.spacing.md, bottom: theme.spacing.md } },
  heroValue("Boarding", flight.boardingTime, heroW),
  heroValue("Departs", flight.departureTime, heroW),
  heroValue("Gate", flight.gate, heroW),
  heroValue("Seat", flight.seat, heroW)
);

// Faux barcode strip — replace with `image(qrPdfImage, { width: INNER, height: 60 })`
const barcode: Node = vstack(
  { width: INNER, padding: { top: theme.spacing.md, bottom: theme.spacing.md } },
  vstack({ width: INNER, height: 48, background: theme.colors.ink, borderRadius: 0 }),
  text("SCAN AT GATE", {
    ...theme.type.label,
    color: theme.colors.muted,
    align: "center",
    width: INNER,
    margin: { top: 6 }
  })
);

const card: Node = vstack(
  {
    width: PAGE_INNER,
    border: { color: theme.colors.borderStrong, width: 1.5 },
    borderRadius: theme.radii.lg
  },
  ribbon,
  hstack(
    { padding: { left: SIDE_PAD, right: SIDE_PAD } },
    vstack(
      { width: INNER },
      routeBlock,
      hline({ ...theme.hr, color: theme.colors.border }),
      infoRow,
      hline({ ...theme.hr, color: theme.colors.border }),
      heroRow,
      hline({ ...theme.hr, color: theme.colors.border }),
      barcode
    )
  )
);

await renderFlow(
  doc,
  [
    text("Boarding pass", { ...theme.type.caption, margin: { bottom: theme.spacing.sm } }),
    card,
    text("Arrive at the gate at least 30 minutes before departure. ID required at every checkpoint.", {
      ...theme.type.caption,
      width: PAGE_INNER,
      margin: { top: theme.spacing.lg }
    })
  ],
  {
    margin: theme.spacing.xxl,
    title: `Boarding pass — ${flight.pnr}`,
    author: flight.airlineName,
    creator: "boxpdf",
    producer: "boxpdf"
  }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/boarding-pass.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/boarding-pass.pdf (${bytes.byteLength} bytes)`);
