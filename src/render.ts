import {
  PDFArray,
  PDFName,
  PDFString,
  clip,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  rgb,
  type PDFPage
} from "pdf-lib";
import { edges, type BorderSides, type Justify, type Node, type RGB } from "./types.js";
import { fontLineHeight, fontLineMetrics, measureText } from "./text.js";
import { layoutParagraph, measureParagraphIntrinsicWidth } from "./paragraph.js";
import {
  layoutText,
  measure,
  measureContent,
  nodeGrow,
  nodeMargin,
  nodeBaselineOffset,
  resolveMainAxis,
  stretchCrossAxisChildren
} from "./measure.js";

export interface RenderOptions {
  /** When true, overlay every node's bounding box in red for layout debugging. */
  debug?: boolean;
}

let currentOptions: RenderOptions = {};

interface ContainingBlock {
  x: number;
  yTop: number;
  width: number;
  height: number;
}

function isAbsoluteBox(node: Node): node is Extract<Node, { kind: "vstack" | "hstack" }> {
  return (node.kind === "vstack" || node.kind === "hstack") && node.style.position === "absolute";
}

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
  parentWidth: number,
  containingBlock?: ContainingBlock
): number {
  containingBlock ??= {
    x,
    yTop,
    width: parentWidth,
    height: measure(node, parentWidth).height
  };
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
  const consumed = renderContent(node, page, innerX, innerYTop, innerParentWidth, containingBlock);
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
  // Draw the stroke OUTSIDE the content box: stroke's inner edge IS the
  // content edge, so glyphs that reach the box right edge never visually
  // overlap the stroke. PDF strokes are centered on the path by default;
  // we offset by half a stroke width to get inner-edge alignment.
  const stroke = 0.5;
  if (width <= 0 || height <= 0) return;
  page.drawRectangle({
    x: x - stroke / 2,
    y: yTop - height - stroke / 2,
    width: width + stroke,
    height: height + stroke,
    borderColor: toRgb(color),
    borderWidth: stroke,
    borderOpacity: 0.9,
    opacity: 0,
    color: undefined
  });
}

