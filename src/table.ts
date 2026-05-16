import type { Align, BorderSides, BoxStyle, EdgesInput, Node, RGB } from "./types.js";
import { edges } from "./types.js";
import { hline, hstack, vstack } from "./nodes.js";
import { measure } from "./measure.js";

export type ColumnWidth = number | "auto" | `${number}fr`;
export type CellVerticalAlign = "top" | "middle" | "bottom";

export interface ColumnSpec {
  /**
   * Column width. Accepts:
   * - a fixed number of points (e.g. `80`)
   * - a fractional weight string (e.g. `"1fr"`, `"2fr"`) — the remaining
   *   horizontal space after fixed columns is divided among `fr` columns
   *   proportionally
   * - `"auto"` — uses the column's intrinsic content width (treated as
   *   `1fr` if the table has a fixed `width` and no other `fr` columns).
   */
  width?: ColumnWidth;
  /** Horizontal alignment hint passed down to text cells when they're built from strings. */
  align?: Align;
}

export interface TableDivider {
  color: RGB;
  thickness?: number;
}

export interface TableCell {
  content: Node;
  colSpan?: number;
  padding?: EdgesInput;
  background?: RGB;
  border?: BoxStyle["border"];
  borderSides?: BorderSides;
  borderRadius?: number;
  align?: Align;
  valign?: CellVerticalAlign;
}

export type TableCellInput = Node | TableCell;

export interface TableOptions {
  /** Total table width including any `padding`. If omitted, fixed columns sum + any `fr` columns get 0 width. */
  width?: number;
  /** Column definitions. Must match the length of every row / header / footer. */
  columns: ColumnSpec[];
  /** Optional header row — drawn first, with a stronger divider beneath by default. */
  header?: TableCellInput[];
  /** Body rows. Cells may span columns; each row must cover `columns.length` columns. */
  rows: TableCellInput[][];
  /** Optional footer row — drawn last, with a stronger divider above. */
  footer?: TableCellInput[];
  /**
   * Vertical padding inside each cell row (top + bottom only). Defaults to
   * `{ top: 6, bottom: 6 }`. Horizontal spacing is handled by `columnGap`
   * and the table-level `padding`; cells themselves do not add horizontal
   * insets — that keeps column widths predictable across header / body /
   * footer rows.
   */
  cellPadding?: EdgesInput;
  /** Horizontal gap between columns. Defaults to 12. */
  columnGap?: number;
  /**
   * Padding applied to the whole table — wraps every row, useful when you
   * want to inset table content from an outer `border` / `background`.
   */
  padding?: EdgesInput;
  /** Divider drawn between body rows. Omit to skip. */
  rowDivider?: TableDivider;
  /** Divider drawn under the header. Defaults to `rowDivider` if set, else nothing. */
  headerDivider?: TableDivider;
  /** Divider drawn above the footer. Defaults to `rowDivider`. */
  footerDivider?: TableDivider;
  /** Top-level container style. */
  background?: RGB;
  border?: { color: RGB; width: number };
  borderSides?: BorderSides;
  borderRadius?: number;
  margin?: EdgesInput;
}

/**
 * Resolve column widths to absolute point values. Fixed widths come first,
 * then `fr`/auto columns split the leftover space proportionally.
 */
function resolveColumnWidths(
  columns: ColumnSpec[],
  totalWidth: number,
  columnGap: number
): number[] {
  const gapsTotal = columnGap * Math.max(0, columns.length - 1);
  const available = totalWidth - gapsTotal;
  const widths = new Array<number>(columns.length).fill(0);
  let fixedSum = 0;
  let flexWeight = 0;
  const flex: Array<{ index: number; weight: number }> = [];

  columns.forEach((col, i) => {
    const w = col.width ?? "auto";
    if (typeof w === "number") {
      widths[i] = w;
      fixedSum += w;
      return;
    }
    if (w === "auto") {
      flex.push({ index: i, weight: 1 });
      flexWeight += 1;
      return;
    }
    // "<n>fr"
    const weight = Number(w.slice(0, -2));
    flex.push({ index: i, weight: Number.isFinite(weight) && weight > 0 ? weight : 1 });
    flexWeight += Number.isFinite(weight) && weight > 0 ? weight : 1;
  });

  const remaining = Math.max(0, available - fixedSum);
  if (flexWeight > 0 && remaining > 0) {
    for (const f of flex) {
      widths[f.index] = (f.weight / flexWeight) * remaining;
    }
  }
  return widths;
}

function isTableCell(cell: TableCellInput): cell is TableCell {
  return "content" in cell;
}

function justifyForAlign(align: Align | undefined): "start" | "center" | "end" {
  if (align === "center") return "center";
  if (align === "right") return "end";
  return "start";
}

function justifyForVerticalAlign(align: CellVerticalAlign | undefined): "start" | "center" | "end" {
  if (align === "middle") return "center";
  if (align === "bottom") return "end";
  return "start";
}

