import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderFlow, text, vstack } from "../src/index.js";

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

const header = vstack(
  { gap: 6 },
  text("Acme Supply Co.", { size: 22, font: bold, color: ink }),
  text("Receipt · Order #18472 · May 14, 2026", { size: 10, font, color: muted })
);

const itemRow = (name: string, qty: number, unit: number, totalAmount: number) =>
  hstack(
    { justify: "between", padding: { top: 8, bottom: 8 }, width: 515 },
    text(name, { size: 11, font, color: ink, width: 280 }),
    text(`${qty} × $${unit.toFixed(2)}`, { size: 11, font, color: muted, align: "right", width: 110 }),
    text(`$${totalAmount.toFixed(2)}`, { size: 11, font: bold, color: ink, align: "right", width: 80 })
  );

const itemsTable = vstack(
  { gap: 0, border: { color: border, width: 1 }, padding: { left: 12, right: 12 } },
  ...items.flatMap((item, i) => {
    const row = itemRow(item.name, item.qty, item.unit, item.total);
    return i === 0 ? [row] : [hline({ color: border }), row];
  })
);

const totals = vstack(
  { gap: 4, width: 515 },
  hstack(
    { justify: "end", gap: 32 },
    text("Subtotal", { size: 10, font, color: muted }),
    text(`$${subtotal.toFixed(2)}`, { size: 10, font, color: ink, align: "right", width: 80 })
  ),
  hstack(
    { justify: "end", gap: 32 },
    text("Tax (8.75%)", { size: 10, font, color: muted }),
    text(`$${tax.toFixed(2)}`, { size: 10, font, color: ink, align: "right", width: 80 })
  ),
  hline({ color: border, margin: { top: 6, bottom: 6 } }),
  hstack(
    { justify: "end", gap: 32 },
    text("Total", { size: 14, font: bold, color: ink }),
    text(`$${total.toFixed(2)}`, { size: 14, font: bold, color: ink, align: "right", width: 80 })
  )
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
