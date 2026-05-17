import type { PDFFont } from "pdf-lib";
import type { Align, Node, RGB } from "./types.js";
import { fontLineHeight, fontLineMetrics, fontXHeight, measureText } from "./text.js";
import { measure } from "./measure.js";

export interface TextRunStyle {
  size: number;
  font: PDFFont;
  color?: RGB;
  lineHeight?: number;
  underline?: boolean;
  strikethrough?: boolean;
}

export interface ParagraphRun {
  text: string;
  style: TextRunStyle;
  href?: string;
}

export type InlineVerticalAlign = "baseline" | "middle";

export interface InlineNodeRun {
  node: Node;
  width?: number;
  height?: number;
  verticalAlign?: InlineVerticalAlign;
  href?: string;
}

export type ParagraphItem = ParagraphRun | InlineNodeRun;

export interface ParagraphFloat {
  node: Node;
  side: "left" | "right";
  width?: number;
  height?: number;
  margin?: import("./types.js").EdgesInput;
}

export interface ParagraphProps {
  width?: number;
  align?: Align;
  lineHeight?: number;
  margin?: import("./types.js").EdgesInput;
  paddingLeft?: number;
  textIndent?: number;
  wrap?: boolean;
  floats?: ParagraphFloat[];
}

export interface ParagraphLineSegment {
  kind: "text" | "inline";
  text?: string;
  style?: TextRunStyle;
  node?: Node;
  href?: string;
  verticalAlign?: InlineVerticalAlign;
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface ParagraphLine {
  segments: ParagraphLineSegment[];
  width: number;
  height: number;
  xOffset: number;
}

export interface ParagraphFloatLayout {
  float: ParagraphFloat;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ParagraphLayout {
  lines: ParagraphLine[];
  floats: ParagraphFloatLayout[];
  width: number;
  height: number;
}

function isInlineRun(run: ParagraphItem): run is InlineNodeRun {
  return "node" in run;
}

type ParagraphToken = ParagraphItem | { kind: "hardBreak" };

function isHardBreak(token: ParagraphToken): token is { kind: "hardBreak" } {
  return "kind" in token && token.kind === "hardBreak";
}

function runLineHeight(run: ParagraphItem): number {
  if (isInlineRun(run)) return measureInlineRun(run).height;
  return run.style.lineHeight ?? fontLineHeight(run.style.font, run.style.size);
}

function splitRun(run: ParagraphItem): ParagraphToken[] {
  if (isInlineRun(run)) return [run];
  const tokens: ParagraphToken[] = [];
  const parts = run.text.split(/\r?\n/);
  parts.forEach((part, index) => {
    if (index > 0) tokens.push({ kind: "hardBreak" });
    const textTokens = part.match(/\S+|[^\S\r\n]+/g) ?? (part.length > 0 ? [part] : []);
    tokens.push(...textTokens.map((text) => ({ ...run, text })));
  });
  return tokens;
}

function hardBreakRun(run: ParagraphRun, maxWidth: number): ParagraphRun[] {
  if (maxWidth <= 0) return [run];
  const out: ParagraphRun[] = [];
  let current = "";
  for (const char of run.text) {
    const next = current + char;
    if (current.length > 0 && measureText(run.style.font, run.style.size, next) > maxWidth) {
      out.push({ ...run, text: current });
      current = char;
    } else {
      current = next;
    }
  }
  if (current.length > 0) out.push({ ...run, text: current });
  return out;
}

function textStyleKey(style: TextRunStyle): string {
  const color = style.color ? `${style.color.r},${style.color.g},${style.color.b}` : "";
  return [
    style.size,
    style.lineHeight ?? "",
    style.underline ? "u" : "",
    style.strikethrough ? "s" : "",
    color
  ].join("|");
}

function sameTextPaint(a: ParagraphLineSegment, b: ParagraphLineSegment): boolean {
  if (a.kind !== "text" || b.kind !== "text" || !a.style || !b.style) return false;
  return a.style.font === b.style.font && textStyleKey(a.style) === textStyleKey(b.style) && a.href === b.href;
}

function segmentFromTextRun(run: ParagraphRun): ParagraphLineSegment {
  const lineHeight = run.style.lineHeight ?? fontLineHeight(run.style.font, run.style.size);
  const metrics = fontLineMetrics(run.style.font, run.style.size, lineHeight);
  return {
    kind: "text",
    text: run.text,
    style: run.style,
    href: run.href,
    width: measureText(run.style.font, run.style.size, run.text),
    height: lineHeight,
    ascent: metrics.ascent,
    descent: metrics.descent
  };
}

function normalizeTextSegments(segments: ParagraphLineSegment[]): ParagraphLineSegment[] {
  const out: ParagraphLineSegment[] = [];
  for (const segment of segments) {
    const previous = out[out.length - 1];
    if (previous && sameTextPaint(previous, segment)) {
      const text = `${previous.text ?? ""}${segment.text ?? ""}`;
      const style = previous.style!;
      const lineHeight = style.lineHeight ?? fontLineHeight(style.font, style.size);
      const metrics = fontLineMetrics(style.font, style.size, lineHeight);
      out[out.length - 1] = {
        ...previous,
        text,
        width: measureText(style.font, style.size, text),
        height: lineHeight,
        ascent: metrics.ascent,
        descent: metrics.descent
      };
      continue;
    }
    out.push(segment);
  }
  return out;
}

function measureSegments(segments: ParagraphLineSegment[]): number {
  return normalizeTextSegments(segments).reduce((sum, segment) => sum + segment.width, 0);
}

function lineFromSegments(
  segments: ParagraphLineSegment[],
  forcedLineHeight: number | undefined,
  xOffset: number,
  fallbackLineHeight: number
): ParagraphLine {
  const resolvedSegments = resolveMiddleInlineSegments(normalizeTextSegments(segments));
  const width = resolvedSegments.reduce((sum, segment) => sum + segment.width, 0);
  const naturalHeight =
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.ascent), 0) +
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.descent), 0);
  const height = forcedLineHeight ?? (naturalHeight || fallbackLineHeight);
  return { segments: resolvedSegments, width, height, xOffset };
}

