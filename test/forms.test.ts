import { describe, expect, it } from "vitest";
import {
  PDFButton,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts
} from "pdf-lib";
import {
  button,
  checkbox,
  dropdown,
  flattenForm,
  getFormValues,
  hstack,
  optionList,
  radioOption,
  renderFlow,
  renderToPdf,
  savePdf,
  setFormValues,
  streamFlow,
  textField,
  vstack
} from "../src/index.js";

const PDF_ENCRYPTED_ALLOW_FILL_FORMS_PERMISSION = -4;
const PDF_ENCRYPTED_DENY_FILL_FORMS_PERMISSION = PDF_ENCRYPTED_ALLOW_FILL_FORMS_PERMISSION & ~0x100;

function permissionFromOutput(output: string): number {
  const match = /\/P\s+(-?\d+)/.exec(output);
  if (!match) throw new Error("encrypted PDF is missing /P permission value");
  return Number(match[1]);
}

describe("AcroForm nodes", () => {
  it("creates every portable field type with values and flags", async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    await renderFlow(pdf, [
      vstack(
        { gap: 8 },
        textField({
          name: "person.name",
          width: 220,
          height: 24,
          font,
          fontSize: 11,
          value: "Ada Lovelace",
          required: true
        }),
        checkbox({ name: "terms.accepted", width: 16, height: 16, checked: true }),
        hstack(
          { gap: 8 },
          radioOption({ name: "contact", option: "email", width: 16, height: 16, selected: true }),
          radioOption({ name: "contact", option: "phone", width: 16, height: 16 })
        ),
        dropdown({
          name: "state",
          width: 120,
          height: 24,
          font,
          options: ["CA", "NY", "WA"],
          selected: "CA"
        }),
        optionList({
          name: "colors",
          width: 120,
          height: 54,
          font,
          options: ["red", "green", "blue"],
          selected: ["red", "blue"],
          multiselect: true
        }),
        button({ name: "continue", label: "Continue", width: 100, height: 24, font })
      )
    ], { margin: 36 });

    const bytes = await savePdf(pdf);
    const back = await PDFDocument.load(bytes);
    const form = back.getForm();
    expect(form.getTextField("person.name")).toBeInstanceOf(PDFTextField);
    expect(form.getTextField("person.name").getText()).toBe("Ada Lovelace");
    expect(form.getTextField("person.name").isRequired()).toBe(true);
    expect(form.getCheckBox("terms.accepted")).toBeInstanceOf(PDFCheckBox);
    expect(form.getCheckBox("terms.accepted").isChecked()).toBe(true);
    expect(
      form.getCheckBox("terms.accepted").acroField.getWidgets()[0]!.getAppearanceState()?.toString()
    ).not.toBe("/Off");
    expect(form.getRadioGroup("contact")).toBeInstanceOf(PDFRadioGroup);
    expect(form.getRadioGroup("contact").getOptions()).toEqual(["email", "phone"]);
    expect(form.getRadioGroup("contact").getSelected()).toBe("email");
    expect(form.getDropdown("state")).toBeInstanceOf(PDFDropdown);
    expect(form.getDropdown("state").getSelected()).toEqual(["CA"]);
    expect(form.getOptionList("colors")).toBeInstanceOf(PDFOptionList);
    expect(form.getOptionList("colors").getSelected()).toEqual(["red", "blue"]);
    expect(form.getButton("continue")).toBeInstanceOf(PDFButton);
  });

  it("uses resolved stack coordinates and supports multiple widgets for one field", async () => {
    const pdf = await PDFDocument.create();
    const field = textField({ name: "repeated", width: 100, height: 20, margin: 5 });
    const { pages } = await renderFlow(pdf, [vstack({ gap: 10 }, field, field)], {
      size: { width: 300, height: 300 },
      margin: 20
    });

    expect(pages).toHaveLength(1);
    const widgets = pdf.getForm().getTextField("repeated").acroField.getWidgets();
    expect(widgets).toHaveLength(2);
    expect(widgets[0]!.getRectangle()).toMatchObject({ x: 25, y: 255, width: 100, height: 20 });
    expect(widgets[1]!.getRectangle()).toMatchObject({ x: 25, y: 215, width: 100, height: 20 });
  });

  it("reads, updates, and flattens form values", async () => {
    const pdf = await PDFDocument.create();
    await renderFlow(pdf, [
      vstack(
        { gap: 6 },
        textField({ name: "name", width: 120, height: 20, value: "before" }),
        checkbox({ name: "yes", width: 14, height: 14 }),
        dropdown({ name: "choice", width: 100, height: 20, options: ["a", "b"] })
      )
    ]);

    expect(getFormValues(pdf)).toMatchObject({ name: "before", yes: false, choice: [] });
    expect(() => setFormValues(pdf, { choice: ["a", "b"] })).toThrow(/string or undefined/);
    setFormValues(pdf, { name: "after", yes: true, choice: "b" });
    expect(getFormValues(pdf)).toMatchObject({ name: "after", yes: true, choice: ["b"] });

    flattenForm(pdf);
    expect(pdf.getForm().getFields()).toHaveLength(0);
    await expect(savePdf(pdf)).resolves.toBeInstanceOf(Uint8Array);
  });

  it("rejects incompatible field-name reuse", async () => {
    const node = vstack(
      { gap: 4 },
      textField({ name: "duplicate", width: 100, height: 20 }),
      checkbox({ name: "duplicate", width: 14, height: 14 })
    );
    await expect(renderToPdf(node)).rejects.toThrow(/already defined.*not checkbox/);
  });

  it("emits valid interactive fields through streamFlow", async () => {
    const pdf = await PDFDocument.create();
    const chunks: Uint8Array[] = [];
    const writable = new WritableStream<Uint8Array>({
      write(chunk) {
        chunks.push(chunk);
      }
    });

    await streamFlow(pdf, writable, [
      textField({ name: "streamed", width: 120, height: 20, value: "yes" })
    ]);
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }

    const back = await PDFDocument.load(bytes);
    expect(back.getForm().getTextField("streamed").getText()).toBe("yes");
  });

  it("supports encrypted serialization with explicit fillForms permission", async () => {
    const pdf = await PDFDocument.create();
    await renderFlow(pdf, [
      textField({ name: "encrypted", width: 120, height: 20, value: "secret" })
    ]);
    const bytes = await savePdf(pdf, {
      encryption: { password: "reader", permissions: { fillForms: true } }
    });
    expect(bytes.byteLength).toBeGreaterThan(500);
    const output = new TextDecoder().decode(bytes);
    expect(output).toContain("/Filter /Standard");
    expect(permissionFromOutput(output)).toBe(PDF_ENCRYPTED_ALLOW_FILL_FORMS_PERMISSION);
    expect(output.startsWith("%PDF-2.0")).toBe(true);
  });

  it("supports encrypted serialization with denied fillForms permission", async () => {
    const pdf = await PDFDocument.create();
    await renderFlow(pdf, [
      textField({ name: "deniedFillForms", width: 120, height: 20, value: "secret" })
    ]);
    const bytes = await savePdf(pdf, {
      encryption: { password: "reader", permissions: { fillForms: false } }
    });
    const output = new TextDecoder().decode(bytes);
    expect(permissionFromOutput(output)).toBe(PDF_ENCRYPTED_DENY_FILL_FORMS_PERMISSION);
  });

  it("supports non-exportable form fields", async () => {
    const pdf = await PDFDocument.create();
    await renderFlow(pdf, [
      textField({
        name: "person.password",
        width: 120,
        height: 20,
        password: true,
        exported: false
      })
    ]);
    const field = pdf.getForm().getTextField("person.password");
    expect(field.isExported()).toBe(false);
  });

  it("defaults password text fields to non-exportable and keeps setFormValues compatible", async () => {
    const pdf = await PDFDocument.create();
    const password = textField({
      name: "security.password",
      width: 120,
      height: 20,
      password: true
    });
    await renderFlow(pdf, [vstack({ gap: 10 }, password, password)]);

    const field = pdf.getForm().getTextField("security.password");
    expect(field.acroField.getWidgets()).toHaveLength(2);
    expect(field.isExported()).toBe(false);

    setFormValues(pdf, { "security.password": "hunter2" });
    expect(field.getText()).toBe("hunter2");
  });

  it("keeps password fields exportable only when explicitly opted in", async () => {
    const pdf = await PDFDocument.create();
    await renderFlow(pdf, [
      textField({
        name: "security.passwordOptIn",
        width: 120,
        height: 20,
        password: true,
        exported: true
      })
    ]);
    const field = pdf.getForm().getTextField("security.passwordOptIn");
    expect(field.isExported()).toBe(true);
  });

  it("rejects widgets inside non-opaque ancestors", async () => {
    const node = vstack(
      { opacity: 0.8 },
      textField({ name: "faded", width: 100, height: 20 })
    );
    await expect(renderToPdf(node)).rejects.toThrow(/opacity-adjusted form widgets are not supported/);
  });

  it("rejects widgets inside transformed ancestors", async () => {
    const node = vstack(
      { transform: [{ kind: "translate", x: { length: 1, percent: 0 }, y: { length: 0, percent: 0 } }] },
      textField({ name: "moved", width: 100, height: 20 })
    );
    await expect(renderToPdf(node)).rejects.toThrow(/transformed or opacity-adjusted form widgets are not supported/);
  });

  it("validates dimensions and combed-field constraints", () => {
    expect(() => textField({ name: "bad", width: 0, height: 20 })).toThrow(/width must be positive/);
    expect(() => textField({ name: "bad", width: 100, height: 20, combed: true })).toThrow(/require maxLength/);
    expect(() => textField({
      name: "bad",
      width: 100,
      height: 20,
      combed: true,
      maxLength: 4,
      multiline: true
    })).toThrow(/cannot be multiline/);
    expect(() => textField({
      name: "bad",
      width: 100,
      height: 20,
      password: true,
      value: "plaintext"
    })).toThrow(/cannot have a prefilled value/);
  });
});
