import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  PageSizes,
  cleanTheme,
  hex,
  hline,
  hstack,
  link,
  renderFlow,
  text,
  vstack
} from "../src/index.js";

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);

const PAGE_INNER = 612 - 72; // letter, 36pt margin

function row(label: string, value: string): import("../src/types.js").Node {
  return hstack(
    { width: PAGE_INNER, gap: 16 },
    text(label, { ...theme.type.body, font: bold, width: 140 }),
    text(value, { ...theme.type.body, shrink: 1 })
  );
}

await renderFlow(
  doc,
  [
    text("Flex-shrink demo", theme.type.h1),
    text(
      "Each value below is in an hstack alongside a 140pt label, with shrink:1 on the value text. When the value's intrinsic width plus the label plus gap exceeds the page inner width, it wraps to the remaining slot instead of overflowing.",
      { ...theme.type.body, color: hex("#475569"), width: PAGE_INNER }
    ),
    hline(theme.hr),

    row("Customer", "Mr. Algernon Hephaestus Constantine Pemberton-Smythe III, Esq."),
    row("Address", "Flat 3B, 27 St. James's Square, Westminster, London SW1Y 4LH, United Kingdom"),
    row(
      "Notes",
      "Please ensure the package is delivered to the rear gate; signature required from the named addressee only — no neighbours, no concierge."
    ),
    row("Order ID", "ord_01HZX4P9NMJK4WXTV2A6FRB8GD"),

    hline(theme.hr),

    text(
      "Two siblings both with shrink:1 share the overflow proportionally to shrink × baseWidth. Below: two paragraphs of similar length in a 360pt-wide hstack — each gets ~half:",
      { ...theme.type.body, color: hex("#475569"), width: PAGE_INNER }
    ),
    hstack(
      { width: 360, gap: 12 },
      text(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
        { ...theme.type.body, shrink: 1 }
      ),
      text(
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
        { ...theme.type.body, shrink: 1 }
      )
    ),

    hline(theme.hr),

    text(
      "shrink:0 (default) sits next to shrink:1 — the bold label keeps its intrinsic width and the value absorbs all the overflow:",
      { ...theme.type.body, color: hex("#475569"), width: PAGE_INNER }
    ),
    hstack(
      { width: PAGE_INNER, gap: 8 },
      text("Booking reference:", { ...theme.type.body, font: bold }),
      text(
        "Mr. Wolfeschlegelsteinhausenbergerdorff Jr. for KLM-Royal Dutch flight 12345 with seat assignment 47K-window-extra-legroom-economy",
        { ...theme.type.body, shrink: 1 }
      )
    ),

    hline(theme.hr),

    text(
      "Single-token strings (URLs, hashes) don't shrink by default — they overflow visibly. Add `maxLines: 1` to truncate with an ellipsis (annotation still covers the visible portion), or `breakWords: true` to hard-break char-by-char. Three 320pt rows, three behaviors:",
      { ...theme.type.body, color: hex("#475569"), width: PAGE_INNER }
    ),
    hstack(
      { width: 320, gap: 8 },
      text("Default:", { ...theme.type.body, font: bold, width: 70 }),
      link(
        { href: "https://example.com/extremely/long/path?with=lots&of=query&parameters=here" },
        text(
          "https://example.com/extremely/long/path?with=lots&of=query&parameters=here",
          { ...theme.type.body, color: hex("#2563eb"), underline: true, shrink: 1 }
        )
      )
    ),
    hstack(
      { width: 320, gap: 8 },
      text("Truncate:", { ...theme.type.body, font: bold, width: 70 }),
      link(
        { href: "https://example.com/extremely/long/path?with=lots&of=query&parameters=here" },
        text(
          "https://example.com/extremely/long/path?with=lots&of=query&parameters=here",
          {
            ...theme.type.body,
            color: hex("#2563eb"),
            underline: true,
            shrink: 1,
            maxLines: 1
          }
        )
      )
    ),
    hstack(
      { width: 320, gap: 8 },
      text("Break:", { ...theme.type.body, font: bold, width: 70 }),
      link(
        { href: "https://example.com/extremely/long/path?with=lots&of=query&parameters=here" },
        text(
          "https://example.com/extremely/long/path?with=lots&of=query&parameters=here",
          {
            ...theme.type.body,
            color: hex("#2563eb"),
            underline: true,
            shrink: 1,
            breakWords: true
          }
        )
      )
    )
  ],
  { margin: 36, debug: true, size: PageSizes.Letter }
);

const bytes = await doc.save();
const out = new URL("./flex-shrink.pdf", import.meta.url);
writeFileSync(out, bytes);
console.log("wrote", out.pathname);
