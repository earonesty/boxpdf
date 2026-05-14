import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  formatCurrency,
  hex,
  hline,
  hstack,
  keepTogether,
  renderFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

interface LineItem { description: string; qty: number; unit: number }

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

// Column layout — all rows (header row, item rows, totals) share these widths
// so the dollar amounts, qty, and unit columns all line up.
const PAGE_INNER = 515;
const COL_GAP = 12;
const QTY_W = 50;
const UNIT_W = 80;
const AMT_W = 90;
const DESC_W = PAGE_INNER - QTY_W - UNIT_W - AMT_W - COL_GAP * 3;

const row = (cells: Node[]): Node => hstack({ width: PAGE_INNER, gap: COL_GAP }, ...cells);

const tableHeader = vstack(
  { width: PAGE_INNER },
  row([
    text("Description", { size: 10, font: bold, color: ink, width: DESC_W }),
    text("Qty", { size: 10, font: bold, color: ink, align: "right", width: QTY_W }),
    text("Unit", { size: 10, font: bold, color: ink, align: "right", width: UNIT_W }),
    text("Amount", { size: 10, font: bold, color: ink, align: "right", width: AMT_W })
  ]),
  hline({ color: ink, thickness: 0.8, margin: { top: 4, bottom: 4 } })
);

const itemRow = (item: LineItem): Node =>
  row([
    text(item.description, { size: 10, font, color: ink, width: DESC_W, margin: { top: 4, bottom: 4 } }),
    text(String(item.qty), { size: 10, font, color: ink, align: "right", width: QTY_W, margin: { top: 4, bottom: 4 } }),
    text(formatCurrency(item.unit), { size: 10, font, color: ink, align: "right", width: UNIT_W, margin: { top: 4, bottom: 4 } }),
    text(formatCurrency(item.qty * item.unit), { size: 10, font, color: ink, align: "right", width: AMT_W, margin: { top: 4, bottom: 4 } })
  ]);

const totalRow = (label: string, amount: number, isBold = false): Node => {
  const f = isBold ? bold : font;
  return row([
    text("", { size: 10, font, width: DESC_W }),
    text("", { size: 10, font, width: QTY_W }),
    text(label, { size: 10, font: f, color: ink, align: "right", width: UNIT_W }),
    text(formatCurrency(amount), { size: 10, font: f, color: ink, align: "right", width: AMT_W })
  ]);
};

const totalsBlock = keepTogether(
  { gap: 2, margin: { top: 10 } },
  hline({ color: border, margin: { bottom: 6 } }),
  totalRow("Subtotal", subtotal),
  totalRow("Tax (6.25%)", tax),
  hline({ color: border, margin: { top: 6, bottom: 6 } }),
  totalRow("Total", total, true)
);

const introBlock = vstack(
  { gap: 4 },
  hstack(
    { justify: "between", width: PAGE_INNER },
    text("INVOICE", { size: 22, font: bold, color: ink }),
    text("#2026-001872", { size: 12, font, color: muted })
  ),
  text("Issued: May 14, 2026", { size: 10, font, color: muted }),
  text("Bill to: Onward Travel, LLC.", { size: 10, font, color: muted, margin: { top: 6 } })
);

const nodes: Node[] = [
  introBlock,
  vstack({ height: 20 }), // breathing room
  tableHeader,
  ...items.map(itemRow),
  totalsBlock,
  text("Payment due net-30. Wire details on request.", {
    size: 9,
    font,
    color: muted,
    margin: { top: 24 }
  })
];

const { pages } = await renderFlow(doc, nodes, {
  margin: 48,
  header: ({ pageNumber }) =>
    pageNumber === 1
      ? vstack({ height: 0 }) // no running header on page 1; the introBlock plays that role
      : hstack(
          { width: PAGE_INNER, justify: "between" },
          text("INVOICE #2026-001872", { size: 9, font, color: muted }),
          text("Issued: May 14, 2026", { size: 9, font, color: muted })
        ),
  footer: ({ pageNumber, totalPages }) =>
    hstack(
      { width: PAGE_INNER, justify: "between" },
      text("Acme Supply Co. · acme.example", { size: 8, font, color: muted }),
      text(`Page ${pageNumber} of ${totalPages}`, { size: 8, font, color: muted })
    )
});

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/invoice.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/invoice.pdf (${bytes.byteLength} bytes, ${pages.length} pages)`);
