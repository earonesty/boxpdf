import { rgb, type PDFPage } from "pdf-lib";
import { edges, type Justify, type Node, type RGB } from "./types.js";
import { fontAscent, measureText } from "./text.js";
import { layoutText, measure, measureContent, nodeGrow, nodeMargin } from "./measure.js";

export interface RenderOptions {
  /** When true, overlay every node's bounding box in red for layout debugging. */
  debug?: boolean;
}

let currentOptions: RenderOptions = {};

function toRgb(color: RGB | undefined): ReturnType<typeof rgb> | undefined {
  return color ? rgb(color.r, color.g, color.b) : undefined;
}

const DEBUG_STROKE: RGB = { r: 1, g: 0.2, b: 0.2 };
const DEBUG_MARGIN_STROKE: RGB = { r: 1, g: 0.65, b: 0 };

/**
 * Render `node` at the given position. `yTop` is in pdf-lib coordinates (higher = further from page bottom).
 * Returns the total vertical height consumed including the node's own margin.
 */
export function render(
  node: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  options: RenderOptions = {}
): number {
  currentOptions = options;
  try {
    return renderWithCurrent(node, page, x, yTop, parentWidth);
  } finally {
    currentOptions = {};
  }
}

function renderWithCurrent(
  node: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number
): number {
  const m = nodeMargin(node);
  if (currentOptions.debug) {
    const outer = measure(node, parentWidth);
    if (m.top || m.right || m.bottom || m.left) {
      strokeDebugRect(page, x, yTop, outer.width, outer.height, DEBUG_MARGIN_STROKE);
    }
  }
  const innerX = x + m.left;
  const innerYTop = yTop - m.top;
  const innerParentWidth = parentWidth - m.left - m.right;
  const consumed = renderContent(node, page, innerX, innerYTop, innerParentWidth);
  if (currentOptions.debug) {
    strokeDebugRect(page, innerX, innerYTop, parentWidth - m.left - m.right, consumed, DEBUG_STROKE);
  }
  return consumed + m.top + m.bottom;
}

function strokeDebugRect(
  page: PDFPage,
  x: number,
  yTop: number,
  width: number,
  height: number,
  color: RGB
): void {
  if (width <= 0 || height <= 0) return;
  page.drawRectangle({
    x,
    y: yTop - height,
    width,
    height,
    borderColor: toRgb(color),
    borderWidth: 0.5,
    borderOpacity: 0.9,
    opacity: 0,
    color: undefined
  });
}

function renderContent(node: Node, page: PDFPage, x: number, yTop: number, parentWidth: number): number {
  switch (node.kind) {
    case "text": {
      const { props } = node;
      const lines = layoutText(node, props.width ?? parentWidth);
      const lineHeight = props.lineHeight ?? fontAscent(props.font, props.size);
      const slotWidth = props.width ?? measureText(props.font, props.size, node.text);
      let cursorY = yTop;
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? "";
        const lineWidth = measureText(props.font, props.size, line);
        let drawX = x;
        if (props.align === "center") drawX = x + (slotWidth - lineWidth) / 2;
        else if (props.align === "right") drawX = x + (slotWidth - lineWidth);
        page.drawText(line, {
          x: drawX,
          y: cursorY - fontAscent(props.font, props.size),
          size: props.size,
          font: props.font,
          color: toRgb(props.color)
        });
        cursorY -= lineHeight;
      }
      return lineHeight * Math.max(1, lines.length);
    }
    case "image":
      page.drawImage(node.image, {
        x,
        y: yTop - node.height,
        width: node.width,
        height: node.height
      });
      return node.height;
    case "spacer":
      return node.size;
    case "hline": {
      const w = node.width ?? parentWidth;
      const y = yTop - node.thickness / 2;
      page.drawLine({
        start: { x, y },
        end: { x: x + w, y },
        thickness: node.thickness,
        color: toRgb(node.color)
      });
      return node.thickness;
    }
    case "vline": {
      const h = node.height ?? 0;
      const lineX = x + node.thickness / 2;
      page.drawLine({
        start: { x: lineX, y: yTop },
        end: { x: lineX, y: yTop - h },
        thickness: node.thickness,
        color: toRgb(node.color)
      });
      return h;
    }
    case "vstack":
      return renderVStack(node, page, x, yTop, parentWidth);
    case "hstack":
      return renderHStack(node, page, x, yTop, parentWidth);
  }
}

