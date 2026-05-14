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

export interface TextOptions {
  size: number;
  font: PDFFont;
  color?: RGB;
  align?: "left" | "center" | "right";
  width?: number;
  lineHeight?: number;
  maxLines?: number;
  margin?: EdgesInput;
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
    margin: options.margin
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
