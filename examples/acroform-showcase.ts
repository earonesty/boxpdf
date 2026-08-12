import { writeFileSync } from "node:fs";
import {
  PDFName,
  PDFString,
  type PDFDocument,
  type PDFField
} from "pdf-lib";
import {
  PageSizes,
  button,
  checkbox,
  cleanTheme,
  dropdown,
  hex,
  hline,
  hstack,
  optionList,
  radioOption,
  renderFlow,
  savePdf,
  standardFonts,
  text,
  textField,
  vstack,
  type Node
} from "../src/index.js";

const OUTPUT = process.argv[2] ?? "fixtures/acroform-showcase.pdf";
const SUBMIT_URL =
  "https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com%2Fearonesty%2Fboxpdf&status_code=303";
const PAGE_WIDTH = 540;
const COLUMN_WIDTH = 260;
const FIELD_WIDTH = 252;
const PURPLE = hex("#635bff");
const INK = hex("#172b4d");
const MUTED = hex("#596780");
const BORDER = hex("#a8b3c7");
const FIELD_BG = hex("#f8fafc");

type FontSet = Awaited<ReturnType<typeof standardFonts>>;

function fieldAppearance(fonts: FontSet, width = FIELD_WIDTH, height = 23) {
  return {
    width,
    height,
    font: fonts.font,
    fontSize: 10,
    textColor: INK,
    backgroundColor: FIELD_BG,
    borderColor: BORDER,
    borderWidth: 1
  };
}

function labeled(fonts: FontSet, label: string, field: Node, hint?: string): Node {
  return vstack(
    { gap: 3, margin: { bottom: 7 } },
    text(label, { size: 9, font: fonts.bold, color: INK }),
    field,
    ...(hint ? [text(hint, { size: 7, font: fonts.font, color: MUTED, width: FIELD_WIDTH })] : [])
  );
}

function choiceRow(fonts: FontSet, field: Node, label: string): Node {
  return hstack(
    { gap: 6, align: "center" },
    field,
    text(label, { size: 9, font: fonts.font, color: INK })
  );
}

function attachAction(
  pdf: PDFDocument,
  fieldName: string,
  action: Record<string, string | number | PDFString>
): void {
  const field = pdf.getForm().getButton(fieldName) as PDFField;
  for (const widget of field.acroField.getWidgets()) {
    widget.dict.set(PDFName.of("A"), pdf.context.obj(action));
  }
}

