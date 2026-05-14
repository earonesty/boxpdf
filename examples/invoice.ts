import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderFlow, text, vstack, type Node } from "../src/index.js";

interface LineItem { description: string; qty: number; unit: number }

// Generate a deliberately-long invoice to demonstrate multi-page flow.
const items: LineItem[] = Array.from({ length: 80 }, (_, i) => ({
  description: `Service line item #${String(i + 1).padStart(3, "0")} — Engineering hour`,
  qty: 1 + (i % 4),
  unit: 95 + (i % 5) * 5
}));

const subtotal = items.reduce((sum, item) => sum + item.qty * item.unit, 0);
const tax = subtotal * 0.0625;
const total = subtotal + tax;

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const ink = hex("#15171a");
const muted = hex("#6b7280");
const border = hex("#e5e7eb");

const header: Node = vstack(
  { gap: 4 },
  hstack(
    { justify: "between", width: 515 },
    text("INVOICE", { size: 22, font: bold, color: ink }),
    text("#2026-001872", { size: 12, font, color: muted })
  ),
  text("Issued: May 14, 2026", { size: 10, font, color: muted }),
  text("Bill to: Onward Travel, LLC.", { size: 10, font, color: muted, margin: { top: 6 } })
);

const tableHeader = hstack(
  { width: 515, padding: { top: 6, bottom: 6 }, border: { color: border, width: 1 } },
  text("Description", { size: 10, font: bold, color: ink, width: 320, margin: { left: 12 } }),
  text("Qty", { size: 10, font: bold, color: ink, align: "right", width: 50 }),
  text("Unit", { size: 10, font: bold, color: ink, align: "right", width: 60 }),
  text("Amount", { size: 10, font: bold, color: ink, align: "right", width: 60, margin: { right: 12 } })
);

const itemRow = (item: LineItem): Node =>
  hstack(
    { width: 515, padding: { top: 5, bottom: 5 } },
    text(item.description, { size: 10, font, color: ink, width: 320, margin: { left: 12 } }),
    text(String(item.qty), { size: 10, font, color: ink, align: "right", width: 50 }),
    text(`$${item.unit.toFixed(2)}`, { size: 10, font, color: ink, align: "right", width: 60 }),
    text(`$${(item.qty * item.unit).toFixed(2)}`, { size: 10, font, color: ink, align: "right", width: 60, margin: { right: 12 } })
  );

const totalsRow = (label: string, amount: number, weight: "regular" | "bold" = "regular"): Node =>
  hstack(
    { width: 515, padding: { top: 4, bottom: 4 } },
    text("", { size: 10, font, width: 320 }),
    text(label, { size: 10, font: weight === "bold" ? bold : font, color: ink, align: "right", width: 110 }),
    text(`$${amount.toFixed(2)}`, { size: 10, font: weight === "bold" ? bold : font, color: ink, align: "right", width: 60, margin: { right: 12 } })
  );

const nodes: Node[] = [
  header,
  tableHeader,
  ...items.map(itemRow),
  hline({ color: border, margin: { top: 8, bottom: 8 } }),
  totalsRow("Subtotal", subtotal),
  totalsRow("Tax (6.25%)", tax),
  totalsRow("Total", total, "bold"),
  text("Payment due net-30. Wire details on request.", { size: 9, font, color: muted, margin: { top: 24 } })
];

const { pages } = await renderFlow(doc, nodes, { margin: 48 });

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/invoice.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/invoice.pdf (${bytes.byteLength} bytes, ${pages.length} pages)`);
