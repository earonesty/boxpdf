import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  hex,
  hline,
  linkRun,
  paragraph,
  renderFlow,
  run,
  table,
  text,
  vstack
} from "../src/index.js";

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

const ink = hex("#172026");
const muted = hex("#667085");
const line = hex("#d9e2ec");
const panel = hex("#f8fafc");
const blue = hex("#0f62fe");
const green = hex("#0f766e");
const greenSoft = hex("#ccfbf1");
const amber = hex("#92400e");
const amberSoft = hex("#fef3c7");

const body = { size: 10.5, font, color: ink };
const bodyBold = { size: 10.5, font: bold, color: ink };
const bodyItalic = { size: 10.5, font: italic, color: muted };
const link = { size: 10.5, font: bold, color: blue, underline: true };

const doc = vstack(
  {
    width: 500,
    padding: 24,
    background: hex("#ffffff"),
    border: { color: line, width: 1 },
    borderRadius: 8,
    gap: 14
  },
  text("Rich content smoke test", { size: 20, font: bold, color: ink }),
  paragraph(
    { width: 452, lineHeight: 15 },
    run("This paragraph wraps ", body),
    run("mixed inline runs", bodyBold),
    run(" as one line box, including ", body),
    run("italic text", bodyItalic),
    run(", regular text, and a ", body),
    linkRun("linked run that can wrap", link, "https://example.com/docs"),
    run(". The link annotation follows only the linked fragments.", body)
  ),
  paragraph(
    { width: 330, lineHeight: 15 },
    run("Long tokens still hard-break inside the paragraph: ", body),
    run("supercalifragilisticexpialidocious-supercalifragilisticexpialidocious", {
      size: 10.5,
      font: bold,
      color: amber
    }),
    run(".", body)
  ),
  hline({ color: line }),
  table({
    width: 452,
    columns: [{ width: "1fr" }, { width: 82 }, { width: 82 }],
    columnGap: 0,
    rowDivider: { color: line },
    header: [
      {
        content: text("Plan comparison", { size: 10, font: bold, color: ink }),
        colSpan: 3,
        padding: 9,
        background: panel,
        border: { color: line, width: 1 }
      }
    ],
    rows: [
      [
        { content: text("Feature", { size: 9, font: bold, color: muted }), padding: 8 },
        { content: text("Basic", { size: 9, font: bold, color: muted }), padding: 8, align: "center" },
        { content: text("Pro", { size: 9, font: bold, color: muted }), padding: 8, align: "center" }
      ],
      [
        {
          content: paragraph(
            { width: 250, lineHeight: 13 },
            run("Inline text in a cell with ", { size: 9, font, color: ink }),
            run("bold", { size: 9, font: bold, color: ink }),
            run(" and ", { size: 9, font, color: ink }),
            linkRun("link", { size: 9, font: bold, color: blue, underline: true }, "https://example.com")
          ),
          padding: 8
        },
        { content: text("Yes", { size: 10, font, color: green }), padding: 8, align: "center" },
        { content: text("Yes", { size: 10, font: bold, color: green }), padding: 8, align: "center", background: greenSoft }
      ],
      [
        { content: text("Priority review", { size: 10, font, color: ink }), padding: 8 },
        { content: text("No", { size: 10, font, color: muted }), padding: 8, align: "center" },
        {
          content: text("Included", { size: 10, font: bold, color: amber }),
          padding: 8,
          align: "center",
          valign: "middle",
          background: amberSoft,
          border: { color: hex("#f59e0b"), width: 1 }
        }
      ]
    ],
    footer: [
      {
        content: paragraph(
          { width: 436, lineHeight: 13 },
          run("Footer cell spans all columns and keeps ", { size: 9, font, color: muted }),
          run("mixed inline content", { size: 9, font: bold, color: ink }),
          run(" together.", { size: 9, font, color: muted })
        ),
        colSpan: 3,
        padding: 8,
        background: panel
      }
    ],
    border: { color: line, width: 1 },
    borderRadius: 6
  })
);

await renderFlow(pdf, [doc], { margin: 48, debug: true });
const bytes = await pdf.save();
writeFileSync(new URL("../fixtures/rich-content.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/rich-content.pdf (${bytes.byteLength} bytes)`);
