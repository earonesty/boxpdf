import {
  PDFButton,
  PDFCheckBox,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  TextAlignment,
  rgb,
  type PDFDocument,
  type PDFField,
  type PDFPage
} from "pdf-lib";
import type {
  Align,
  FormFieldAppearance,
  FormFieldNode,
  RGB
} from "./types.js";

export type FormFieldOptions = FormFieldAppearance;

export interface TextFieldOptions extends FormFieldOptions {
  name: string;
  value?: string;
  multiline?: boolean;
  password?: boolean;
  maxLength?: number;
  combed?: boolean;
  align?: Align;
}

export interface CheckboxOptions extends Omit<FormFieldOptions, "font" | "fontSize" | "textColor"> {
  name: string;
  checked?: boolean;
}

export interface RadioOptionOptions extends Omit<FormFieldOptions, "font" | "fontSize" | "textColor"> {
  name: string;
  option: string;
  selected?: boolean;
  offToggleable?: boolean;
  mutuallyExclusive?: boolean;
}

export interface DropdownOptions extends FormFieldOptions {
  name: string;
  options: string[];
  selected?: string;
  editable?: boolean;
  sorted?: boolean;
}

export interface OptionListOptions extends FormFieldOptions {
  name: string;
  options: string[];
  selected?: string | string[];
  multiselect?: boolean;
  sorted?: boolean;
}

export interface ButtonOptions extends FormFieldOptions {
  name: string;
  label: string;
}

function validateBase(options: FormFieldOptions & { name: string }): void {
  if (options.name.trim().length === 0) {
    throw new Error("boxpdf form field: name must not be empty");
  }
  if (!Number.isFinite(options.width) || options.width <= 0) {
    throw new Error(`boxpdf form field \"${options.name}\": width must be positive`);
  }
  if (!Number.isFinite(options.height) || options.height <= 0) {
    throw new Error(`boxpdf form field \"${options.name}\": height must be positive`);
  }
  if (options.fontSize !== undefined && (!Number.isFinite(options.fontSize) || options.fontSize <= 0)) {
    throw new Error(`boxpdf form field \"${options.name}\": fontSize must be positive`);
  }
  if (options.borderWidth !== undefined && (!Number.isFinite(options.borderWidth) || options.borderWidth < 0)) {
    throw new Error(`boxpdf form field \"${options.name}\": borderWidth must not be negative`);
  }
}

function appearance(options: FormFieldOptions): FormFieldAppearance {
  return {
    width: options.width,
    height: options.height,
    margin: options.margin,
    alignSelf: options.alignSelf,
    font: options.font,
    fontSize: options.fontSize,
    textColor: options.textColor,
    backgroundColor: options.backgroundColor,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
    hidden: options.hidden,
    readOnly: options.readOnly,
    required: options.required,
    exported: options.exported
  };
}

export function textField(options: TextFieldOptions): FormFieldNode {
  validateBase(options);
  if (options.maxLength !== undefined && (!Number.isInteger(options.maxLength) || options.maxLength < 0)) {
    throw new Error(`boxpdf text field \"${options.name}\": maxLength must be a non-negative integer`);
  }
  if (options.combed && options.maxLength === undefined) {
    throw new Error(`boxpdf text field \"${options.name}\": combed fields require maxLength`);
  }
  if (options.combed && (options.multiline || options.password)) {
    throw new Error(`boxpdf text field \"${options.name}\": combed fields cannot be multiline or password fields`);
  }
  if (options.password && options.value !== undefined) {
    throw new Error(`boxpdf text field \"${options.name}\": password fields cannot have a prefilled value`);
  }
  return {
    kind: "formField",
    fieldType: "text",
    name: options.name,
    appearance: appearance(options),
    value: options.value,
    multiline: options.multiline,
    password: options.password,
    maxLength: options.maxLength,
    combed: options.combed,
    align: options.align
  };
}

export function checkbox(options: CheckboxOptions): FormFieldNode {
  validateBase(options);
  return {
    kind: "formField",
    fieldType: "checkbox",
    name: options.name,
    appearance: appearance(options),
    checked: options.checked
  };
}

export function radioOption(options: RadioOptionOptions): FormFieldNode {
  validateBase(options);
  if (options.option.length === 0) {
    throw new Error(`boxpdf radio field \"${options.name}\": option must not be empty`);
  }
  return {
    kind: "formField",
    fieldType: "radio",
    name: options.name,
    appearance: appearance(options),
    option: options.option,
    selected: options.selected,
    offToggleable: options.offToggleable,
    mutuallyExclusive: options.mutuallyExclusive
  };
}