function renderContent(
  node: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  containingBlock: ContainingBlock
): number {
  switch (node.kind) {
    case "text": {
      const { props } = node;
      const lines = layoutText(node, props.width ?? parentWidth);
      const lineHeight = props.lineHeight ?? fontLineHeight(props.font, props.size);
      const slotWidth = props.width ?? measureText(props.font, props.size, node.text);
      const decorationThickness = Math.max(0.5, props.size * 0.06);
      const decorationColor = toRgb(props.color);
      let cursorY = yTop;
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? "";
        const lineWidth = measureText(props.font, props.size, line);
        let drawX = x;
        if (props.align === "center") drawX = x + (slotWidth - lineWidth) / 2;
        else if (props.align === "right") drawX = x + (slotWidth - lineWidth);
        const baseline = cursorY - fontLineMetrics(props.font, props.size, lineHeight).ascent;
        page.drawText(line, {
          x: drawX,
          y: baseline,
          size: props.size,
          font: props.font,
          color: toRgb(props.color)
        });
        if (props.underline && line.length > 0) {
          const underlineY = baseline - Math.max(1, props.size * 0.12);
          page.drawLine({
            start: { x: drawX, y: underlineY },
            end: { x: drawX + lineWidth, y: underlineY },
            thickness: decorationThickness,
            color: decorationColor
          });
        }
        if (props.strikethrough && line.length > 0) {
          const midY = baseline + props.size * 0.28;
          page.drawLine({
            start: { x: drawX, y: midY },
            end: { x: drawX + lineWidth, y: midY },
            thickness: decorationThickness,
            color: decorationColor
          });
        }
        cursorY -= lineHeight;
      }
      return lineHeight * Math.max(1, lines.length);
    }
    case "paragraph": {
      const slotWidth = node.props.width ?? Math.min(measureParagraphIntrinsicWidth(node.runs), parentWidth);
      const lines = layoutParagraph(node.runs, slotWidth, node.props.lineHeight);
      let cursorY = yTop;
      for (const line of lines) {
        let drawX = x;
        if (node.props.align === "center") drawX = x + (slotWidth - line.width) / 2;
        else if (node.props.align === "right") drawX = x + (slotWidth - line.width);
        const lineAscent = line.segments.reduce((max, segment) => Math.max(max, segment.ascent), 0);
        const baseline = cursorY - lineAscent;
        for (const segment of line.segments) {
          if (segment.kind === "text" && segment.text !== undefined && segment.style !== undefined) {
            page.drawText(segment.text, {
              x: drawX,
              y: baseline,
              size: segment.style.size,
              font: segment.style.font,
              color: toRgb(segment.style.color)
            });
            const decorationThickness = Math.max(0.5, segment.style.size * 0.06);
            const decorationColor = toRgb(segment.style.color);
            if (segment.style.underline && segment.text.length > 0) {
              const underlineY = baseline - Math.max(1, segment.style.size * 0.12);
              page.drawLine({
                start: { x: drawX, y: underlineY },
                end: { x: drawX + segment.width, y: underlineY },
                thickness: decorationThickness,
                color: decorationColor
              });
            }
            if (segment.style.strikethrough && segment.text.length > 0) {
              const midY = baseline + segment.style.size * 0.28;
              page.drawLine({
                start: { x: drawX, y: midY },
                end: { x: drawX + segment.width, y: midY },
                thickness: decorationThickness,
                color: decorationColor
              });
            }
          } else if (segment.kind === "inline" && segment.node !== undefined) {
            renderWithCurrent(
              segment.node,
              page,
              drawX,
              baseline + segment.ascent,
              segment.width,
              containingBlock
            );
          }
          if (segment.href) {
            attachLinkAnnotation(page, drawX, baseline - segment.descent, segment.width, segment.height, segment.href);
          }
          drawX += segment.width;
        }
        cursorY -= line.height;
      }
      return lines.reduce((sum, line) => sum + line.height, 0);
    }
    case "image":
      page.drawImage(node.image, {
        x,
        y: yTop - node.height,
        width: node.width,
        height: node.height
      });
      return node.height;
    case "imageBox": {
      page.pushOperators(
        pushGraphicsState(),
        rectangle(x, yTop - node.height, node.width, node.height),
        clip(),
        endPath()
      );
      page.drawImage(node.image, {
        x: x + node.offsetX,
        y: yTop - node.offsetY - node.imageHeight,
        width: node.imageWidth,
        height: node.imageHeight
      });
      page.pushOperators(popGraphicsState());
      return node.height;
    }
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
    case "link": {
      const childSize = measure(node.child, parentWidth);
      const consumed = renderWithCurrent(node.child, page, x, yTop, parentWidth, containingBlock);
      attachLinkAnnotation(page, x, yTop - childSize.height, childSize.width, childSize.height, node.href);
      return consumed;
    }
    case "svgPath": {
      // drawSvgPath uses (x, y) as the path's origin point. SVG `y` grows
      // downward inside the path data, so we anchor at yTop and let the
      // path draw "down" into the bounding box.
      page.drawSvgPath(node.d, {
        x,
        y: yTop,
        scale: node.scale,
        color: toRgb(node.color),
        borderColor: toRgb(node.borderColor),
        borderWidth: node.borderWidth
      });
      return node.height;
    }
    case "vstack":
      return renderVStack(node, page, x, yTop, parentWidth, containingBlock);
    case "hstack":
      return renderHStack(node, page, x, yTop, parentWidth, containingBlock);
  }
}

function attachLinkAnnotation(
  page: PDFPage,
  x: number,
  yBottom: number,
  width: number,
  height: number,
  href: string
): void {
  const pdf = page.doc;
  const annotation = pdf.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, yBottom, x + width, yBottom + height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(href)
    }
  });
  const annotsKey = PDFName.of("Annots");
  const existing = page.node.lookupMaybe(annotsKey, PDFArray);
  if (existing) {
    existing.push(annotation);
  } else {
    page.node.set(annotsKey, pdf.context.obj([annotation]));
  }
}

