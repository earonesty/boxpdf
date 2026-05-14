import { edges, type Node, type Size } from "./types.js";
import { ellipsize, fontAscent, measureText, wrapText } from "./text.js";

export type MainAxis = "horizontal" | "vertical";

export interface MainAxisLayout {
  /** Children, possibly cloned with reduced main-axis dimension when shrink fired. */
  children: Node[];
  /** Final measured size of each (possibly-shrunk) child, including its margin. */
  sizes: Size[];
  /** True when at least one child was shrunk during this resolution. */
  shrank: boolean;
}

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
      const fixedHeight = node.style.height;
      const availableHeight = fixedHeight === undefined ? Infinity : fixedHeight - inset.top - inset.bottom;
      const layout = resolveMainAxis(node.children, "vertical", innerWidth, availableHeight, node.gap);
      const totalGap = node.gap * Math.max(0, node.children.length - 1);
      const totalHeight = layout.sizes.reduce((s, sz) => s + sz.height, 0) + totalGap;
      const maxChildWidth = layout.sizes.reduce((m, s) => (s.width > m ? s.width : m), 0);
      return {
        width: fixedWidth ?? maxChildWidth + inset.left + inset.right,
        height: fixedHeight ?? totalHeight + inset.top + inset.bottom
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
      const layout = resolveMainAxis(node.children, "horizontal", innerWidth, innerWidth, node.gap);
      const totalGap = node.gap * Math.max(0, node.children.length - 1);
      const totalWidth = layout.sizes.reduce((s, sz) => s + sz.width, 0) + totalGap;
      const maxChildHeight = layout.sizes.reduce((m, s) => (s.height > m ? s.height : m), 0);
      return {
        width: fixedWidth ?? totalWidth + inset.left + inset.right,
        height: node.style.height ?? maxChildHeight + inset.top + inset.bottom
      };
    }
  }
}

/**
 * Resolve a stack's main-axis layout, applying flex-shrink when intrinsic
 * sizes exceed the available main-axis dimension and at least one child has
 * `shrink > 0`. Returns possibly-cloned children with reduced widths/heights
 * and their final measured sizes (cross-axis dimensions reflect any text
 * rewrapping that resulted from the shrink).
 *
 * `availableMain` is the inner main-axis space (already net of padding).
 * Pass `Infinity` when the parent has no main-axis constraint — shrink will
 * not fire in that case.
 *
 * `availableCross` is what `measure(child, ...)` should receive as
 * `parentWidth` for sizing context. For an hstack, the main axis IS the width,
 * so the parentWidth passed to children IS availableMain.
 */
export function resolveMainAxis(
  children: Node[],
  axis: MainAxis,
  availableMain: number,
  _availableCross: number,
  gap: number
): MainAxisLayout {
  if (children.length === 0) return { children: [], sizes: [], shrank: false };

  // Measure children with availableMain as their parentWidth — keeps text
  // wrapping behavior consistent with the previous (pre-shrink) measure path.
  const sizes = children.map((c) => measure(c, availableMain));
  if (!Number.isFinite(availableMain)) {
    return { children, sizes, shrank: false };
  }
  const baseMain = sizes.map((s) => (axis === "horizontal" ? s.width : s.height));
  const totalGap = gap * Math.max(0, children.length - 1);
  const totalBase = baseMain.reduce((s, v) => s + v, 0);
  const overflow = totalBase + totalGap - availableMain;
  if (overflow <= 0.0001) {
    return { children, sizes, shrank: false };
  }

  const shrinks = children.map(nodeShrink);
  if (shrinks.every((s) => s <= 0)) {
    return { children, sizes, shrank: false };
  }

  const mins = children.map((c, i) => nodeMinMain(c, axis, baseMain[i] ?? 0));
  const reductions = distributeShrink(baseMain, shrinks, mins, overflow);

  let shrank = false;
  const newChildren = children.map((c, i) => {
    const r = reductions[i] ?? 0;
    if (r <= 0.0001) return c;
    shrank = true;
    return applyShrink(c, (baseMain[i] ?? 0) - r, axis);
  });
  if (!shrank) return { children, sizes, shrank: false };
  // Re-measure shrunken children so cross-axis (e.g. wrapped text height)
  // reflects the new slot.
  const newSizes = newChildren.map((c) => measure(c, availableMain));
  return { children: newChildren, sizes: newSizes, shrank: true };
}

/**
 * Distribute `overflow` across `bases` proportionally to `shrinks[i] * bases[i]`,
 * clamping each item so its final size doesn't drop below `mins[i]`. Iterates
 * up to N+1 rounds, freezing clamped items between rounds so their lost
 * shrink weight redistributes to siblings. Returns reduction amounts.
 */