function renderVStack(
  node: Extract<Node, { kind: "vstack" }>,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number
): number {
  const inset = edges(node.style.padding);
  const intrinsic = measureContent(node, parentWidth);
  const boxWidth = node.style.width ?? intrinsic.width;
  const boxHeight = node.style.height ?? intrinsic.height;

  drawBackground(page, x, yTop, boxWidth, boxHeight, node.style.background, node.style.borderRadius);
  drawBorder(page, x, yTop, boxWidth, boxHeight, node.style.border, node.style.borderRadius);

  const innerX = x + inset.left;
  const innerWidth = boxWidth - inset.left - inset.right;
  const innerYTop = yTop - inset.top;
  const innerHeight = boxHeight - inset.top - inset.bottom;

  // Resolve grow weights along the vertical (main) axis.
  const childSizes = node.children.map((c) => measure(c, innerWidth));
  const totalGap = node.gap * Math.max(0, node.children.length - 1);
  const totalChildHeight = childSizes.reduce((sum, s) => sum + s.height, 0);
  const totalGrow = node.children.reduce((sum, c) => sum + nodeGrow(c), 0);
  let extra = innerHeight - totalChildHeight - totalGap;
  if (extra < 0) extra = 0;

  const extraPerChild = node.children.map((c) => (totalGrow > 0 ? (nodeGrow(c) / totalGrow) * extra : 0));

  let cursorY = innerYTop;
  if (totalGrow === 0) {
    const offsets = computeMainAxisOffsets(
      node.justify,
      childSizes.map((s) => s.height),
      innerHeight,
      node.gap
    );
    cursorY = innerYTop - offsets.start;
    node.children.forEach((child, i) => {
      const slotHeight = childSizes[i]?.height ?? 0;
      const widthForChild = resolveCrossAxisWidth(child, childSizes[i]?.width ?? 0, innerWidth);
      const childX = resolveCrossAxisX(node.align, innerX, innerWidth, widthForChild);
      renderWithFixedHeight(child, page, childX, cursorY, widthForChild, slotHeight);
      cursorY -= slotHeight;
      if (i < node.children.length - 1) cursorY -= offsets.between;
    });
  } else {
    node.children.forEach((child, i) => {
      if (i > 0) cursorY -= node.gap;
      const baseHeight = childSizes[i]?.height ?? 0;
      const slotHeight = baseHeight + (extraPerChild[i] ?? 0);
      const widthForChild = resolveCrossAxisWidth(child, childSizes[i]?.width ?? 0, innerWidth);
      const childX = resolveCrossAxisX(node.align, innerX, innerWidth, widthForChild);
      renderWithFixedHeight(child, page, childX, cursorY, widthForChild, slotHeight);
      cursorY -= slotHeight;
    });
  }

  return boxHeight;
}

function renderHStack(
  node: Extract<Node, { kind: "hstack" }>,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number
): number {
  const inset = edges(node.style.padding);
  const intrinsic = measureContent(node, parentWidth);
  const boxWidth = node.style.width ?? intrinsic.width;
  const boxHeight = node.style.height ?? intrinsic.height;

  drawBackground(page, x, yTop, boxWidth, boxHeight, node.style.background, node.style.borderRadius);
  drawBorder(page, x, yTop, boxWidth, boxHeight, node.style.border, node.style.borderRadius);

  const innerX = x + inset.left;
  const innerWidth = boxWidth - inset.left - inset.right;
  const innerYTop = yTop - inset.top;
  const innerHeight = boxHeight - inset.top - inset.bottom;

  const childSizes = node.children.map((c) => measure(c, innerWidth));
  const totalGap = node.gap * Math.max(0, node.children.length - 1);
  const totalChildWidth = childSizes.reduce((sum, s) => sum + s.width, 0);
  const totalGrow = node.children.reduce((sum, c) => sum + nodeGrow(c), 0);
  let extra = innerWidth - totalChildWidth - totalGap;
  if (extra < 0) extra = 0;

  let cursorX = innerX;
  if (totalGrow === 0) {
    const offsets = computeMainAxisOffsets(
      node.justify,
      childSizes.map((s) => s.width),
      innerWidth,
      node.gap
    );
    cursorX = innerX + offsets.start;
    node.children.forEach((child, i) => {
      const slotWidth = childSizes[i]?.width ?? 0;
      const heightForChild = resolveCrossAxisHeight(child, childSizes[i]?.height ?? 0, innerHeight);
      const childY = resolveCrossAxisY(node.align, innerYTop, innerHeight, heightForChild);
      renderWithFixedWidth(child, page, cursorX, childY, slotWidth);
      cursorX += slotWidth;
      if (i < node.children.length - 1) cursorX += offsets.between;
    });
  } else {
    const extraPerChild = node.children.map((c) =>
      totalGrow > 0 ? (nodeGrow(c) / totalGrow) * extra : 0
    );
    node.children.forEach((child, i) => {
      if (i > 0) cursorX += node.gap;
      const baseWidth = childSizes[i]?.width ?? 0;
      const slotWidth = baseWidth + (extraPerChild[i] ?? 0);
      const heightForChild = resolveCrossAxisHeight(child, childSizes[i]?.height ?? 0, innerHeight);
      const childY = resolveCrossAxisY(node.align, innerYTop, innerHeight, heightForChild);
      renderWithFixedWidth(child, page, cursorX, childY, slotWidth);
      cursorX += slotWidth;
    });
  }

  return boxHeight;
}

