/**
 * boxpdf — Tiny box-layout DSL over pdf-lib.
 *
 * Compose PDFs with vstack/hstack/text/image/spacer/hline/vline. Sized,
 * padded, bordered, justified, aligned, and word-wrapped — no coordinate
 * math required. Works in any runtime that runs pdf-lib (Node, Cloudflare
 * Workers, Deno, browsers).
 */

export {
  flex,
  group,
  hline,
  hstack,
  image,
  keepTogether,
  link,
  spacer,
  svgPath,
  text,
  vline,
  vstack
} from "./nodes.js";
export { table } from "./table.js";
export type { ColumnSpec, ColumnWidth, TableDivider, TableOptions } from "./table.js";
export type { TextOptions } from "./nodes.js";

export { measure, measureContent, resolveMainAxis } from "./measure.js";
export type { MainAxis, MainAxisLayout } from "./measure.js";
export { render, type RenderOptions } from "./render.js";
export { renderFlow, renderToPdf, PageSizes, pageInner, pageContent } from "./document.js";
export { streamFlow, nodeAdapter } from "./stream.js";
export type { StreamFlowOptions, StreamPageContext } from "./stream.js";
export type {
  PageOptions,
  FlowOptions,
  PageSize,
  PageContext,
  DocumentMetadata
} from "./document.js";

export { Colors, hex, rgb255 } from "./colors.js";
export { formatCurrency } from "./format.js";
export { defineStyles } from "./styles.js";
export { embedFont, loadFont, loadImage, type AssetSource, type LoadFontOptions } from "./assets.js";
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeRadii,
  ThemeType,
  ThemedTextStyle
} from "./theme.js";
export { cleanTheme } from "./themes/clean.js";
export { stripeTheme } from "./themes/stripe.js";
export { editorialTheme } from "./themes/editorial.js";
export { brutalistTheme } from "./themes/brutalist.js";

export type {
  Align,
  BoxStyle,
  CrossAxis,
  Edges,
  EdgesInput,
  Justify,
  Node,
  RGB,
  Size,
  TextProps
} from "./types.js";
