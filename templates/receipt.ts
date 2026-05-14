// Copy-paste template: a professional-looking receipt.
//
// Adjust the seller, line items, and totals — everything else is driven by
// the `clean` theme. To get a different look, swap `cleanTheme` for another
// theme from `boxpdf/themes` or pass your own theme object.

import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  cleanTheme,
  flex,
  formatCurrency,
  hline,
  hstack,
  renderFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

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
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);

// Column layout — shared by item rows and totals rows so every dollar
// amount lands in the same right-aligned column.
const PAGE_INNER = 515;
const TABLE_PAD = 16;
const INNER_WIDTH = PAGE_INNER - TABLE_PAD * 2;
const COL_GAP = theme.spacing.md;
const LABEL_COL = 110;
const AMOUNT_COL = 80;
const DESC_COL = INNER_WIDTH - LABEL_COL - AMOUNT_COL - COL_GAP * 2;

const header: Node = vstack(
  { gap: theme.spacing.xs },
  text(seller.name, theme.type.h1),
  text(seller.caption, theme.type.caption)
);

const itemRow = (it: LineItem): Node =>
  hstack(
    { width: INNER_WIDTH, gap: COL_GAP, padding: { top: 6, bottom: 6 } },
    text(it.name, { ...theme.type.body, width: DESC_COL }),
    text(`${it.qty} × ${formatCurrency(it.unit)}`, {
      ...theme.type.bodySmall,
      color: theme.colors.muted,
      align: "right",
      width: LABEL_COL
    }),
    text(formatCurrency(it.qty * it.unit), {
      ...theme.type.body,
      font: theme.bold,
      align: "right",
      width: AMOUNT_COL
    })
  );

const itemsCard: Node = vstack(
  { ...theme.card, width: PAGE_INNER, padding: TABLE_PAD },
  ...items.flatMap((it, i) => (i === 0 ? [itemRow(it)] : [hline(theme.hr), itemRow(it)]))
);

const totalsRow = (label: string, amount: number, emphasize = false): Node => {
  const labelStyle = emphasize ? { ...theme.type.h2 } : { ...theme.type.bodySmall, color: theme.colors.muted };
  const amountStyle = emphasize ? { ...theme.type.h2 } : { ...theme.type.body };
  return hstack(
    { width: INNER_WIDTH, gap: COL_GAP, padding: { top: 3, bottom: 3 } },
    flex(),
    text(label, { ...labelStyle, align: "right", width: LABEL_COL }),
    text(formatCurrency(amount), { ...amountStyle, align: "right", width: AMOUNT_COL })
  );
};

const totals: Node = vstack(
  {
    width: PAGE_INNER,
    padding: { top: theme.spacing.sm, right: TABLE_PAD, bottom: theme.spacing.sm, left: TABLE_PAD },
    margin: { top: theme.spacing.md }
  },
  totalsRow("Subtotal", subtotal),
  totalsRow("Tax (8.75%)", tax),
  hline({ ...theme.hr, margin: { top: theme.spacing.sm, bottom: theme.spacing.sm } }),
  totalsRow("Total", total, true)
);

await renderFlow(
  doc,
  [
    header,
    hline({ ...theme.hr, margin: { top: theme.spacing.lg, bottom: theme.spacing.lg } }),
    itemsCard,
    totals,
    text("Thanks for your business.", { ...theme.type.caption, margin: { top: theme.spacing.xl } })
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