export function dropdown(options: DropdownOptions): FormFieldNode {
  validateBase(options);
  validateOptions(options.name, options.options);
  return {
    kind: "formField",
    fieldType: "dropdown",
    name: options.name,
    appearance: appearance(options),
    options: [...options.options],
    selected: options.selected,
    editable: options.editable,
    sorted: options.sorted
  };
}

export function optionList(options: OptionListOptions): FormFieldNode {
  validateBase(options);
  validateOptions(options.name, options.options);
  return {
    kind: "formField",
    fieldType: "optionList",
    name: options.name,
    appearance: appearance(options),
    options: [...options.options],
    selected: Array.isArray(options.selected) ? [...options.selected] : options.selected,
    multiselect: options.multiselect,
    sorted: options.sorted
  };
}

export function button(options: ButtonOptions): FormFieldNode {
  validateBase(options);
  return {
    kind: "formField",
    fieldType: "button",
    name: options.name,
    appearance: appearance(options),
    label: options.label
  };
}

function validateOptions(name: string, options: string[]): void {
  if (options.length === 0) {
    throw new Error(`boxpdf choice field \"${name}\": options must not be empty`);
  }
  if (new Set(options).size !== options.length) {
    throw new Error(`boxpdf choice field \"${name}\": options must be unique`);
  }
}

function color(value: RGB | undefined) {
  return value ? rgb(value.r, value.g, value.b) : undefined;
}

function widgetOptions(node: FormFieldNode, x: number, y: number) {
  const style = node.appearance;
  return {
    x,
    y,
    width: style.width,
    height: style.height,
    textColor: color(style.textColor),
    backgroundColor: color(style.backgroundColor),
    borderColor: color(style.borderColor),
    borderWidth: style.borderWidth,
    font: style.font,
    hidden: style.hidden
  };
}

function applyCommonFlags(field: PDFField, style: FormFieldAppearance): void {
  if (style.readOnly === true) field.enableReadOnly();
  else if (style.readOnly === false) field.disableReadOnly();
  if (style.required === true) field.enableRequired();
  else if (style.required === false) field.disableRequired();
  if (style.exported === false) field.disableExporting();
  else if (style.exported === true) field.enableExporting();
}

function existingAs<T extends PDFField>(
  pdf: PDFDocument,
  name: string,
  expected: Function & { prototype: T },
  label: string
): T | undefined {
  const existing = pdf.getForm().getFieldMaybe(name);
  if (!existing) return undefined;
  if (!(existing instanceof expected)) {
    throw new Error(
      `boxpdf form field \"${name}\" is already defined as ${existing.constructor.name}, not ${label}`
    );
  }
  return existing as T;
}

function textAlignment(align: Align): TextAlignment {
  if (align === "center") return TextAlignment.Center;
  if (align === "right") return TextAlignment.Right;
  return TextAlignment.Left;
}

/** Internal render hook used after BoxPDF has resolved the widget's page coordinates. */
export function renderFormField(node: FormFieldNode, page: PDFPage, x: number, yTop: number): void {
  const pdf = page.doc;
  const form = pdf.getForm();
  const y = yTop - node.appearance.height;
  const options = widgetOptions(node, x, y);
  // Reusing a field name maps to one logical PDF field. Text, dropdown, and
  // option-list initialization settings apply only on first creation.
  // For radio groups, group flags also apply only first-time.
  // `selected: true` marks the current option; false does not clear existing radio selections.

  switch (node.fieldType) {
    case "text": {
      let field = existingAs(pdf, node.name, PDFTextField, "text field");
      const created = !field;
      field ??= form.createTextField(node.name);
      if (created) {
        if (node.value !== undefined) field.setText(node.value);
        if (node.maxLength !== undefined) field.setMaxLength(node.maxLength);
        if (node.multiline) field.enableMultiline();
        if (node.password) field.enablePassword();
        if (node.password && node.appearance.exported === undefined) field.disableExporting();
        if (node.combed) field.enableCombing();
        if (node.align) field.setAlignment(textAlignment(node.align));
      }
      applyCommonFlags(field, node.appearance);
      field.addToPage(page, options);
      if (node.appearance.fontSize !== undefined) field.setFontSize(node.appearance.fontSize);
      return;
    }
    case "checkbox": {
      let field = existingAs(pdf, node.name, PDFCheckBox, "checkbox");
      field ??= form.createCheckBox(node.name);
      const checked = node.checked ?? field.isChecked();
      applyCommonFlags(field, node.appearance);
      field.addToPage(page, options);
      // addToPage creates a new widget in its off state. Apply the field value
      // afterward so the new widget's appearance state matches the field.
      checked ? field.check() : field.uncheck();
      return;
    }
    case "radio": {
      let field = existingAs(pdf, node.name, PDFRadioGroup, "radio group");
      const created = !field;
      field ??= form.createRadioGroup(node.name);
      if (created) {
        if (node.offToggleable === true) field.enableOffToggling();
        else if (node.offToggleable === false) field.disableOffToggling();
        if (node.mutuallyExclusive === true) field.enableMutualExclusion();
        else if (node.mutuallyExclusive === false) field.disableMutualExclusion();
      }
      applyCommonFlags(field, node.appearance);
      field.addOptionToPage(node.option, page, options);
      if (node.selected) field.select(node.option);
      return;
    }
    case "dropdown": {
      let field = existingAs(pdf, node.name, PDFDropdown, "dropdown");
      const created = !field;
      field ??= form.createDropdown(node.name);
      if (created) {
        field.addOptions(node.options);
        if (node.editable) field.enableEditing();
        if (node.sorted) field.enableSorting();
        if (node.selected !== undefined) field.select(node.selected);
      }
      applyCommonFlags(field, node.appearance);
      field.addToPage(page, options);
      if (node.appearance.fontSize !== undefined) field.setFontSize(node.appearance.fontSize);
      return;
    }
    case "optionList": {
      let field = existingAs(pdf, node.name, PDFOptionList, "option list");
      const created = !field;
      field ??= form.createOptionList(node.name);
      if (created) {
        field.addOptions(node.options);
        if (node.multiselect) field.enableMultiselect();
        if (node.sorted) field.enableSorting();
        if (node.selected !== undefined) field.select(node.selected);
      }
      applyCommonFlags(field, node.appearance);
      field.addToPage(page, options);
      if (node.appearance.fontSize !== undefined) field.setFontSize(node.appearance.fontSize);
      return;
    }
    case "button": {
      let field = existingAs(pdf, node.name, PDFButton, "button");
      field ??= form.createButton(node.name);
      applyCommonFlags(field, node.appearance);
      field.addToPage(node.label, page, options);
      if (node.appearance.fontSize !== undefined) field.setFontSize(node.appearance.fontSize);
      return;
    }
  }
}

