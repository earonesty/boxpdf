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

function lineFromSegments(
  segments: ParagraphLineSegment[],
  forcedLineHeight?: number
): ParagraphLine {
  const resolvedSegments = resolveMiddleInlineSegments(segments);
  const width = resolvedSegments.reduce((sum, segment) => sum + segment.width, 0);
  const naturalHeight =
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.ascent), 0) +
    resolvedSegments.reduce((max, segment) => Math.max(max, segment.descent), 0);
  const height = forcedLineHeight ?? naturalHeight;
  return { segments: resolvedSegments, width, height };
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
  forcedLineHeight?: number
): ParagraphLine[] {
  if (runs.length === 0) return [];

  const tokens = runs.flatMap(splitRun);
  const lines: ParagraphLine[] = [];
  let segments: ParagraphLineSegment[] = [];
  let currentWidth = 0;

  const pushLine = (): void => {
    while (
      segments.length > 0 &&
      segments[segments.length - 1]!.kind === "text" &&
      /^\s+$/.test(segments[segments.length - 1]!.text ?? "")
    ) {
      currentWidth -= segments.pop()!.width;
    }
    lines.push(lineFromSegments(segments, forcedLineHeight));
    segments = [];
    currentWidth = 0;
  };

  for (const token of tokens) {
    if (isInlineRun(token)) {
      const inline = measureInlineRun(token);
      if (currentWidth > 0 && currentWidth + inline.width > width) pushLine();
      segments.push({
        kind: "inline",
        node: token.node,
        href: token.href,
        verticalAlign: token.verticalAlign,
        width: inline.width,
        height: inline.height,
        ascent: token.verticalAlign === "middle" ? inline.height / 2 : inline.height,
        descent: token.verticalAlign === "middle" ? inline.height / 2 : 0
      });
      currentWidth += inline.width;
      continue;
    }

    if (/^\s+$/.test(token.text) && segments.length === 0) continue;

    const tokenWidth = measureText(token.style.font, token.style.size, token.text);
    if (currentWidth > 0 && currentWidth + tokenWidth > width) {
      pushLine();
      if (/^\s+$/.test(token.text)) continue;
    }

    if (tokenWidth > width && !/^\s+$/.test(token.text)) {
      const pieces = hardBreakRun(token, width);
      for (const piece of pieces) {
        const pieceWidth = measureText(piece.style.font, piece.style.size, piece.text);
        if (currentWidth > 0 && currentWidth + pieceWidth > width) pushLine();
        const lineHeight = piece.style.lineHeight ?? fontLineHeight(piece.style.font, piece.style.size);
        const metrics = fontLineMetrics(piece.style.font, piece.style.size, lineHeight);
        segments.push({
          kind: "text",
          text: piece.text,
          style: piece.style,
          href: piece.href,
          width: pieceWidth,
          height: lineHeight,
          ascent: metrics.ascent,
          descent: metrics.descent
        });
        currentWidth += pieceWidth;
      }
      continue;
    }

    const lineHeight = token.style.lineHeight ?? fontLineHeight(token.style.font, token.style.size);
    const metrics = fontLineMetrics(token.style.font, token.style.size, lineHeight);
    segments.push({
      kind: "text",
      text: token.text,
      style: token.style,
      href: token.href,
      width: tokenWidth,
      height: lineHeight,
      ascent: metrics.ascent,
      descent: metrics.descent
    });
    currentWidth += tokenWidth;
  }

  if (segments.length > 0) pushLine();
  return lines.length > 0 ? lines : [lineFromSegments([], forcedLineHeight)];
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

export function measureParagraphHeight(
  runs: ParagraphItem[],
  width: number,
  forcedLineHeight?: number
): number {
  const lines = layoutParagraph(runs, width, forcedLineHeight);
  if (lines.length === 0) {
    return forcedLineHeight ?? runs.reduce((max, run) => Math.max(max, runLineHeight(run)), 0);
  }
  return lines.reduce((sum, line) => sum + line.height, 0);
}
