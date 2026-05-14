import { edges, type Node, type Size } from "./types.js";
import { ellipsize, fontAscent, measureText, wrapText } from "./text.js";

/**
 * Compute the intrinsic size of a node given an available `parentWidth`.
 *
 * The returned size includes the node's own margin so a parent stack can use
 * the result directly when summing child sizes.
 */
export function measure(node: Node, parentWidth: number): Size {
  const intrinsic = measureContent(node, parentWidth);
  const m = nodeMargin(node);
  return {
    width: intrinsic.width + m.left + m.right,
    height: intrinsic.height + m.top + m.bottom
  };
}

/**
 * Like `measure` but returns the size WITHOUT the node's outer margin —
 * used when a parent has already accounted for the margin separately.
 */
export function measureContent(node: Node, parentWidth: number): Size {
  switch (node.kind) {
    case "text": {
      const { props } = node;
      const intrinsicWidth = measureText(props.font, props.size, node.text);
      const slotWidth = props.width ?? intrinsicWidth;
      const wrapWidth = props.width ?? parentWidth;
      const lineHeight = props.lineHeight ?? fontAscent(props.font, props.size);
      const lines = props.width
        ? clampLines(wrapText(props.font, props.size, node.text, wrapWidth), props.maxLines)
        : [node.text];
      const usedLines = props.maxLines ? Math.min(lines.length, props.maxLines) : lines.length;
      return { width: slotWidth, height: lineHeight * Math.max(1, usedLines) };
    }
    case "image":
      return { width: node.width, height: node.height };
    case "spacer":
      return { width: 0, height: node.size };
    case "hline":
      return { width: node.width ?? parentWidth, height: node.thickness };
    case "vline":
      return { width: node.thickness, height: node.height ?? 0 };
    case "vstack": {
      const inset = edges(node.style.padding);
      const fixedWidth = node.style.width;
      const innerWidth = (fixedWidth ?? parentWidth) - inset.left - inset.right;
      let height = 0;
      let maxChildWidth = 0;
      node.children.forEach((child, i) => {
        const childSize = measure(child, innerWidth);
        if (i > 0) height += node.gap;
        height += childSize.height;
        if (childSize.width > maxChildWidth) maxChildWidth = childSize.width;
      });
      return {
        width: fixedWidth ?? maxChildWidth + inset.left + inset.right,
        height: node.style.height ?? height + inset.top + inset.bottom
      };
    }
    case "link":
      return measureContent(node.child, parentWidth);
    case "svgPath":
      return { width: node.width, height: node.height };
    case "hstack": {
      const inset = edges(node.style.padding);
      const fixedWidth = node.style.width;
      const innerWidth = (fixedWidth ?? parentWidth) - inset.left - inset.right;
      let width = 0;
      let maxChildHeight = 0;
      node.children.forEach((child, i) => {
        const childSize = measure(child, innerWidth);
        if (i > 0) width += node.gap;
        width += childSize.width;
        if (childSize.height > maxChildHeight) maxChildHeight = childSize.height;
      });
      return {
        width: fixedWidth ?? width + inset.left + inset.right,
        height: node.style.height ?? maxChildHeight + inset.top + inset.bottom
      };
    }
  }
}

export function nodeMargin(node: Node): { top: number; right: number; bottom: number; left: number } {
  switch (node.kind) {
    case "vstack":
    case "hstack":
      return edges(node.style.margin);
    case "text":
      return edges(node.props.margin);
    case "image":
    case "hline":
    case "vline":
    case "link":
    case "svgPath":
      return edges(node.margin);
    case "spacer":
      return edges(undefined);
  }
}

export function nodeGrow(node: Node): number {
  switch (node.kind) {
    case "vstack":
    case "hstack":
      return node.style.grow ?? 0;
    case "spacer":
      return node.grow ?? 0;
    default:
      return 0;
  }
}

/** Apply word-wrap and maxLines (with ellipsis on the last visible line). */
export function layoutText(
  node: Extract<Node, { kind: "text" }>,
  slotWidth: number
): string[] {
  const { props, text } = node;
  if (!props.width) {
    if (props.maxLines && props.maxLines >= 1) {
      return [ellipsize(props.font, props.size, text, slotWidth)];
    }
    return [text];
  }
  const all = wrapText(props.font, props.size, text, props.width);
  if (!props.maxLines || all.length <= props.maxLines) return all;
  const kept = all.slice(0, props.maxLines);
  const last = kept[kept.length - 1];
  if (last !== undefined) {
    kept[kept.length - 1] = ellipsize(props.font, props.size, last + "…", props.width);
  }
  return kept;
}

function clampLines(lines: string[], maxLines?: number): string[] {
  if (!maxLines || lines.length <= maxLines) return lines;
  return lines.slice(0, maxLines);
}