/** Return the current values of every portable AcroForm field in a document. */
export function getFormValues(pdf: PDFDocument): Record<string, string | string[] | boolean | undefined> {
  const values: Record<string, string | string[] | boolean | undefined> = {};
  for (const field of pdf.getForm().getFields()) {
    if (field instanceof PDFTextField) values[field.getName()] = field.getText();
    else if (field instanceof PDFCheckBox) values[field.getName()] = field.isChecked();
    else if (field instanceof PDFRadioGroup) values[field.getName()] = field.getSelected();
    else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      values[field.getName()] = field.getSelected();
    }
  }
  return values;
}

export type FormValue = string | string[] | boolean | undefined;

/** Set values on existing portable AcroForm fields by their document-global names. */
export function setFormValues(
  pdf: PDFDocument,
  values: Record<string, FormValue>,
  options?: { font?: FormFieldAppearance["font"] }
): void {
  const form = pdf.getForm();
  for (const [name, value] of Object.entries(values)) {
    const field = form.getFieldMaybe(name);
    if (!field) throw new Error(`boxpdf form field \"${name}\" does not exist`);
    if (field instanceof PDFTextField) {
      if (value !== undefined && typeof value !== "string") valueTypeError(name, "string or undefined");
      field.setText(value as string | undefined);
    } else if (field instanceof PDFCheckBox) {
      if (typeof value !== "boolean") valueTypeError(name, "boolean");
      value ? field.check() : field.uncheck();
    } else if (field instanceof PDFRadioGroup) {
      if (value !== undefined && typeof value !== "string") valueTypeError(name, "string or undefined");
      value === undefined ? field.clear() : field.select(value as string);
    } else if (field instanceof PDFDropdown) {
      if (value === undefined) field.clear();
      else if (typeof value === "string") field.select(value);
      else valueTypeError(name, "string or undefined");
    } else if (field instanceof PDFOptionList) {
      if (value === undefined) field.clear();
      else if (typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string"))) {
        field.select(value);
      } else {
        valueTypeError(name, "string, string[], or undefined");
      }
    } else {
      throw new Error(`boxpdf form field \"${name}\" does not accept a value`);
    }
  }
  if (options?.font) form.updateFieldAppearances(options.font);
}

function valueTypeError(name: string, expected: string): never {
  throw new Error(`boxpdf form field \"${name}\": value must be ${expected}`);
}

/** Flatten all AcroForm widgets into page content, making them non-interactive. */
export function flattenForm(
  pdf: PDFDocument,
  options?: { updateFieldAppearances?: boolean; font?: FormFieldAppearance["font"] }
): void {
  const form = pdf.getForm();
  if (options?.font) form.updateFieldAppearances(options.font);
  form.flatten({
    updateFieldAppearances: options?.font ? false : (options?.updateFieldAppearances ?? true)
  });
}