function buildCellShell(cell: TableCellInput, width: number, padding: EdgesInput): Node {
  const spec = isTableCell(cell) ? cell : { content: cell };
  const cellPadding = spec.padding ?? padding;
  const pad = edges(cellPadding);
  const innerWidth = Math.max(0, width - pad.left - pad.right);
  const content = spec.align
    ? hstack({ width: innerWidth, justify: justifyForAlign(spec.align) }, spec.content)
    : spec.content;
  return vstack(
    {
      width,
      padding: cellPadding,
      background: spec.background,
      border: spec.border,
      borderSides: spec.borderSides,
      borderRadius: spec.borderRadius,
      justify: justifyForVerticalAlign(spec.valign)
    },
    content
  );
}

function buildRow(
  cells: TableCellInput[],
  widths: number[],
  columnGap: number,
  padding: EdgesInput,
  totalWidth: number
): Node {
  const shells: Node[] = [];
  let column = 0;
  for (const cell of cells) {
    const span = Math.max(1, Math.floor(isTableCell(cell) ? cell.colSpan ?? 1 : 1));
    if (column + span > widths.length) {
      throw new Error(
        `boxpdf table: row spans ${column + span} column(s) but columns defines ${widths.length}`
      );
    }
    const width =
      widths.slice(column, column + span).reduce((sum, w) => sum + w, 0) +
      columnGap * Math.max(0, span - 1);
    shells.push(buildCellShell(cell, width, padding));
    column += span;
  }
  if (column !== widths.length) {
    throw new Error(
      `boxpdf table: row covers ${column} column(s) but columns defines ${widths.length}`
    );
  }
  const rowHeight = shells.reduce((max, shell) => Math.max(max, measure(shell, totalWidth).height), 0);
  return hstack(
    { width: totalWidth, gap: columnGap },
    ...shells.map((shell) =>
      shell.kind === "vstack"
        ? { ...shell, style: { ...shell.style, height: rowHeight } }
        : shell
    )
  );
}

function dividerNode(d: TableDivider | undefined): Node | undefined {
  if (!d) return undefined;
  return hline({ color: d.color, thickness: d.thickness ?? 1 });
}

/**
 * Build a tabular layout — auto-aligned columns, optional header/footer,
 * optional inter-row dividers, fixed or fractional column widths.
 *
 * @example
 *   table({
 *     width: 480,
 *     columns: [
 *       { width: "1fr", align: "left" },
 *       { width: 60,    align: "right" },
 *       { width: 80,    align: "right" },
 *       { width: 90,    align: "right" }
 *     ],
 *     header: [
 *       text("Item",  theme.type.label),
 *       text("Qty",   { ...theme.type.label, align: "right" }),
 *       text("Unit",  { ...theme.type.label, align: "right" }),
 *       text("Total", { ...theme.type.label, align: "right" })
 *     ],
 *     rows: items.map((it) => [
 *       text(it.name,                            theme.type.body),
 *       text(String(it.qty),                     { ...theme.type.body, align: "right" }),
 *       text(formatCurrency(it.unit),            { ...theme.type.body, align: "right" }),
 *       text(formatCurrency(it.qty * it.unit),  { ...theme.type.body, font: bold, align: "right" })
 *     ]),
 *     rowDivider:    theme.hr,
 *     headerDivider: { color: theme.colors.ink, thickness: 0.8 }
 *   });
 */
export function table(options: TableOptions): Node {
  const {
    width,
    columns,
    header,
    rows,
    footer,
    cellPadding = { top: 6, bottom: 6 },
    columnGap = 12,
    padding,
    rowDivider,
    headerDivider = rowDivider,
    footerDivider = rowDivider,
    background,
    border,
    borderSides,
    borderRadius,
    margin
  } = options;

  const pad = edges(padding);
  // If no explicit width, fall back to the sum of fixed columns + gaps + padding.
  const fixedSum = columns.reduce((sum, col) => sum + (typeof col.width === "number" ? col.width : 0), 0);
  const gapSum = columnGap * Math.max(0, columns.length - 1);
  const fallbackWidth = fixedSum + gapSum + pad.left + pad.right;
  const totalWidth = width ?? fallbackWidth;
  const innerWidth = totalWidth - pad.left - pad.right;

  const widths = resolveColumnWidths(columns, innerWidth, columnGap);
  const children: Node[] = [];

  if (header) {
    children.push(buildRow(header, widths, columnGap, cellPadding, innerWidth));
    const d = dividerNode(headerDivider);
    if (d) children.push(d);
  }
  const headerCount = children.length;

  rows.forEach((row, i) => {
    children.push(buildRow(row, widths, columnGap, cellPadding, innerWidth));
    if (rowDivider && i < rows.length - 1) {
      const d = dividerNode(rowDivider);
      if (d) children.push(d);
    }
  });

  let footerCount = 0;
  if (footer) {
    const d = dividerNode(footerDivider);
    if (d) {
      children.push(d);
      footerCount += 1;
    }
    children.push(buildRow(footer, widths, columnGap, cellPadding, innerWidth));
    footerCount += 1;
  }

  const node = vstack(
    { width: totalWidth, padding, background, border, borderSides, borderRadius, margin },
    ...children
  );
  if (node.kind === "vstack") {
    node.fragmentation = { kind: "table", headerCount, footerCount };
  }
  return node;
}
