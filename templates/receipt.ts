// Copy-paste template: a professional-looking receipt built on the
// first-class `table()` primitive. Adjust the seller, line items, and
// totals — column widths, dividers, and totals row stay in one place.

import { writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  cleanTheme,
  formatCurrency,
  hline,
  renderFlow,
  table,
  text,
  vstack,
  type Node
} from "../src/index.js";
import { embedInter } from "../src/inter.js";

interface LineItem {
  name: string;
  qty: number;
  unit: number;
}

const seller = {
  name: "Acme Supply Co.",
  caption: "Receipt · Order #18472 · May 14, 2026"
};

const items: LineItem[] = [
  { name: "Wool socks", qty: 2, unit: 14 },
  { name: "Coffee mug", qty: 1, unit: 18 },
  { name: "Notebook (A5)", qty: 3, unit: 9 }
];

const subtotal = items.reduce((sum, it) => sum + it.qty * it.unit, 0);
const tax = subtotal * 0.0875;
const total = subtotal + tax;

const doc = await PDFDocument.create();
// Inter with `tabularFigures: true` returns extra tabularFont / tabularBold
// variants whose digits all have the same advance width — money column
// alignment becomes mechanical.
const { font, bold, tabularFont, tabularBold } = await embedInter(doc, {
  tabularFigures: true
});
const theme = cleanTheme(font, bold);

const TABLE_WIDTH = 515;
const TABLE_PADDING = { left: theme.spacing.md, right: theme.spacing.md };

const header: Node = vstack(
  { gap: theme.spacing.xs },
  text(seller.name, theme.type.h1),
  text(seller.caption, theme.type.caption)
);

const itemsTable: Node = table({
  width: TABLE_WIDTH,
  columns: [
    { width: "1fr" },
    { width: 90 },
    { width: 90 }
  ],
  rows: items.map((it) => [
    text(it.name, theme.type.body),
    text(`${it.qty} × ${formatCurrency(it.unit)}`, {
      ...theme.type.bodySmall,
      font: tabularFont,
      color: theme.colors.muted,
      align: "right",
      width: 90
    }),
    text(formatCurrency(it.qty * it.unit), {
      ...theme.type.body,
      font: tabularBold,
      align: "right",
      width: 90
    })
  ]),
  rowDivider: theme.hr,
  cellPadding: { top: theme.spacing.sm, bottom: theme.spacing.sm },
  padding: TABLE_PADDING,
  border: { color: theme.colors.border, width: 1 },
  borderRadius: theme.radii.md,
  background: theme.colors.surface
});

const totalsTable: Node = table({
  width: TABLE_WIDTH,
  columns: [{ width: "1fr" }, { width: 100 }, { width: 90 }],
  rows: [
    [
      text("", theme.type.body),
      text("Subtotal", {
        ...theme.type.bodySmall,
        color: theme.colors.muted,
        align: "right",
        width: 100
      }),
      text(formatCurrency(subtotal), {
        ...theme.type.body,
        font: tabularFont,
        align: "right",
        width: 90
      })
    ],
    [
      text("", theme.type.body),
      text("Tax (8.75%)", {
        ...theme.type.bodySmall,
        color: theme.colors.muted,
        align: "right",
        width: 100
      }),
      text(formatCurrency(tax), {
        ...theme.type.body,
        font: tabularFont,
        align: "right",
        width: 90
      })
    ]
  ],
  footer: [
    text("", theme.type.body),
    text("Total", { ...theme.type.h2, align: "right", width: 100 }),
    text(formatCurrency(total), {
      ...theme.type.h2,
      font: tabularBold,
      align: "right",
      width: 90
    })
  ],
  cellPadding: { top: 3, bottom: 3 },
  padding: TABLE_PADDING,
  footerDivider: { ...theme.hr, thickness: 1 },
  margin: { top: theme.spacing.md }
});

await renderFlow(
  doc,
  [
    header,
    hline({ ...theme.hr, margin: { top: theme.spacing.lg, bottom: theme.spacing.lg } }),
    itemsTable,
    totalsTable,
    text("Thanks for your business.", {
      ...theme.type.caption,
      margin: { top: theme.spacing.xl }
    })
  ],
  {
    margin: theme.spacing.xxl,
    title: `Receipt — ${seller.name}`,
    author: seller.name,
    creator: "boxpdf",
    producer: "boxpdf"
  }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/receipt.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/receipt.pdf (${bytes.byteLength} bytes)`);