function distributeShrink(
  bases: number[],
  shrinks: number[],
  mins: number[],
  overflow: number
): number[] {
  const n = bases.length;
  const reductions = new Array<number>(n).fill(0);
  const frozen = shrinks.map((s) => s <= 0);

  for (let iter = 0; iter < n + 2; iter++) {
    const remaining = overflow - reductions.reduce((s, r) => s + r, 0);
    if (remaining <= 0.0001) break;

    let weight = 0;
    for (let i = 0; i < n; i++) {
      if (!frozen[i]) weight += shrinks[i]! * bases[i]!;
    }
    if (weight <= 0) break;

    const tentative = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) {
      if (frozen[i]) continue;
      tentative[i] = ((shrinks[i]! * bases[i]!) / weight) * remaining;
    }

    let anyClamped = false;
    for (let i = 0; i < n; i++) {
      if (frozen[i]) continue;
      const projected = bases[i]! - reductions[i]! - tentative[i]!;
      if (projected < mins[i]!) {
        const headroom = bases[i]! - reductions[i]! - mins[i]!;
        reductions[i]! += Math.max(0, headroom);
        frozen[i] = true;
        anyClamped = true;
      }
    }
    if (!anyClamped) {
      for (let i = 0; i < n; i++) {
        if (!frozen[i]) reductions[i]! += tentative[i]!;
      }
      break;
    }
  }
  return reductions;
}

/** Lower bound for a node's main-axis size when shrinking. */
function nodeMinMain(node: Node, axis: MainAxis, base: number): number {
  if (axis === "horizontal") {
    switch (node.kind) {
      case "text":
        return minTextWidth(node);
      case "vstack":
      case "hstack":
        return 0;
      case "spacer":
        return 0;
      case "hline":
        return 0;
      case "link":
        return nodeMinMain(node.child, axis, base);
      // image, vline, svgPath: dimensions are structural — don't allow shrink below intrinsic.
      default:
        return base;
    }
  }
  // vertical axis
  switch (node.kind) {
    case "vstack":
    case "hstack":
      return 0;
    case "spacer":
      return 0;
    case "vline":
      return 0;
    case "link":
      return nodeMinMain(node.child, axis, base);
    // Text height is determined by line count; we don't reduce it by shrink.
    // Images/svgPath/hline are structural along the vertical axis.
    default:
      return base;
  }
}

function minTextWidth(node: Extract<Node, { kind: "text" }>): number {
  const { props, text } = node;
  if (text.length === 0) return 0;
  // Two explicit opt-ins that lower the floor:
  // - `maxLines` means the engine will ellipsize the surplus cleanly.
  // - `breakWords` means the caller has asked for char-level wrapping.
  // Either signals that overflowing is worse than mid-word breaking.
  if (props.maxLines || props.breakWords) return 0;
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;
  let max = 0;
  for (const word of words) {
    const w = measureText(props.font, props.size, word);
    if (w > max) max = w;
  }
  return max;
}

/**
 * Clone `node` with its main-axis dimension reduced to `newMainSize`.
 * For text, this sets the wrap width so the text re-flows to a narrower
 * slot. For containers, it sets `style.width` / `style.height`. For
 * structural elements (image, hline, svgPath), the node is returned
 * unchanged — they're filtered out earlier by `nodeMinMain` returning their
 * full base size, so shrink should never assign them a non-zero reduction.
 */
export function applyShrink(node: Node, newMainSize: number, axis: MainAxis): Node {
  const size = Math.max(0, newMainSize);
  if (axis === "horizontal") {
    switch (node.kind) {
      case "text":
        return { ...node, props: { ...node.props, width: size } };
      case "vstack":
      case "hstack":
        return { ...node, style: { ...node.style, width: size } };
      case "spacer":
        return { ...node, size };
      case "hline":
        return { ...node, width: size };
      case "link":
        return { ...node, child: applyShrink(node.child, size, axis) };
      default:
        return node;
    }
  }
  switch (node.kind) {
    case "vstack":
    case "hstack":
      return { ...node, style: { ...node.style, height: size } };
    case "spacer":
      return { ...node, size };
    case "vline":
      return { ...node, height: size };
    case "link":
      return { ...node, child: applyShrink(node.child, size, axis) };
    default:
      return node;
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
    case "link":
      return nodeGrow(node.child);
    default:
      return 0;
  }
}

export function nodeShrink(node: Node): number {
  switch (node.kind) {
    case "vstack":
    case "hstack":
      return node.style.shrink ?? 0;
    case "spacer":
      return node.shrink ?? 0;
    case "text":
      return node.props.shrink ?? 0;
    case "link":
      return nodeShrink(node.child);
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
