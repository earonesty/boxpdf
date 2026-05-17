import type { PDFFont, PDFImage } from "pdf-lib";
import type { ParagraphItem, ParagraphProps } from "./paragraph.js";

export type RGB = { r: number; g: number; b: number };

export type Edges = { top: number; right: number; bottom: number; left: number };
export type EdgesInput = number | Partial<Edges>;

export type Align = "left" | "center" | "right";
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type CrossAxis = "start" | "center" | "end" | "stretch" | "baseline";
export type Position = "relative" | "absolute";
export type Border = { color: RGB; width: number };
export type BorderSides = {
  top?: Border;
  right?: Border;
  bottom?: Border;
  left?: Border;
};
export type BackgroundImage = {
  image: PDFImage;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
};
export type BreakInside = "auto" | "avoid";
export type Overflow = "visible" | "hidden";
export type Fragmentation = {
  kind: "table";
  headerCount: number;
  footerCount: number;
};

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
  /** Image painted behind children and clipped to the box rectangle. */
  backgroundImage?: BackgroundImage;
  /** Border specification. */
  border?: Border;
  /** Per-side border strokes. Square-corner; use `border` for rounded all-side borders. */
  borderSides?: BorderSides;
  /** Corner radius in points. Applies to background and border. */
  borderRadius?: number;
  /**
   * Paint overflow behavior for stack descendants. `hidden` clips children and
   * absolute descendants to the box rectangle. Default `visible`.
   */
  overflow?: Overflow;
  /**
   * CSS-like positioning for boxes. Positioned boxes establish the containing
   * block for absolute descendants. `absolute` removes the box from stack flow
   * and positions it against the nearest positioned ancestor, or render root.
   */
  position?: Position;
  /** Offset from the containing block's top edge when position is absolute. */
  top?: number;
  /** Offset from the containing block's right edge when position is absolute. */
  right?: number;
  /** Offset from the containing block's bottom edge when position is absolute. */
  bottom?: number;
  /** Offset from the containing block's left edge when position is absolute. */
  left?: number;
  /**
   * Paint order for positioned boxes. Higher values render later, above lower
   * values. Boxes with the same `zIndex` keep document order. Default `0`.
   */
  zIndex?: number;
  /** Flex grow weight (siblings divide remaining main-axis space proportionally). */
  grow?: number;
  /**
   * Flex shrink weight. When the children of an hstack/vstack overflow their
   * container along the main axis, items with `shrink > 0` give up
   * proportional shares (`shrink * baseSize`) of the overflow. Shrink only
   * kicks in when intrinsic size exceeds the available space; otherwise it
   * has no effect. Default `0` (no shrink).
   */
  shrink?: number;
  /** Page fragmentation hint. `avoid` keeps the box atomic under renderFlow. */
  breakInside?: BreakInside;
}

export interface TextProps {
  size: number;
  font: PDFFont;
  color?: RGB;
  /** Horizontal alignment within the slot width. */
  align?: Align;
  /** Slot width (enables word wrapping). If omitted, width is intrinsic. */
  width?: number;
  /** When false, explicit newlines still break but width does not soft-wrap. */
  wrap?: boolean;
  /** Line height in points; defaults to the font's full height for the size. */
  lineHeight?: number;
  /** Maximum number of wrapped lines (truncates with ellipsis when exceeded). */
  maxLines?: number;
  /** Margin around the text. */
  margin?: EdgesInput;
  /** Underline each rendered line. */
  underline?: boolean;
  /** Strike a line through each rendered line. */
  strikethrough?: boolean;
  /**
   * Flex shrink weight along the parent's main axis. When set and the
   * parent hstack/vstack overflows, the text's slot width is reduced
   * proportionally and the text re-wraps. By default bounded below by the
   * widest single whitespace-separated word — single-token strings (URLs,
   * hashes) won't shrink unless `breakWords` or `maxLines` is also set.
   */
  shrink?: number;
  /**
   * When `true`, allows shrink to reduce the text below its longest-word
   * width by hard-breaking at character boundaries (CSS
   * `overflow-wrap: break-word`). Off by default — prefer `maxLines` for
   * truncation, this for char-level wrap (monospace tables, hashes).
   */
  breakWords?: boolean;
}

export type Node =
  | {
      kind: "vstack";
      children: Node[];
      style: BoxStyle;
      gap: number;
      justify: Justify;
      align: CrossAxis;
      fragmentation?: Fragmentation;
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
      kind: "paragraph";
      runs: ParagraphItem[];
      props: ParagraphProps;
    }
  | {
      kind: "image";
      image: PDFImage;
      width: number;
      height: number;
      margin?: EdgesInput;
    }
  | {
      kind: "imageBox";
      image: PDFImage;
      width: number;
      height: number;
      imageWidth: number;
      imageHeight: number;
      offsetX: number;
      offsetY: number;
      margin?: EdgesInput;
    }
  | {
      kind: "spacer";
      size: number;
      grow?: number;
      shrink?: number;
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
    }
  | {
      kind: "link";
      href: string;
      child: Node;
      margin?: EdgesInput;
    }
  | {
      kind: "svgPath";
      /** SVG path data (the `d` attribute) — `M`, `L`, `C`, `A`, `Z`, etc. */
      d: string;
      /** Bounding-box width the path occupies in the layout. */
      width: number;
      /** Bounding-box height the path occupies in the layout. */
      height: number;
      /** Uniform scale applied to the path before drawing (default 1). */
      scale?: number;
      /** Fill color. Omit for no fill. */
      color?: RGB;
      /** Border / stroke color. Omit for no stroke. */
      borderColor?: RGB;
      /** Border / stroke width. */
      borderWidth?: number;
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
