// Copy-paste template: an e-commerce order confirmation.
//
// Substitute your own order#, customer, line items, addresses. Shows off
// product thumbnails (placeholder colored squares — drop in `image()` with
// a loaded `PDFImage` for real thumbnails), a shipping/billing address grid,
// totals, and clickable support/track links via `link()`.

import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  cleanTheme,
  flex,
  formatCurrency,
  hex,
  hline,
  hstack,
  keepTogether,
  link,
  renderFlow,
  text,
  vstack,
  type Node,
  type RGB
} from "../src/index.js";

interface Item {
  name: string;
  variant: string;
  qty: number;
  unit: number;
  thumb: RGB;
}

const order = {
  number: "OW-2026-018723",
  date: "May 14, 2026",
  customer: "Sam Reyes",
  email: "sam@example.com",
  trackingUrl: "https://onwardtravel.example/orders/OW-2026-018723"
};

const items: Item[] = [
  {
    name: "Field jacket",
    variant: "Olive · M",
    qty: 1,
    unit: 198,
    thumb: hex("#4a5d3a")
  },
  {
    name: "Linen trousers",
    variant: "Stone · 32",
    qty: 2,
    unit: 89,
    thumb: hex("#cfc6b1")
  },
  {
    name: "Wool socks (3-pack)",
    variant: "Charcoal heather",
    qty: 1,
    unit: 32,
    thumb: hex("#3d4147")
  }
];

const shipping = {
  name: "Sam Reyes",
  lines: ["482 Page Street, Apt 2B", "San Francisco, CA 94117", "United States"]
};

const billing = {
  name: "Sam Reyes",
  lines: ["Visa ending 4242", "Charged May 14, 2026"]
};

const subtotal = items.reduce((s, it) => s + it.qty * it.unit, 0);
const shippingCost = 14;
const tax = subtotal * 0.0875;
const total = subtotal + shippingCost + tax;

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);
const BLUE = theme.colors.accent;

const PAGE_INNER = 515;
const SECTION_GAP = theme.spacing.lg;

const header: Node = vstack(
  { gap: theme.spacing.xs },
  text("Thanks for your order, " + order.customer.split(" ")[0] + ".", theme.type.h1),
  text(`Order ${order.number} · placed ${order.date}`, theme.type.caption),
  hstack(
    { gap: theme.spacing.md, margin: { top: theme.spacing.sm } },
    link(
      { href: order.trackingUrl },
      text("Track your shipment", { ...theme.type.bodySmall, color: BLUE, underline: true })
    ),
    text("·", { ...theme.type.bodySmall, color: theme.colors.muted }),
    link(
      { href: "mailto:support@onwardtravel.example" },
      text("Support", { ...theme.type.bodySmall, color: BLUE, underline: true })
    )
  )
);

const itemRow = (it: Item): Node =>
  hstack(
    { width: PAGE_INNER, gap: theme.spacing.md, padding: { top: theme.spacing.sm, bottom: theme.spacing.sm } },
    vstack({ width: 52, height: 52, background: it.thumb, borderRadius: 6 }),
    vstack(
      { gap: 2 },
      text(it.name, { ...theme.type.body, font: bold }),
      text(it.variant, { ...theme.type.caption })
    ),
    flex(),
    text(`× ${it.qty}`, { ...theme.type.bodySmall, color: theme.colors.muted, align: "right", width: 50 }),
    text(formatCurrency(it.qty * it.unit), { ...theme.type.body, font: bold, align: "right", width: 80 })
  );

const itemsCard: Node = vstack(
  { ...theme.card, width: PAGE_INNER, padding: theme.spacing.lg },
  ...items.flatMap((it, i) => (i === 0 ? [itemRow(it)] : [hline(theme.hr), itemRow(it)]))
);

const addressCard = (titleStr: string, name: string, lines: string[]): Node =>
  vstack(
    {
      width: (PAGE_INNER - theme.spacing.md) / 2,
      padding: theme.spacing.md,
      background: theme.colors.surfaceMuted,
      borderRadius: theme.radii.md,
      gap: 4
    },
    text(titleStr.toUpperCase(), { ...theme.type.label, color: theme.colors.muted }),
    text(name, { ...theme.type.body, font: bold, margin: { top: 2 } }),
    ...lines.map((l) => text(l, theme.type.bodySmall))
  );

const addresses: Node = hstack(
  { width: PAGE_INNER, gap: theme.spacing.md, margin: { top: SECTION_GAP } },
  addressCard("Ship to", shipping.name, shipping.lines),
  addressCard("Billed to", billing.name, billing.lines)
);

const totalsRow = (label: string, amount: number, emphasize = false): Node => {
  const labelStyle = emphasize ? theme.type.h2 : { ...theme.type.bodySmall, color: theme.colors.muted };
  const amountStyle = emphasize ? theme.type.h2 : theme.type.body;
  return hstack(
    { width: PAGE_INNER, gap: theme.spacing.md, padding: { top: 4, bottom: 4 } },
    flex(),
    text(label, { ...labelStyle, align: "right", width: 140 }),
    text(formatCurrency(amount), { ...amountStyle, align: "right", width: 90 })
  );
};

const totals: Node = vstack(
  {
    width: PAGE_INNER,
    padding: { top: theme.spacing.md, right: theme.spacing.lg, bottom: theme.spacing.md, left: theme.spacing.lg },
    margin: { top: theme.spacing.md }
  },
  totalsRow("Subtotal", subtotal),
  totalsRow("Shipping", shippingCost),
  totalsRow("Tax (8.75%)", tax),
  hline({ ...theme.hr, margin: { top: theme.spacing.sm, bottom: theme.spacing.sm } }),
  totalsRow("Total", total, true)
);

const footer: Node = vstack(
  { width: PAGE_INNER, gap: theme.spacing.xs, margin: { top: theme.spacing.xl } },
  text(
    "Most orders arrive in 3–5 business days. You'll get a tracking email as soon as your package leaves our warehouse.",
    { ...theme.type.caption, width: PAGE_INNER }
  ),
  text(
    "Returns are free within 30 days. Visit our help center to start one — no questions asked.",
    { ...theme.type.caption, width: PAGE_INNER }
  )
);

await renderFlow(
  doc,
  [header, hline({ ...theme.hr, margin: { top: theme.spacing.lg, bottom: theme.spacing.lg } }), itemsCard, addresses, totals, footer],
  {
    margin: theme.spacing.xxl,
    title: `Order confirmation — ${order.number}`,
    author: "Onward Travel",
    creator: "boxpdf",
    producer: "boxpdf"
  }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/order-confirmation.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/order-confirmation.pdf (${bytes.byteLength} bytes)`);
