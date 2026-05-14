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
  spacer,
  text,
  vline,
  vstack
} from "./nodes.js";
export type { TextOptions } from "./nodes.js";

export { measure, measureContent } from "./measure.js";
export { render, type RenderOptions } from "./render.js";
export { renderFlow, renderToPdf, PageSizes } from "./document.js";
export type { PageOptions, FlowOptions, PageSize, PageContext } from "./document.js";

export { Colors, hex, rgb255 } from "./colors.js";
export { formatCurrency } from "./format.js";

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