function resolveMiddleInlineSegments(segments: ParagraphLineSegment[]): ParagraphLineSegment[] {
  const referenceXHeight = segments.reduce((max, segment) => {
    if (segment.kind !== "text" || !segment.style) return max;
    return Math.max(max, fontXHeight(segment.style.font, segment.style.size));
  }, 0);
  if (referenceXHeight === 0) return segments;
  return segments.map((segment) => {
    if (segment.kind !== "inline" || segment.verticalAlign !== "middle") return segment;
    const ascent = segment.height / 2 + referenceXHeight / 2;
    return { ...segment, ascent, descent: segment.height - ascent };
  });
}

export function layoutParagraph(
  runs: ParagraphItem[],
  width: number,
  forcedLineHeight?: number,
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent" | "wrap" | "floats"> = {}
): ParagraphLine[] {
  return layoutParagraphWithFloats(runs, width, forcedLineHeight, options).lines;
}

export function layoutParagraphWithFloats(
  runs: ParagraphItem[],
  width: number,
  forcedLineHeight?: number,
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent" | "wrap" | "floats"> = {}
): ParagraphLayout {
  const wrap = options.wrap ?? true;
  const fallbackLineHeight = runs.reduce((max, run) => Math.max(max, runLineHeight(run)), 0);
  const paddingLeft = options.paddingLeft ?? 0;
  const textIndent = options.textIndent ?? 0;
  const floats = layoutFloats(options.floats ?? [], width);
  if (runs.length === 0) {
    const floatHeight = floats.reduce((max, float) => Math.max(max, float.y + float.height), 0);
    return { lines: [], floats, width, height: floatHeight };
  }
  const lineOffset = (lineIndex: number, y: number, lineHeight: number): number => {
    const floatInset = floatInsets(floats, y, lineHeight);
    return paddingLeft + (lineIndex === 0 ? textIndent : 0) + floatInset.left;
  };
  const lineWidth = (lineIndex: number, y: number, lineHeight: number): number => {
    const floatInset = floatInsets(floats, y, lineHeight);
    const offset = paddingLeft + (lineIndex === 0 ? textIndent : 0) + floatInset.left;
    return Math.max(0, width - Math.max(0, offset) - floatInset.right);
  };
  const tokens = runs.flatMap(splitRun);
  const lines: ParagraphLine[] = [];
  let segments: ParagraphLineSegment[] = [];
  let cursorY = 0;

  const pushLine = (): void => {
    const currentLineIndex = lines.length;
    while (
      segments.length > 0 &&
      segments[segments.length - 1]!.kind === "text" &&
      /^\s+$/.test(segments[segments.length - 1]!.text ?? "")
    ) {
      segments.pop();
    }
    const probe = lineFromSegments(segments, forcedLineHeight, 0, fallbackLineHeight);
    const xOffset = lineOffset(currentLineIndex, cursorY, probe.height);
    const line = lineFromSegments(segments, forcedLineHeight, xOffset, fallbackLineHeight);
    lines.push(line);
    cursorY += line.height;
    segments = [];
  };

  for (const token of tokens) {
    if (isHardBreak(token)) {
      pushLine();
      continue;
    }
    const availableWidth = lineWidth(lines.length, cursorY, fallbackLineHeight);
    if (isInlineRun(token)) {
      const inline = measureInlineRun(token);
      const segment: ParagraphLineSegment = {
        kind: "inline",
        node: token.node,
        href: token.href,
        verticalAlign: token.verticalAlign,
        width: inline.width,
        height: inline.height,
        ascent: token.verticalAlign === "middle" ? inline.height / 2 : inline.height,
        descent: token.verticalAlign === "middle" ? inline.height / 2 : 0
      };
      if (wrap && segments.length > 0 && measureSegments([...segments, segment]) > availableWidth) pushLine();
      segments.push(segment);
      continue;
    }

    if (/^\s+$/.test(token.text) && segments.length === 0) continue;

    const tokenSegment = segmentFromTextRun(token);
    if (wrap && segments.length > 0 && measureSegments([...segments, tokenSegment]) > availableWidth) {
      pushLine();
      if (/^\s+$/.test(token.text)) continue;
    }

    const currentAvailableWidth = lineWidth(lines.length, cursorY, fallbackLineHeight);
    if (wrap && measureSegments([tokenSegment]) > currentAvailableWidth && !/^\s+$/.test(token.text)) {
      const pieces = hardBreakRun(token, currentAvailableWidth);
      for (const piece of pieces) {
        const pieceSegment = segmentFromTextRun(piece);
        if (segments.length > 0 && measureSegments([...segments, pieceSegment]) > lineWidth(lines.length, cursorY, fallbackLineHeight)) {
          pushLine();
        }
        segments.push(pieceSegment);
      }
      continue;
    }

    segments.push(tokenSegment);
  }

  if (segments.length > 0) pushLine();
  const resolvedLines = lines.length > 0 ? lines : [lineFromSegments([], forcedLineHeight, lineOffset(0, 0, fallbackLineHeight), fallbackLineHeight)];
  const textHeight = resolvedLines.reduce((sum, line) => sum + line.height, 0);
  const floatHeight = floats.reduce((max, float) => Math.max(max, float.y + float.height), 0);
  return { lines: resolvedLines, floats, width, height: Math.max(textHeight, floatHeight) };
}

