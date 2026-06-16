/**
 * boxpdf — Tiny box-layout DSL over pdf-lib.
 *
 * Compose PDFs with vstack/hstack/text/image/spacer/hline/vline. Sized,
 * padded, bordered, justified, aligned, and word-wrapped — no coordinate
 * math required. Works in any runtime that runs pdf-lib (Node, Cloudflare
 * Workers, Deno, browsers).
 */

export {
  aspectRatio,
  flex,
  group,
  hline,
  hstack,
  image,
  imageFit,
  inlineNode,
  keepTogether,
  link,
  linkRun,
  paragraph,
  run,
  spacer,
  svgPath,
  text,
  vline,
  vstack
} from "./nodes.js";
export { table } from "./table.js";
export type { CellVerticalAlign, ColumnSpec, ColumnWidth, TableCell, TableCellInput, TableDivider, TableOptions } from "./table.js";
export type { TextOptions } from "./nodes.js";
export type {
  InlineNodeRun,
  InlineVerticalAlign,
  ParagraphFloat,
  ParagraphFloatLayout,
  ParagraphItem,
  ParagraphLayout,
  ParagraphProps,
  ParagraphRun,
  TextRunStyle
} from "./paragraph.js";

export { measure, measureContent, resolveMainAxis } from "./measure.js";
export type { MainAxis, MainAxisLayout, MeasureProfileEvent } from "./measure.js";
export { render, type RenderOptions } from "./render.js";
export { renderFlow, renderToPdf, flowToPdf, PageSizes, pageInner, pageContent } from "./document.js";

// Re-export the pdf-lib symbols you need on the common path so a basic
// document needs no direct `pdf-lib` import. pdf-lib is a peer dependency.
export { PDFDocument, StandardFonts } from "pdf-lib";
export type { PDFFont, PDFImage, PDFPage } from "pdf-lib";

export { streamFlow, nodeAdapter } from "./stream.js";
export type { StreamFlowOptions, StreamPageContext } from "./stream.js";
export type {
  PageOptions,
  FlowOptions,
  PageSize,
  PageContext,
  RenderFlowProfileCallback,
  RenderFlowProfileEvent,
  DocumentMetadata
} from "./document.js";

export { Colors, hex, rgb255 } from "./colors.js";
export { formatCurrency } from "./format.js";
export { defineStyles } from "./styles.js";
export { embedFont, loadFont, loadImage, standardFonts, type AssetSource, type LoadFontOptions, type StandardFontSet, type StandardFontFamily } from "./assets.js";
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeRadii,
  ThemeType,
  ThemeFonts,
  ThemedTextStyle
} from "./theme.js";
export { cleanTheme } from "./themes/clean.js";
export { stripeTheme } from "./themes/stripe.js";
export { editorialTheme } from "./themes/editorial.js";
export { brutalistTheme } from "./themes/brutalist.js";

export type {
  Align,
  BackgroundImage,
  Border,
  BorderSides,
  BreakInside,
  BoxStyle,
  CrossAxis,
  Edges,
  EdgesInput,
  Justify,
  Node,
  Overflow,
  Position,
  Fragmentation,
  RGB,
  Size,
  TextProps
} from "./types.js";
