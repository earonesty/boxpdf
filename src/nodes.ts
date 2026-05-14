import type { PDFFont, PDFImage } from "pdf-lib";
import type {
  BoxStyle,
  CrossAxis,
  EdgesInput,
  Justify,
  Node,
  RGB,
  TextProps
} from "./types.js";

type StackOptions = BoxStyle & {
  gap?: number;
  justify?: Justify;
  align?: CrossAxis;
};

export function vstack(options: StackOptions, ...children: Node[]): Node {
  const { gap = 0, justify = "start", align = "start", ...style } = options;
  return { kind: "vstack", children, style, gap, justify, align };
}

export function hstack(options: StackOptions, ...children: Node[]): Node {
  const { gap = 0, justify = "start", align = "start", ...style } = options;
  return { kind: "hstack", children, style, gap, justify, align };
}

/** Convenience: a vstack with no styling, just to group children. */
export function group(...children: Node[]): Node {
  return vstack({}, ...children);
}

/**
 * Wraps children so that, under `renderFlow`, they paginate as one atomic
 * unit — if the combined height won't fit on the current page, the whole
 * group is pushed to the next page intact. Use it to keep
 * subtotal/tax/total triples together, table-row + its continuation, etc.
 */
export function keepTogether(
  options: { gap?: number; margin?: import("./types.js").EdgesInput },
  ...children: Node[]
): Node {
  const { gap = 0, margin } = options;
  return vstack({ gap, margin }, ...children);
}

export interface TextOptions {
  size: number;
  font: PDFFont;
  color?: RGB;
  align?: "left" | "center" | "right";
  width?: number;
  lineHeight?: number;
  maxLines?: number;
  margin?: EdgesInput;
  underline?: boolean;
  strikethrough?: boolean;
}

export function text(content: string, options: TextOptions): Node {
  const props: TextProps = {
    size: options.size,
    font: options.font,
    color: options.color,
    align: options.align ?? "left",
    width: options.width,
    lineHeight: options.lineHeight,
    maxLines: options.maxLines,
    margin: options.margin,
    underline: options.underline,
    strikethrough: options.strikethrough
  };
  return { kind: "text", text: content, props };
}

export function image(
  pdfImage: PDFImage,
  options: { width: number; height: number; margin?: EdgesInput }
): Node {
  return {
    kind: "image",
    image: pdfImage,
    width: options.width,
    height: options.height,
    margin: options.margin
  };
}

export function spacer(size: number, options?: { grow?: number }): Node {
  return { kind: "spacer", size, grow: options?.grow };
}

/** A flexible spacer that absorbs leftover space along the main axis. */
export function flex(weight = 1): Node {
  return { kind: "spacer", size: 0, grow: weight };
}

export function hline(
  options: { color: RGB; thickness?: number; width?: number; margin?: EdgesInput }
): Node {
  return {
    kind: "hline",
    color: options.color,
    thickness: options.thickness ?? 1,
    width: options.width,
    margin: options.margin
  };
}

export function vline(
  options: { color: RGB; thickness?: number; height?: number; margin?: EdgesInput }
): Node {
  return {
    kind: "vline",
    color: options.color,
    thickness: options.thickness ?? 1,
    height: options.height,
    margin: options.margin
  };
}

/**
 * Render a single SVG path via pdf-lib's `drawSvgPath`. Useful for logos,
 * monoline icons, decorative shapes — anything you can express as a single
 * `<path d="…">` string.
 *
 * Note this is **not** a full SVG renderer — `<rect>`, `<circle>`, `<g>`,
 * gradients, and CSS styles aren't supported. Convert your SVG to a single
 * compound path (e.g. with `svgo --pretty --multipass` and `--inline-paths`,
 * or any "flatten paths" tool) before passing the `d` string here.
 *
 * @example
 *   svgPath({
 *     d: "M2 12 L7 17 L22 2",
 *     width: 24, height: 24,
 *     borderColor: hex("#16a34a"), borderWidth: 2
 *   })
 */
export function svgPath(options: {
  d: string;
  width: number;
  height: number;
  scale?: number;
  color?: RGB;
  borderColor?: RGB;
  borderWidth?: number;
  margin?: EdgesInput;
}): Node {
  return {
    kind: "svgPath",
    d: options.d,
    width: options.width,
    height: options.height,
    scale: options.scale,
    color: options.color,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
    margin: options.margin
  };
}

/**
 * Wraps a child node and registers a clickable hyperlink annotation over its
 * rendered bounding box. The annotation is added at render time via pdf-lib's
 * page annotation array, so any href works (https, mailto, tel, etc.).
 *
 * @example
 *   link({ href: "https://example.com/manage" },
 *     text("Manage booking", { size: 11, font, color: hex("#0066cc"), underline: true })
 *   )
 */
export function link(
  options: { href: string; margin?: EdgesInput },
  child: Node
): Node {
  return { kind: "link", href: options.href, child, margin: options.margin };
}
