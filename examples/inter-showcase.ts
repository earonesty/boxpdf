import { writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  cleanTheme,
  flex,
  formatCurrency,
  hline,
  hstack,
  renderFlow,
  text,
  vstack,
  type Node,
  type Theme
} from "../src/index.js";
import { embedInter } from "../src/inter.js";

const items = [
  { name: "Wool socks", qty: 2, unit: 14 },
  { name: "Coffee mug", qty: 1, unit: 18 },
  { name: "Notebook (A5)", qty: 3, unit: 9 }
];
const subtotal = items.reduce((s, it) => s + it.qty * it.unit, 0);
const tax = subtotal * 0.0875;
const total = subtotal + tax;

const PAGE_INNER = 515;
const TABLE_PAD = 16;
const INNER_WIDTH = PAGE_INNER - TABLE_PAD * 2;
const LABEL_COL = 120;
const AMOUNT_COL = 90;

function makeReceipt(theme: Theme): Node[] {
  const COL_GAP = theme.spacing.md;
  const DESC_COL = INNER_WIDTH - LABEL_COL - AMOUNT_COL - COL_GAP * 2;
  const itemRow = (it: typeof items[number]): Node =>
    hstack(
      { width: INNER_WIDTH, gap: COL_GAP, padding: { top: theme.spacing.xs, bottom: theme.spacing.xs } },
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
  const totalsRow = (label: string, amount: number, emphasize = false): Node => {
    const labelStyle = emphasize ? theme.type.h2 : { ...theme.type.bodySmall, color: theme.colors.muted };
    const amountStyle = emphasize ? theme.type.h2 : theme.type.body;
    return hstack(
      { width: INNER_WIDTH, gap: COL_GAP, padding: { top: 3, bottom: 3 } },
      flex(),
      text(label, { ...labelStyle, align: "right", width: LABEL_COL }),
      text(formatCurrency(amount), { ...amountStyle, align: "right", width: AMOUNT_COL })
    );
  };
  return [
    vstack(
      { gap: theme.spacing.xs },
      text("Acme Supply Co.", theme.type.h1),
      text("Receipt · Order #18472 · May 14, 2026", theme.type.caption)
    ),
    hline({ ...theme.hr, margin: { top: theme.spacing.lg, bottom: theme.spacing.lg } }),
    vstack(
      { ...theme.card, width: PAGE_INNER, padding: TABLE_PAD },
      ...items.flatMap((it, i) => (i === 0 ? [itemRow(it)] : [hline(theme.hr), itemRow(it)]))
    ),
    vstack(
      {
        width: PAGE_INNER,
        padding: { top: theme.spacing.sm, right: TABLE_PAD, bottom: theme.spacing.sm, left: TABLE_PAD },
        margin: { top: theme.spacing.md }
      },
      totalsRow("Subtotal", subtotal),
      totalsRow("Tax (8.75%)", tax),
      hline({ ...theme.hr, margin: { top: theme.spacing.sm, bottom: theme.spacing.sm } }),
      totalsRow("Total", total, true)
    ),
    text("Thanks for your business.", { ...theme.type.caption, margin: { top: theme.spacing.xl } })
  ];
}

const pdf = await PDFDocument.create();
const { font, bold } = await embedInter(pdf);
const theme = cleanTheme(font, bold);

await renderFlow(pdf, makeReceipt(theme), {
  margin: theme.spacing.xxl,
  title: "Receipt — Acme Supply Co. (Inter)",
  author: "Acme Supply Co.",
  creator: "boxpdf",
  producer: "boxpdf"
});

const bytes = await pdf.save();
writeFileSync(new URL("../fixtures/receipt-inter.pdf", import.meta.url), bytes);
console.log(`wrote receipt-inter.pdf (${bytes.byteLength} bytes)`);
