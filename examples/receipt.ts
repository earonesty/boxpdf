import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { flex, hex, hline, hstack, renderFlow, text, vstack, type Node } from "../src/index.js";

const items = [
  { name: "Wool socks", qty: 2, unit: 14, total: 28 },
  { name: "Coffee mug", qty: 1, unit: 18, total: 18 },
  { name: "Notebook (A5)", qty: 3, unit: 9, total: 27 }
];

const subtotal = items.reduce((sum, item) => sum + item.total, 0);
const tax = subtotal * 0.0875;
const total = subtotal + tax;

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const ink = hex("#15171a");
const muted = hex("#6b7280");
const border = hex("#e5e7eb");

// All money rows share these column dimensions so every dollar amount lands
// in the same right-aligned column, and the qty×unit / labels share theirs.
const TABLE_WIDTH = 515;
const TABLE_PAD = 16;
const INNER_WIDTH = TABLE_WIDTH - TABLE_PAD * 2;
const COL_GAP = 16;
const LABEL_WIDTH = 100;
const AMOUNT_WIDTH = 80;

const header = vstack(
  { gap: 6 },
  text("Acme Supply Co.", { size: 22, font: bold, color: ink }),
  text("Receipt · Order #18472 · May 14, 2026", { size: 10, font, color: muted })
);

const itemRow = (name: string, qty: number, unit: number, totalAmount: number): Node =>
  hstack(
    { width: INNER_WIDTH, gap: COL_GAP, padding: { top: 6, bottom: 6 } },
    text(name, { size: 11, font, color: ink, width: INNER_WIDTH - LABEL_WIDTH - AMOUNT_WIDTH - COL_GAP * 2 }),
    text(`${qty} × $${unit.toFixed(2)}`, {
      size: 11,
      font,
      color: muted,
      align: "right",
      width: LABEL_WIDTH
    }),
    text(`$${totalAmount.toFixed(2)}`, {
      size: 11,
      font: bold,
      color: ink,
      align: "right",
      width: AMOUNT_WIDTH
    })
  );

const itemsTable = vstack(
  {
    width: TABLE_WIDTH,
    padding: TABLE_PAD,
    border: { color: border, width: 1 },
    borderRadius: 6
  },
  ...items.flatMap((item, i) => {
    const row = itemRow(item.name, item.qty, item.unit, item.total);
    return i === 0 ? [row] : [hline({ color: border }), row];
  })
);

const totalsRow = (label: string, amount: number, isBold = false): Node => {
  const labelFont = isBold ? bold : font;
  return hstack(
    { width: INNER_WIDTH, gap: COL_GAP, padding: { top: 4, bottom: 4 } },
    flex(),
    text(label, { size: 11, font: labelFont, color: ink, align: "right", width: LABEL_WIDTH }),
    text(`$${amount.toFixed(2)}`, {
      size: 11,
      font: labelFont,
      color: ink,
      align: "right",
      width: AMOUNT_WIDTH
    })
  );
};

const totals = vstack(
  {
    width: TABLE_WIDTH,
    padding: { top: 4, right: TABLE_PAD, bottom: 4, left: TABLE_PAD },
    margin: { top: 16 }
  },
  totalsRow("Subtotal", subtotal),
  totalsRow("Tax (8.75%)", tax),
  hline({ color: border, margin: { top: 6, bottom: 6 } }),
  totalsRow("Total", total, true)
);

await renderFlow(
  doc,
  [
    header,
    hline({ color: border, margin: { top: 16, bottom: 16 } }),
    itemsTable,
    totals,
    text("Thanks for your business.", { size: 10, font, color: muted, margin: { top: 24 } })
  ],
  { margin: 40 }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/receipt.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/receipt.pdf (${bytes.byteLength} bytes)`);
