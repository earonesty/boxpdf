import type { PDFFont, PDFImage } from "pdf-lib";

export type RGB = { r: number; g: number; b: number };

export type Edges = { top: number; right: number; bottom: number; left: number };
export type EdgesInput = number | Partial<Edges>;

export type Align = "left" | "center" | "right";
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type CrossAxis = "start" | "center" | "end" | "stretch";

export interface BoxStyle {
  /** Fixed width; if omitted, the box sizes to its content. */
  width?: number;
  /** Fixed height; if omitted, the box sizes to its content. */
  height?: number;
  /** Inner spacing between the box's border and its children. */
  padding?: EdgesInput;
  /** Outer spacing around the box. */
  margin?: EdgesInput;
  /** Solid fill color. */
  background?: RGB;
  /** Border specification. */
  border?: { color: RGB; width: number };
  /** Corner radius in points. Applies to background and border. */
  borderRadius?: number;
  /** Flex grow weight (siblings divide remaining main-axis space proportionally). */
  grow?: number;
}

export interface TextProps {
  size: number;
  font: PDFFont;
  color?: RGB;
  /** Horizontal alignment within the slot width. */
  align?: Align;
  /** Slot width (enables word wrapping). If omitted, width is intrinsic. */
  width?: number;
  /** Line height in points; defaults to font's ascender for the size. */
  lineHeight?: number;
  /** Maximum number of wrapped lines (truncates with ellipsis when exceeded). */
  maxLines?: number;
  /** Margin around the text. */
  margin?: EdgesInput;
}

export type Node =
  | {
      kind: "vstack";
      children: Node[];
      style: BoxStyle;
      gap: number;
      justify: Justify;
      align: CrossAxis;
    }
  | {
      kind: "hstack";
      children: Node[];
      style: BoxStyle;
      gap: number;
      justify: Justify;
      align: CrossAxis;
    }
  | {
      kind: "text";
      text: string;
      props: TextProps;
    }
  | {
      kind: "image";
      image: PDFImage;
      width: number;
      height: number;
      margin?: EdgesInput;
    }
  | {
      kind: "spacer";
      size: number;
      grow?: number;
    }
  | {
      kind: "hline";
      color: RGB;
      thickness: number;
      width?: number;
      margin?: EdgesInput;
    }
  | {
      kind: "vline";
      color: RGB;
      thickness: number;
      height?: number;
      margin?: EdgesInput;
    };

export interface Size {
  width: number;
  height: number;
}

export function edges(p: EdgesInput | undefined): Edges {
  if (p === undefined) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof p === "number") return { top: p, right: p, bottom: p, left: p };
  return {
    top: p.top ?? 0,
    right: p.right ?? 0,
    bottom: p.bottom ?? 0,
    left: p.left ?? 0
  };
}
