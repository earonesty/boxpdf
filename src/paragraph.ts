import type { PDFFont } from "pdf-lib";
import type { Align, RGB } from "./types.js";
import { fontLineHeight, measureText } from "./text.js";

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

export interface ParagraphProps {
  width?: number;
  align?: Align;
  lineHeight?: number;
  margin?: import("./types.js").EdgesInput;
}

export interface ParagraphLineSegment {
  text: string;
  style: TextRunStyle;
  href?: string;
  width: number;
}

export interface ParagraphLine {
  segments: ParagraphLineSegment[];
  width: number;
  height: number;
}

function runLineHeight(run: ParagraphRun): number {
  return run.style.lineHeight ?? fontLineHeight(run.style.font, run.style.size);
}

function splitRun(run: ParagraphRun): ParagraphRun[] {
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
  const width = segments.reduce((sum, segment) => sum + segment.width, 0);
  const height = forcedLineHeight ?? segments.reduce((max, segment) => {
    const h = segment.style.lineHeight ?? fontLineHeight(segment.style.font, segment.style.size);
    return Math.max(max, h);
  }, 0);
  return { segments, width, height };
}

export function layoutParagraph(
  runs: ParagraphRun[],
  width: number,
  forcedLineHeight?: number
): ParagraphLine[] {
  if (runs.length === 0) return [];

  const tokens = runs.flatMap(splitRun);
  const lines: ParagraphLine[] = [];
  let segments: ParagraphLineSegment[] = [];
  let currentWidth = 0;

  const pushLine = (): void => {
    while (segments.length > 0 && /^\s+$/.test(segments[segments.length - 1]!.text)) {
      currentWidth -= segments.pop()!.width;
    }
    lines.push(lineFromSegments(segments, forcedLineHeight));
    segments = [];
    currentWidth = 0;
  };

  for (const token of tokens) {
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
        segments.push({ ...piece, width: pieceWidth });
        currentWidth += pieceWidth;
      }
      continue;
    }

    segments.push({ ...token, width: tokenWidth });
    currentWidth += tokenWidth;
  }

  if (segments.length > 0) pushLine();
  return lines.length > 0 ? lines : [lineFromSegments([], forcedLineHeight)];
}

export function measureParagraphIntrinsicWidth(runs: ParagraphRun[]): number {
  return runs.reduce((sum, run) => sum + measureText(run.style.font, run.style.size, run.text), 0);
}

export function measureParagraphHeight(
  runs: ParagraphRun[],
  width: number,
  forcedLineHeight?: number
): number {
  const lines = layoutParagraph(runs, width, forcedLineHeight);
  if (lines.length === 0) {
    return forcedLineHeight ?? runs.reduce((max, run) => Math.max(max, runLineHeight(run)), 0);
  }
  return lines.reduce((sum, line) => sum + line.height, 0);
}