function renderWithFixedHeight(
  child: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  _slotHeight: number
): number {
  // Currently we ignore slotHeight enforcement for non-grown children; flex grow
  // is handled by passing the resolved height into render via the slot above.
  return renderWithCurrent(child, page, x, yTop, parentWidth);
}

function renderWithFixedWidth(
  child: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  _slotWidth: number
): number {
  return renderWithCurrent(child, page, x, yTop, _slotWidth);
}

interface MainAxisOffsets {
  start: number;
  between: number;
}

function computeMainAxisOffsets(
  justify: Justify,
  sizes: number[],
  available: number,
  gap: number
): MainAxisOffsets {
  const total = sizes.reduce((sum, s) => sum + s, 0);
  const count = sizes.length;
  const slack = available - total - gap * Math.max(0, count - 1);
  if (slack <= 0 || count <= 1) {
    if (justify === "center" && count > 0) return { start: slack / 2, between: gap };
    if (justify === "end") return { start: slack, between: gap };
    return { start: 0, between: gap };
  }
  switch (justify) {
    case "center":
      return { start: slack / 2, between: gap };
    case "end":
      return { start: slack, between: gap };
    case "between":
      return { start: 0, between: gap + slack / (count - 1) };
    case "around":
      return { start: slack / count / 2, between: gap + slack / count };
    case "evenly":
      return { start: slack / (count + 1), between: gap + slack / (count + 1) };
    case "start":
    default:
      return { start: 0, between: gap };
  }
}

function resolveCrossAxisWidth(child: Node, intrinsicWidth: number, available: number): number {
  if (child.kind === "vstack" || child.kind === "hstack") {
    if (child.style.width !== undefined) return child.style.width;
  }
  return Math.min(intrinsicWidth, available);
}

function resolveCrossAxisHeight(child: Node, intrinsicHeight: number, available: number): number {
  if (child.kind === "vstack" || child.kind === "hstack") {
    if (child.style.height !== undefined) return child.style.height;
  }
  return Math.min(intrinsicHeight, available);
}

function resolveCrossAxisX(
  align: "start" | "center" | "end" | "stretch",
  innerX: number,
  innerWidth: number,
  childWidth: number
): number {
  switch (align) {
    case "center":
      return innerX + (innerWidth - childWidth) / 2;
    case "end":
      return innerX + (innerWidth - childWidth);
    case "stretch":
    case "start":
    default:
      return innerX;
  }
}

function resolveCrossAxisY(
  align: "start" | "center" | "end" | "stretch",
  innerYTop: number,
  innerHeight: number,
  childHeight: number
): number {
  switch (align) {
    case "center":
      return innerYTop - (innerHeight - childHeight) / 2;
    case "end":
      return innerYTop - (innerHeight - childHeight);
    case "stretch":
    case "start":
    default:
      return innerYTop;
  }
}

function drawBackground(
  page: PDFPage,
  x: number,
  yTop: number,
  width: number,
  height: number,
  color: RGB | undefined,
  radius: number | undefined
): void {
  if (!color) return;
  const yBottom = yTop - height;
  if (!radius || radius <= 0) {
    page.drawRectangle({ x, y: yBottom, width, height, color: toRgb(color) });
    return;
  }
  page.drawSvgPath(roundedRectPath(width, height, radius), {
    x,
    y: yTop,
    color: toRgb(color),
    borderWidth: 0
  });
}

function drawBorder(
  page: PDFPage,
  x: number,
  yTop: number,
  width: number,
  height: number,
  border: { color: RGB; width: number } | undefined,
  radius: number | undefined
): void {
  if (!border) return;
  const yBottom = yTop - height;
  if (!radius || radius <= 0) {
    page.drawRectangle({
      x,
      y: yBottom,
      width,
      height,
      borderColor: toRgb(border.color),
      borderWidth: border.width
    });
    return;
  }
  page.drawSvgPath(roundedRectPath(width, height, radius), {
    x,
    y: yTop,
    borderColor: toRgb(border.color),
    borderWidth: border.width
  });
}

/**
 * Build an SVG path for a rounded rectangle starting from (0, 0) at the
 * top-left, in pdf-lib's drawSvgPath coordinate system (origin = pen
 * position, y grows downward when interpreted by drawSvgPath).
 */
function roundedRectPath(width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  if (r === 0) return `M 0 0 H ${width} V ${height} H 0 Z`;
  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z"
  ].join(" ");
}