function layoutFloats(floats: ParagraphFloat[], paragraphWidth: number): ParagraphFloatLayout[] {
  let leftY = 0;
  let rightY = 0;
  return floats.map((float) => {
    const margin = edgeValues(float.margin);
    const measured = measure(float.node, paragraphWidth);
    const width = float.width ?? measured.width;
    const height = float.height ?? measured.height;
    const outerWidth = width + margin.left + margin.right;
    const outerHeight = height + margin.top + margin.bottom;
    if (float.side === "right") {
      const y = rightY;
      rightY += outerHeight;
      return { float, width: outerWidth, height: outerHeight, x: paragraphWidth - outerWidth, y };
    }
    const y = leftY;
    leftY += outerHeight;
    return { float, width: outerWidth, height: outerHeight, x: 0, y };
  });
}

function floatInsets(floats: ParagraphFloatLayout[], y: number, lineHeight: number): { left: number; right: number } {
  let left = 0;
  let right = 0;
  for (const float of floats) {
    if (y + lineHeight <= float.y || y >= float.y + float.height) continue;
    if (float.float.side === "right") right += float.width;
    else left += float.width;
  }
  return { left, right };
}

function edgeValues(input: import("./types.js").EdgesInput | undefined): { top: number; right: number; bottom: number; left: number } {
  if (input === undefined) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof input === "number") return { top: input, right: input, bottom: input, left: input };
  return { top: input.top ?? 0, right: input.right ?? 0, bottom: input.bottom ?? 0, left: input.left ?? 0 };
}

function measureInlineRun(run: InlineNodeRun): { width: number; height: number } {
  const measured = measure(run.node, run.width ?? Number.POSITIVE_INFINITY);
  return {
    width: run.width ?? measured.width,
    height: run.height ?? measured.height
  };
}

export function measureParagraphIntrinsicWidth(runs: ParagraphItem[]): number {
  return Math.max(
    0,
    ...layoutParagraph(runs, Number.POSITIVE_INFINITY, undefined, { wrap: false }).map((line) => line.width)
  );
}

export function measureParagraphIntrinsicWidthWithIndent(
  runs: ParagraphItem[],
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent"> = {}
): number {
  return Math.max(
    0,
    ...layoutParagraph(runs, Number.POSITIVE_INFINITY, undefined, { ...options, wrap: false }).map((line) => line.xOffset + line.width)
  );
}

export function measureParagraphHeight(
  runs: ParagraphItem[],
  width: number,
  forcedLineHeight?: number,
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent" | "wrap" | "floats"> = {}
): number {
  const layout = layoutParagraphWithFloats(runs, width, forcedLineHeight, options);
  if (layout.lines.length === 0) {
    return layout.height > 0 ? layout.height : forcedLineHeight ?? runs.reduce((max, run) => Math.max(max, runLineHeight(run)), 0);
  }
  return layout.height;
}
