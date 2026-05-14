// Copy-paste template: a landscape A4 award certificate.
//
// Substitute recipient, course, date, signatories. Uses the editorialTheme
// for a formal-document feel (Times serif) with a decorative double-border
// frame and signature lines.

import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  editorialTheme,
  hline,
  hstack,
  renderFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

const award = {
  title: "Certificate of Completion",
  recipient: "Daniel Park",
  course: "Distributed Systems · Spring 2026",
  description:
    "in recognition of completing the program in full, demonstrating excellence in the design and analysis of consensus, replication, and fault-tolerant systems.",
  issuedOn: "May 14, 2026",
  signatories: [
    { name: "Dr. Marisol Tan", title: "Director of Studies" },
    { name: "Prof. Hideo Saito", title: "Program Chair" }
  ]
};

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.TimesRoman);
const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
const theme = editorialTheme(font, bold, italic);

// Landscape A4: 842 × 595
const PAGE_W = 842;
const PAGE_H = 595;
const FRAME_MARGIN = 36;
const INNER_W = PAGE_W - FRAME_MARGIN * 2;
const FRAME_PAD = 30;
const CONTENT_W = INNER_W - FRAME_PAD * 2;

const eyebrow: Node = text("Awarded to", {
  size: 11,
  font,
  color: theme.colors.muted,
  align: "center",
  width: CONTENT_W,
  margin: { top: theme.spacing.lg }
});

const recipientName: Node = text(award.recipient, {
  ...theme.type.display,
  size: 52,
  color: theme.colors.ink,
  align: "center",
  width: CONTENT_W,
  margin: { top: theme.spacing.sm }
});

const courseLine: Node = text(award.course, {
  ...theme.type.h2,
  color: theme.colors.accent,
  align: "center",
  width: CONTENT_W,
  margin: { top: theme.spacing.md }
});

const descriptionLine: Node = text(award.description, {
  ...theme.type.body,
  size: 12,
  align: "center",
  width: CONTENT_W - 80,
  margin: { top: theme.spacing.lg, left: 40, right: 40 }
});

const signatory = (name: string, title: string): Node =>
  vstack(
    { width: 220, gap: 4 },
    hline({ color: theme.colors.ink, thickness: 0.75, width: 220, margin: { bottom: 4 } }),
    text(name, { ...theme.type.body, font: bold, align: "center", width: 220 }),
    text(title, { ...theme.type.caption, font: italic, color: theme.colors.muted, align: "center", width: 220 })
  );

const signatures: Node = hstack(
  { width: CONTENT_W, gap: 60, justify: "between", margin: { top: theme.spacing.xxl } },
  signatory(award.signatories[0]!.name, award.signatories[0]!.title),
  signatory(award.signatories[1]!.name, award.signatories[1]!.title)
);

const issuedLine: Node = text(`Issued on ${award.issuedOn}`, {
  ...theme.type.caption,
  font: italic,
  align: "center",
  width: CONTENT_W,
  margin: { top: theme.spacing.lg }
});

// Inner frame: double border via two stacked rectangles
const innerFrame: Node = vstack(
  {
    width: INNER_W,
    height: PAGE_H - FRAME_MARGIN * 2,
    border: { color: theme.colors.borderStrong, width: 2 },
    padding: 8
  },
  vstack(
    {
      width: INNER_W - 16,
      height: PAGE_H - FRAME_MARGIN * 2 - 16,
      border: { color: theme.colors.border, width: 0.75 },
      padding: { top: 8, right: FRAME_PAD - 8, bottom: 8, left: FRAME_PAD - 8 },
      align: "center"
    },
    text(award.title.toUpperCase(), {
      size: 13,
      font: bold,
      color: theme.colors.accent,
      align: "center",
      width: CONTENT_W,
      margin: { top: theme.spacing.md }
    }),
    hline({ color: theme.colors.borderStrong, thickness: 0.75, width: 120, margin: { top: 6 } }),
    eyebrow,
    recipientName,
    courseLine,
    descriptionLine,
    signatures,
    issuedLine
  )
);

await renderFlow(
  doc,
  [innerFrame],
  {
    size: { width: PAGE_W, height: PAGE_H },
    margin: FRAME_MARGIN,
    title: `Certificate — ${award.recipient}`,
    author: award.signatories[0]!.title + " · " + award.signatories[0]!.name,
    creator: "boxpdf",
    producer: "boxpdf"
  }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/certificate.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/certificate.pdf (${bytes.byteLength} bytes)`);