function renderVStack(
  node: Extract<Node, { kind: "vstack" }>,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  containingBlock: ContainingBlock
): number {
  const inset = edges(node.style.padding);
  const intrinsic = measureContent(node, parentWidth);
  const boxWidth = node.style.width ?? intrinsic.width;
  const boxHeight = node.style.height ?? intrinsic.height;
  const flowChildren = stretchCrossAxisChildren(
    node.children.filter((child) => !isAbsoluteBox(child)),
    "vertical",
    boxWidth - inset.left - inset.right,
    node.align
  );
  const absoluteChildren = node.children.filter(isAbsoluteBox);
  const childContainingBlock =
    node.style.position !== undefined
      ? { x, yTop, width: boxWidth, height: boxHeight }
      : containingBlock;

  drawBackground(page, x, yTop, boxWidth, boxHeight, node.style.background, node.style.borderRadius);
  drawBorder(page, x, yTop, boxWidth, boxHeight, node.style.border, node.style.borderRadius);
  drawBorderSides(page, x, yTop, boxWidth, boxHeight, node.style.borderSides);

  const innerX = x + inset.left;
  const innerWidth = boxWidth - inset.left - inset.right;
  const innerYTop = yTop - inset.top;
  const innerHeight = boxHeight - inset.top - inset.bottom;

  // Resolve shrink first so children that overflow the main axis get
  // re-sized before grow/justify positioning runs. When the vstack has no
  // fixed height, no overflow is possible so shrink is a no-op.
  const availableMain = node.style.height === undefined ? Infinity : innerHeight;
  const layout = resolveMainAxis(flowChildren, "vertical", availableMain, innerWidth, node.gap);
  const children = layout.children;
  const childSizes = layout.sizes;

  const totalGap = node.gap * Math.max(0, children.length - 1);
  const totalChildHeight = childSizes.reduce((sum, s) => sum + s.height, 0);
  const totalGrow = children.reduce((sum, c) => sum + nodeGrow(c), 0);
  let extra = innerHeight - totalChildHeight - totalGap;
  if (extra < 0) extra = 0;

  const extraPerChild = children.map((c) => (totalGrow > 0 ? (nodeGrow(c) / totalGrow) * extra : 0));

  let cursorY = innerYTop;
  if (totalGrow === 0) {
    const offsets = computeMainAxisOffsets(
      node.justify,
      childSizes.map((s) => s.height),
      innerHeight,
      node.gap
    );
    cursorY = innerYTop - offsets.start;
    children.forEach((child, i) => {
      const slotHeight = childSizes[i]?.height ?? 0;
      const widthForChild = resolveCrossAxisWidth(child, childSizes[i]?.width ?? 0, innerWidth);
      const childX = resolveCrossAxisX(node.align, innerX, innerWidth, widthForChild);
      renderWithFixedHeight(child, page, childX, cursorY, widthForChild, slotHeight, childContainingBlock);
      cursorY -= slotHeight;
      if (i < children.length - 1) cursorY -= offsets.between;
    });
  } else {
    children.forEach((child, i) => {
      if (i > 0) cursorY -= node.gap;
      const baseHeight = childSizes[i]?.height ?? 0;
      const slotHeight = baseHeight + (extraPerChild[i] ?? 0);
      const widthForChild = resolveCrossAxisWidth(child, childSizes[i]?.width ?? 0, innerWidth);
      const childX = resolveCrossAxisX(node.align, innerX, innerWidth, widthForChild);
      renderWithFixedHeight(child, page, childX, cursorY, widthForChild, slotHeight, childContainingBlock);
      cursorY -= slotHeight;
    });
  }

  renderAbsoluteChildren(absoluteChildren, page, childContainingBlock);

  return boxHeight;
}

