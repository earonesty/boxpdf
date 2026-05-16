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

export interface ParagraphProps {
  width?: number;
  align?: Align;
  lineHeight?: number;
  margin?: import("./types.js").EdgesInput;
  paddingLeft?: number;
  textIndent?: number;
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

function isInlineRun(run: ParagraphItem): run is InlineNodeRun {
  return "node" in run;
}

function runLineHeight(run: ParagraphItem): number {
  if (isInlineRun(run)) return measureInlineRun(run).height;
  return run.style.lineHeight ?? fontLineHeight(run.style.font, run.style.size);
}

function splitRun(run: ParagraphItem): ParagraphItem[] {
  if (isInlineRun(run)) return [run];
  const parts = run.text.match(/\S+|\s+/g) ?? [run.text];
  return parts.map((text) => ({ ...run, text }));
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
  xOffset: number
): ParagraphLine {
  const resolvedSegments = resolveMiddleInlineSegments(normalizeTextSegments(segments));
  const width = resolvedSegments.reduce((sum, segment) => sum + segment.width, 0);
  const naturalHeight =
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.ascent), 0) +
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.descent), 0);
  const height = forcedLineHeight ?? naturalHeight;
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
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent"> = {}
): ParagraphLine[] {
  if (runs.length === 0) return [];

  const paddingLeft = options.paddingLeft ?? 0;
  const textIndent = options.textIndent ?? 0;
  const lineOffset = (lineIndex: number): number => paddingLeft + (lineIndex === 0 ? textIndent : 0);
  const lineWidth = (lineIndex: number): number => Math.max(0, width - Math.max(0, lineOffset(lineIndex)));
  const tokens = runs.flatMap(splitRun);
  const lines: ParagraphLine[] = [];
  let segments: ParagraphLineSegment[] = [];

  const pushLine = (): void => {
    const currentLineIndex = lines.length;
    while (
      segments.length > 0 &&
      segments[segments.length - 1]!.kind === "text" &&
      /^\s+$/.test(segments[segments.length - 1]!.text ?? "")
    ) {
      segments.pop();
    }
    lines.push(lineFromSegments(segments, forcedLineHeight, lineOffset(currentLineIndex)));
    segments = [];
  };

  for (const token of tokens) {
    const availableWidth = lineWidth(lines.length);
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
      if (segments.length > 0 && measureSegments([...segments, segment]) > availableWidth) pushLine();
      segments.push(segment);
      continue;
    }

    if (/^\s+$/.test(token.text) && segments.length === 0) continue;

    const tokenSegment = segmentFromTextRun(token);
    if (segments.length > 0 && measureSegments([...segments, tokenSegment]) > availableWidth) {
      pushLine();
      if (/^\s+$/.test(token.text)) continue;
    }

    const currentAvailableWidth = lineWidth(lines.length);
    if (measureSegments([tokenSegment]) > currentAvailableWidth && !/^\s+$/.test(token.text)) {
      const pieces = hardBreakRun(token, currentAvailableWidth);
      for (const piece of pieces) {
        const pieceSegment = segmentFromTextRun(piece);
        if (segments.length > 0 && measureSegments([...segments, pieceSegment]) > lineWidth(lines.length)) pushLine();
        segments.push(pieceSegment);
      }
      continue;
    }

    segments.push(tokenSegment);
  }

  if (segments.length > 0) pushLine();
  return lines.length > 0 ? lines : [lineFromSegments([], forcedLineHeight, lineOffset(0))];
}

function measureInlineRun(run: InlineNodeRun): { width: number; height: number } {
  const measured = measure(run.node, run.width ?? Number.POSITIVE_INFINITY);
  return {
    width: run.width ?? measured.width,
    height: run.height ?? measured.height
  };
}

export function measureParagraphIntrinsicWidth(runs: ParagraphItem[]): number {
  return runs.reduce((sum, run) => {
    if (isInlineRun(run)) return sum + measureInlineRun(run).width;
    return sum + measureText(run.style.font, run.style.size, run.text);
  }, 0);
}

export function measureParagraphIntrinsicWidthWithIndent(
  runs: ParagraphItem[],
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent"> = {}
): number {
  const base = measureParagraphIntrinsicWidth(runs);
  return base + Math.max(options.paddingLeft ?? 0, (options.paddingLeft ?? 0) + (options.textIndent ?? 0));
}

export function measureParagraphHeight(
  runs: ParagraphItem[],
  width: number,
  forcedLineHeight?: number,
  options: Pick<ParagraphProps, "paddingLeft" | "textIndent"> = {}
): number {
  const lines = layoutParagraph(runs, width, forcedLineHeight, options);
  if (lines.length === 0) {
    return forcedLineHeight ?? runs.reduce((max, run) => Math.max(max, runLineHeight(run)), 0);
  }
  return lines.reduce((sum, line) => sum + line.height, 0);
}