async function main(): Promise<void> {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const fonts = await standardFonts(pdf);
  const theme = cleanTheme(fonts);
  const small = { width: 15, height: 15, borderColor: BORDER, borderWidth: 1 };

  const left = vstack(
    { width: COLUMN_WIDTH },
    text("Text fields", { size: 12, font: fonts.bold, color: PURPLE, margin: { bottom: 7 } }),
    labeled(fonts, "Full name · required", textField({
      name: "person.fullName",
      value: "Ada Lovelace",
      required: true,
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Email", textField({
      name: "person.email",
      value: "ada@example.test",
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Eight-character account ID · combed", textField({
      name: "person.accountId",
      value: "BX42A711",
      maxLength: 8,
      combed: true,
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Password field", textField({
      name: "person.password",
      password: true,
      ...fieldAppearance(fonts)
    }), "Type a fake value; the viewer should mask it."),
    labeled(fonts, "Multiline comments", textField({
      name: "person.comments",
      value: "Edit this text, then use Save As and reopen the PDF to verify persistence.",
      multiline: true,
      ...fieldAppearance(fonts, FIELD_WIDTH, 62)
    })),
    labeled(fonts, "Read-only value", textField({
      name: "system.documentId",
      value: "BOXPDF-ACROFORM-COMPAT-01",
      readOnly: true,
      ...fieldAppearance(fonts)
    })),
    textField({
      name: "system.hiddenMarker",
      value: "hidden-field-present",
      hidden: true,
      readOnly: true,
      width: 1,
      height: 1
    })
  );

  const right = vstack(
    { width: COLUMN_WIDTH },
    text("Choices", { size: 12, font: fonts.bold, color: PURPLE, margin: { bottom: 7 } }),
    labeled(fonts, "Checkboxes", vstack(
      { gap: 5 },
      choiceRow(fonts, checkbox({ name: "preferences.newsletter", checked: true, ...small }), "Send product updates"),
      choiceRow(fonts, checkbox({ name: "preferences.terms", required: true, ...small }), "Accept terms · required")
    )),
    labeled(fonts, "Radio group", vstack(
      { gap: 5 },
      choiceRow(fonts, radioOption({ name: "preferences.contact", option: "email", selected: true, ...small }), "Email"),
      choiceRow(fonts, radioOption({ name: "preferences.contact", option: "phone", ...small }), "Phone"),
      choiceRow(fonts, radioOption({ name: "preferences.contact", option: "none", ...small }), "Do not contact")
    )),
    labeled(fonts, "Dropdown", dropdown({
      name: "preferences.state",
      options: ["California", "New York", "Washington"],
      selected: "California",
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Editable dropdown", dropdown({
      name: "preferences.viewer",
      options: ["Acrobat", "Chromium", "Firefox", "Preview"],
      selected: "Chromium",
      editable: true,
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Sorted dropdown", dropdown({
      name: "preferences.channels",
      options: ["Email", "SMS", "Push"],
      selected: "Push",
      sorted: true,
      ...fieldAppearance(fonts)
    })),
    labeled(fonts, "Multiselect option list", optionList({
      name: "preferences.features",
      options: ["Forms", "Tables", "Encryption", "Streaming"],
      selected: ["Forms", "Streaming"],
      multiselect: true,
      ...fieldAppearance(fonts, FIELD_WIDTH, 66)
    }))
  );

  const actions = vstack(
    {
      width: PAGE_WIDTH,
      gap: 7,
      padding: 11,
      background: hex("#f1f3ff"),
      border: { color: hex("#c7c9ff"), width: 1 },
      borderRadius: 5,
      margin: { top: 9 }
    },
    text("Actions and persistence", { size: 11, font: fonts.bold, color: INK }),
    text(
      "Reset is local. Submit sends values to the public httpbin test service, then redirects to the BoxPDF repository; Reader supports this, while browser viewers may block file-to-HTTPS submission by origin policy. Save/reopen testing uses Save As.",
      { size: 8, font: fonts.font, color: MUTED, width: PAGE_WIDTH - 22, lineHeight: 10 }
    ),
    hstack(
      { gap: 8 },
      button({
        name: "actions.reset",
        label: "Reset form",
        width: 112,
        height: 25,
        font: fonts.bold,
        fontSize: 9,
        textColor: INK,
        backgroundColor: hex("#ffffff"),
        borderColor: BORDER,
        borderWidth: 1
      }),
      button({
        name: "actions.submit",
        label: "Submit test form",
        width: 137,
        height: 25,
        font: fonts.bold,
        fontSize: 9,
        textColor: hex("#ffffff"),
        backgroundColor: PURPLE,
        borderColor: PURPLE,
        borderWidth: 1
      }),
      button({
        name: "actions.docs",
        label: "Open BoxPDF repo",
        width: 137,
        height: 25,
        font: fonts.bold,
        fontSize: 9,
        textColor: INK,
        backgroundColor: hex("#ffffff"),
        borderColor: BORDER,
        borderWidth: 1
      })
    )
  );

  await renderFlow(pdf, [
    vstack(
      { width: PAGE_WIDTH },
      text("BoxPDF AcroForm compatibility sheet", theme.type.h1),
      text(
        "Exercise every portable BoxPDF form node. Change several values, test Reset, save a copy, close it, and reopen it in each viewer.",
        { size: 9, font: fonts.font, color: MUTED, width: PAGE_WIDTH, lineHeight: 12, margin: { top: 3 } }
      ),
      hline({ color: hex("#d9deea"), margin: { top: 10, bottom: 11 } }),
      hstack({ width: PAGE_WIDTH, gap: 20, align: "start" }, left, right),
      actions
    )
  ], {
    size: PageSizes.Letter,
    margin: 36,
    title: "BoxPDF AcroForm compatibility sheet",
    author: "BoxPDF",
    subject: "Interactive AcroForm viewer compatibility test",
    creator: "boxpdf",
    producer: "boxpdf"
  });

  attachAction(pdf, "actions.reset", { S: "ResetForm" });
  attachAction(pdf, "actions.submit", {
    S: "SubmitForm",
    F: PDFString.of(SUBMIT_URL),
    // ExportFormat (bit 3): submit HTML form data; POST is the default method.
    Flags: 4
  });
  attachAction(pdf, "actions.docs", {
    S: "URI",
    URI: PDFString.of("https://github.com/earonesty/boxpdf")
  });

  const bytes = await savePdf(pdf);
  writeFileSync(OUTPUT, bytes);
  console.log(`wrote ${OUTPUT} (${bytes.byteLength} bytes)`);
}

await main();