function renderHStack(
  node: Extract<Node, { kind: "hstack" }>,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  containingBlock: ContainingBlock
): number {
  const inset = edges(node.style.padding);
  const intrinsic = measureContent(node, parentWidth);
  const boxWidth = node.style.width ?? intrinsic.width;
  const boxHeight = node.style.height ?? intrinsic.height;
  const flowChildren = stretchCrossAxisChildren(
    node.children.filter((child) => !isAbsoluteBox(child)),
    "horizontal",
    boxHeight - inset.top - inset.bottom,
    node.align
  );
  const absoluteChildren = node.children.filter(isAbsoluteBox);
  const childContainingBlock =
    node.style.position !== undefined
      ? { x, yTop, width: boxWidth, height: boxHeight }
      : containingBlock;

  drawBackground(page, x, yTop, boxWidth, boxHeight, node.style.background, node.style.borderRadius);
  drawBorder(page, x, yTop, boxWidth, boxHeight, node.style.border, node.style.borderRadius);
  drawBorderSides(page, x, yTop, boxWidth, boxHeight, node.style.borderSides);

  const innerX = x + inset.left;
  const innerWidth = boxWidth - inset.left - inset.right;
  const innerYTop = yTop - inset.top;
  const innerHeight = boxHeight - inset.top - inset.bottom;

  // Resolve shrink before allocating slots — keeps grow/shrink independent
  // (shrink fires when intrinsic > inner, grow fires when intrinsic < inner).
  const layout = resolveMainAxis(flowChildren, "horizontal", innerWidth, innerWidth, node.gap);
  const children = layout.children;
  const childSizes = layout.sizes;

  const totalGap = node.gap * Math.max(0, children.length - 1);
  const totalChildWidth = childSizes.reduce((sum, s) => sum + s.width, 0);
  const totalGrow = children.reduce((sum, c) => sum + nodeGrow(c), 0);
  let extra = innerWidth - totalChildWidth - totalGap;
  if (extra < 0) extra = 0;
  const baselineOffset =
    node.align === "baseline"
      ? children.reduce((max, child) => Math.max(max, nodeBaselineOffset(child, innerWidth)), 0)
      : 0;

  let cursorX = innerX;
  if (totalGrow === 0) {
    const offsets = computeMainAxisOffsets(
      node.justify,
      childSizes.map((s) => s.width),
      innerWidth,
      node.gap
    );
    cursorX = innerX + offsets.start;
    children.forEach((child, i) => {
      const slotWidth = childSizes[i]?.width ?? 0;
      const heightForChild = resolveCrossAxisHeight(child, childSizes[i]?.height ?? 0, innerHeight);
      const childY = resolveCrossAxisY(
        node.align,
        innerYTop,
        innerHeight,
        heightForChild,
        child,
        innerWidth,
        baselineOffset
      );
      renderWithFixedWidth(child, page, cursorX, childY, slotWidth, childContainingBlock);
      cursorX += slotWidth;
      if (i < children.length - 1) cursorX += offsets.between;
    });
  } else {
    const extraPerChild = children.map((c) =>
      totalGrow > 0 ? (nodeGrow(c) / totalGrow) * extra : 0
    );
    children.forEach((child, i) => {
      if (i > 0) cursorX += node.gap;
      const baseWidth = childSizes[i]?.width ?? 0;
      const slotWidth = baseWidth + (extraPerChild[i] ?? 0);
      const heightForChild = resolveCrossAxisHeight(child, childSizes[i]?.height ?? 0, innerHeight);
      const childY = resolveCrossAxisY(
        node.align,
        innerYTop,
        innerHeight,
        heightForChild,
        child,
        innerWidth,
        baselineOffset
      );
      renderWithFixedWidth(child, page, cursorX, childY, slotWidth, childContainingBlock);
      cursorX += slotWidth;
    });
  }

  renderAbsoluteChildren(absoluteChildren, page, childContainingBlock);

  return boxHeight;
}

function renderWithFixedHeight(
  child: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  parentWidth: number,
  _slotHeight: number,
  containingBlock: ContainingBlock
): number {
  // Currently we ignore slotHeight enforcement for non-grown children; flex grow
  // is handled by passing the resolved height into render via the slot above.
  return renderWithCurrent(child, page, x, yTop, parentWidth, containingBlock);
}

function renderWithFixedWidth(
  child: Node,
  page: PDFPage,
  x: number,
  yTop: number,
  _slotWidth: number,
  containingBlock: ContainingBlock
): number {
  return renderWithCurrent(child, page, x, yTop, _slotWidth, containingBlock);
}

function renderAbsoluteBox(
  child: Extract<Node, { kind: "vstack" | "hstack" }>,
  page: PDFPage,
  containingBlock: ContainingBlock
): void {
  const positioned = resolveAbsoluteSize(child, containingBlock);
  const size = measure(positioned, positioned.style.width ?? containingBlock.width);
  const x =
    positioned.style.left !== undefined
      ? containingBlock.x + positioned.style.left
      : positioned.style.right !== undefined
        ? containingBlock.x + containingBlock.width - positioned.style.right - size.width
        : containingBlock.x;
  const yTop =
    positioned.style.top !== undefined
      ? containingBlock.yTop - positioned.style.top
      : positioned.style.bottom !== undefined
        ? containingBlock.yTop - containingBlock.height + positioned.style.bottom + size.height
        : containingBlock.yTop;
  renderWithCurrent(positioned, page, x, yTop, positioned.style.width ?? size.width, containingBlock);
}

function renderAbsoluteChildren(
  children: Array<Extract<Node, { kind: "vstack" | "hstack" }>>,
  page: PDFPage,
  containingBlock: ContainingBlock
): void {
  children
    .map((child, index) => ({ child, index }))
    .sort((a, b) => (a.child.style.zIndex ?? 0) - (b.child.style.zIndex ?? 0) || a.index - b.index)
    .forEach(({ child }) => renderAbsoluteBox(child, page, containingBlock));
}

function resolveAbsoluteSize(
  node: Extract<Node, { kind: "vstack" | "hstack" }>,
  containingBlock: ContainingBlock
): Extract<Node, { kind: "vstack" | "hstack" }> {
  const style = node.style;
  const width =
    style.width === undefined && style.left !== undefined && style.right !== undefined
      ? Math.max(0, containingBlock.width - style.left - style.right)
      : style.width;
  const height =
    style.height === undefined && style.top !== undefined && style.bottom !== undefined
      ? Math.max(0, containingBlock.height - style.top - style.bottom)
      : style.height;
  if (width === style.width && height === style.height) return node;
  return { ...node, style: { ...style, width, height } };
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
  align: "start" | "center" | "end" | "stretch" | "baseline",
  innerX: number,
  innerWidth: number,
  childWidth: number
): number {
  switch (align) {
    case "center":
      return innerX + (innerWidth - childWidth) / 2;
    case "end":
      return innerX + (innerWidth - childWidth);
    case "baseline":
    case "stretch":
    case "start":
    default:
      return innerX;
  }
}

function resolveCrossAxisY(
  align: "start" | "center" | "end" | "stretch" | "baseline",
  innerYTop: number,
  innerHeight: number,
  childHeight: number,
  child?: Node,
  parentWidth?: number,
  baselineOffset = 0
): number {
  switch (align) {
    case "center":
      return innerYTop - (innerHeight - childHeight) / 2;
    case "end":
      return innerYTop - (innerHeight - childHeight);
    case "baseline":
      return innerYTop - Math.max(0, baselineOffset - (child ? nodeBaselineOffset(child, parentWidth ?? childHeight) : 0));
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

function drawBorderSides(
  page: PDFPage,
  x: number,
  yTop: number,
  width: number,
  height: number,
  borderSides: BorderSides | undefined
): void {
  if (!borderSides) return;
  const yBottom = yTop - height;
  if (borderSides.top) {
    const y = yTop - borderSides.top.width / 2;
    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness: borderSides.top.width,
      color: toRgb(borderSides.top.color)
    });
  }
  if (borderSides.right) {
    const lineX = x + width - borderSides.right.width / 2;
    page.drawLine({
      start: { x: lineX, y: yTop },
      end: { x: lineX, y: yBottom },
      thickness: borderSides.right.width,
      color: toRgb(borderSides.right.color)
    });
  }
  if (borderSides.bottom) {
    const y = yBottom + borderSides.bottom.width / 2;
    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness: borderSides.bottom.width,
      color: toRgb(borderSides.bottom.color)
    });
  }
  if (borderSides.left) {
    const lineX = x + borderSides.left.width / 2;
    page.drawLine({
      start: { x: lineX, y: yTop },
      end: { x: lineX, y: yBottom },
      thickness: borderSides.left.width,
      color: toRgb(borderSides.left.color)
    });
  }
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
