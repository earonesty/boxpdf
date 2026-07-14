import { PDFDocument, type PDFPage } from "pdf-lib";
import { createMeasureCache, measure, withMeasureProfile, type MeasureProfileEvent } from "./measure.js";
import { render, type RenderOptions } from "./render.js";
import { edges, type EdgesInput, type Node } from "./types.js";

export interface PageSize {
  width: number;
  height: number;
}

export const PageSizes = {
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  A4: { width: 595, height: 842 },
  A5: { width: 420, height: 595 },
  A6: { width: 297, height: 420 }
} as const;

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export interface PageOptions extends RenderOptions, DocumentMetadata {
  /** Page size; defaults to LETTER (612×792) to match pdf-lib. */
  size?: PageSize;
  margin?: EdgesInput;
  /**
   * When `true` (default), emit a `console.warn` if a top-level child's
   * measured width exceeds the page's content area — a common footgun when
   * hardcoded layout widths drift from the chosen page size. Set to `false`
   * to silence (e.g. in tests that deliberately overflow).
   */
  warnings?: boolean;
}

export interface RenderFlowProfileEvent {
  phase:
    | "start"
    | "header-footer-measured"
    | "node-measure-start"
    | "node-measure-end"
    | "node-render-start"
    | "node-render-end"
    | "page-break"
    | "split-start"
    | "split-end"
    | "measure-detail"
    | "finish";
  elapsedMs: number;
  pageCount?: number;
  pendingCount?: number;
  nodeKind?: Node["kind"];
  nodeIndex?: number;
  width?: number;
  height?: number;
  measure?: MeasureProfileEvent;
}

export type RenderFlowProfileCallback = (event: RenderFlowProfileEvent) => void;

/**
 * Inner content width of `size` after subtracting `margin`. Use this
 * instead of hardcoding `size.width - 72` so your layout follows the page
 * even if the page size changes.
 *
 * @example
 *   const WIDTH = pageInner(PageSizes.Letter, 36); // 540
 */
export function pageInner(size: PageSize, margin: EdgesInput = 0): number {
  const m = edges(margin);
  return size.width - m.left - m.right;
}

/**
 * Inner content rectangle of `size` after subtracting `margin`. Same idea
 * as `pageInner` but returns both dimensions for callers that need to know
 * the printable height too (e.g. for keepTogether sizing).
 */
export function pageContent(size: PageSize, margin: EdgesInput = 0): { width: number; height: number } {
  const m = edges(margin);
  return {
    width: size.width - m.left - m.right,
    height: size.height - m.top - m.bottom
  };
}

function describeSize(size: PageSize): string {
  for (const [name, candidate] of Object.entries(PageSizes)) {
    if (candidate.width === size.width && candidate.height === size.height) {
      return name;
    }
  }
  return `${size.width}×${size.height}`;
}

function describeMargin(m: { top: number; right: number; bottom: number; left: number }): string {
  if (m.top === m.right && m.right === m.bottom && m.bottom === m.left) {
    return `${m.top}pt`;
  }
  return `${m.top}/${m.right}/${m.bottom}/${m.left}pt`;
}

function warnIfOverflowing(
  node: Node,
  measuredWidth: number,
  contentWidth: number,
  size: PageSize,
  m: { top: number; right: number; bottom: number; left: number }
): void {
  const epsilon = 0.5;
  if (measuredWidth <= contentWidth + epsilon) return;
  const sizeName = describeSize(size);
  const fitName =
    size === PageSizes.Letter
      ? "A4"
      : size === PageSizes.A4
        ? "Letter"
        : null;
  const fitHint = fitName ? `Pass {size: PageSizes.${fitName}} if that matches your intent, ` : "";
  console.warn(
    `[boxpdf] top-level ${node.kind} measured ${measuredWidth.toFixed(1)}pt — ` +
      `exceeds page content area ${contentWidth.toFixed(1)}pt ` +
      `(${sizeName} with ${describeMargin(m)} margins). ` +
      `${fitHint}reduce the child's width, or add shrink/wrapping so it fits.`
  );
}

function applyMetadata(pdf: PDFDocument, options: DocumentMetadata): void {
  if (options.title !== undefined) pdf.setTitle(options.title);
  if (options.author !== undefined) pdf.setAuthor(options.author);
  if (options.subject !== undefined) pdf.setSubject(options.subject);
  if (options.keywords !== undefined) pdf.setKeywords(options.keywords);
  if (options.creator !== undefined) pdf.setCreator(options.creator);
  if (options.producer !== undefined) pdf.setProducer(options.producer);
}

function isFragmentableStack(node: Node): node is Extract<Node, { kind: "vstack" }> {
  return node.kind === "vstack" && node.style.breakInside !== "avoid" && node.style.height === undefined;
}

function cloneStackWithChildren(node: Extract<Node, { kind: "vstack" }>, children: Node[]): Node {
  return { ...node, children };
}

function splitNormalStack(
  node: Extract<Node, { kind: "vstack" }>,
  availableHeight: number,
  contentWidth: number
): { before: Node; after?: Node } | undefined {
  if (node.children.length <= 1) return undefined;
  let splitAt = 0;
  for (let i = 0; i < node.children.length; i += 1) {
    const candidate = cloneStackWithChildren(node, node.children.slice(0, i + 1));
    if (measure(candidate, contentWidth).height <= availableHeight) {
      splitAt = i + 1;
      continue;
    }
    break;
  }
  if (splitAt <= 0 || splitAt >= node.children.length) return undefined;
  return {
    before: cloneStackWithChildren(node, node.children.slice(0, splitAt)),
    after: cloneStackWithChildren(node, node.children.slice(splitAt))
  };
}

function splitTableStack(
  node: Extract<Node, { kind: "vstack" }>,
  availableHeight: number,
  contentWidth: number
): { before: Node; after?: Node } | undefined {
  const meta = node.fragmentation;
  if (meta?.kind !== "table") return undefined;
  const header = node.children.slice(0, meta.headerCount);
  const footerStart = node.children.length - meta.footerCount;
  const footer = meta.footerCount > 0 ? node.children.slice(footerStart) : [];
  const body = node.children.slice(meta.headerCount, footerStart);
  if (body.length <= 1) return undefined;

  let splitAt = 0;
  for (let i = 0; i < body.length; i += 1) {
    const candidate = cloneStackWithChildren(node, [...header, ...body.slice(0, i + 1)]);
    if (measure(candidate, contentWidth).height <= availableHeight) {
      splitAt = i + 1;
      continue;
    }
    break;
  }

  if (splitAt <= 0 || splitAt >= body.length) return undefined;
  const remainingBody = body.slice(splitAt);
  if (remainingBody[0]?.kind === "hline") remainingBody.shift();
  const before = cloneStackWithChildren(node, [...header, ...body.slice(0, splitAt)]);
  const after = cloneStackWithChildren(node, [...header, ...remainingBody, ...footer]);
  return { before, after };
}

function splitForPage(
  node: Node,
  availableHeight: number,
  contentWidth: number
): { before: Node; after?: Node } | undefined {
  if (!isFragmentableStack(node)) return undefined;
  if (node.fragmentation?.kind === "table") {
    return splitTableStack(node, availableHeight, contentWidth);
  }
  return splitNormalStack(node, availableHeight, contentWidth);
}

export interface PageContext {
  pageNumber: number;
  totalPages: number;
}

export interface FlowOptions extends PageOptions {
  /**
   * Number of points to leave free at the bottom of every page on top of the
   * footer (if any). Children that would extend past the bottom bound are
   * pushed to the next page intact (no mid-child page breaks).
   */
  reserveBottom?: number;
  /**
   * Builder for a page-level header drawn at the top of every page, inside
   * the page's top margin. Receives the current page number and the final
   * total so the header can include "Page X of Y".
   *
   * The header's reserved height is measured once with `pageNumber: 1,
   * totalPages: 1`; if your header changes height per page (e.g. wrapping
   * across multiple lines on some pages) the layout will use the first
   * measurement.
   */
  header?: (ctx: PageContext) => Node;
  /** Same shape as `header`, but for the bottom of every page. */
  footer?: (ctx: PageContext) => Node;
  /** Optional low-level pagination profiler. Events are emitted synchronously as renderFlow progresses. */
  profile?: RenderFlowProfileCallback;
}

/**
 * Render a sequence of top-level nodes onto one or more pages, breaking to a
 * new page when the next node would overflow. Each child is rendered atomically
 * (no mid-child splits). Returns the populated `PDFDocument`.
 *
 * When `header` or `footer` is provided, two passes run: the content pass
 * reserves space at the top and/or bottom of every page, and a second pass
 * draws the header/footer once the final page count is known.
 */
export async function renderFlow(
  pdf: PDFDocument,
  nodes: Node[],
  options: FlowOptions = {}
): Promise<{ pages: PDFPage[] }> {
  const size = options.size ?? PageSizes.Letter;
  const m = edges(options.margin);
  const reserveBottom = options.reserveBottom ?? 0;
  const contentWidth = size.width - m.left - m.right;
  const warnings = options.warnings ?? true;
  const startedAt = now();
  const measureCache = createMeasureCache();
  const profile = (event: Omit<RenderFlowProfileEvent, "elapsedMs">): void => {
    options.profile?.({ ...event, elapsedMs: now() - startedAt });
  };
  const measureProfile = options.profile ? (measureEvent: MeasureProfileEvent) => profile({ phase: "measure-detail", measure: measureEvent }) : undefined;
  const measureWithProfile = (node: Node, parentWidth: number) =>
    withMeasureProfile(
      measureProfile,
      () => measure(node, parentWidth),
      measureCache
    );
  const renderWithMeasureCache = (node: Node, targetPage: PDFPage, x: number, y: number, parentWidth: number) =>
    withMeasureProfile(
      measureProfile,
      () => render(node, targetPage, x, y, parentWidth, { debug: options.debug }),
      measureCache
    );

  applyMetadata(pdf, options);
  profile({ phase: "start", pendingCount: nodes.length, pageCount: 0 });

  const probeCtx: PageContext = { pageNumber: 1, totalPages: 1 };
  const headerHeight = options.header
    ? measureWithProfile(options.header(probeCtx), contentWidth).height
    : 0;
  const footerHeight = options.footer
    ? measureWithProfile(options.footer(probeCtx), contentWidth).height
    : 0;
  profile({ phase: "header-footer-measured", width: contentWidth, height: headerHeight + footerHeight });

  const headerGap = options.header ? 12 : 0;
  const footerGap = options.footer ? 12 : 0;
  const contentTop = size.height - m.top - headerHeight - headerGap;
  const contentBottom = m.bottom + footerHeight + footerGap + reserveBottom;

  const pages: PDFPage[] = [];
  let page = pdf.addPage([size.width, size.height]);
  pages.push(page);
  let cursorY = contentTop;

  const pending = [...nodes];
  let nodeIndex = 0;
  while (pending.length > 0) {
    const node = pending.shift()!;
    const currentIndex = nodeIndex;
    nodeIndex += 1;
    profile({ phase: "node-measure-start", nodeKind: node.kind, nodeIndex: currentIndex, pendingCount: pending.length, pageCount: pages.length });
    const nodeSize = measureWithProfile(node, contentWidth);
    profile({
      phase: "node-measure-end",
      nodeKind: node.kind,
      nodeIndex: currentIndex,
      pendingCount: pending.length,
      pageCount: pages.length,
      width: nodeSize.width,
      height: nodeSize.height
    });
    if (warnings) warnIfOverflowing(node, nodeSize.width, contentWidth, size, m);
    const remainingHeight = cursorY - contentBottom;
    if (nodeSize.height > remainingHeight) {
      profile({ phase: "split-start", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: contentWidth, height: remainingHeight });
      const split = withMeasureProfile(measureProfile, () => splitForPage(node, remainingHeight, contentWidth), measureCache);
      profile({ phase: "split-end", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: contentWidth, height: remainingHeight });
      if (split && cursorY !== contentTop) {
        const beforeSize = measureWithProfile(split.before, contentWidth);
        profile({ phase: "node-render-start", nodeKind: split.before.kind, nodeIndex: currentIndex, pageCount: pages.length, width: beforeSize.width, height: beforeSize.height });
        renderWithMeasureCache(split.before, page, m.left, cursorY, contentWidth);
        profile({ phase: "node-render-end", nodeKind: split.before.kind, nodeIndex: currentIndex, pageCount: pages.length, width: beforeSize.width, height: beforeSize.height });
        cursorY -= beforeSize.height;
        if (split.after) {
          page = pdf.addPage([size.width, size.height]);
          pages.push(page);
          profile({ phase: "page-break", pageCount: pages.length, pendingCount: pending.length + 1 });
          cursorY = contentTop;
          pending.unshift(split.after);
        }
        continue;
      }
    }
    if (cursorY - nodeSize.height < contentBottom && cursorY !== contentTop) {
      page = pdf.addPage([size.width, size.height]);
      pages.push(page);
      profile({ phase: "page-break", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, pendingCount: pending.length + 1 });
      cursorY = contentTop;
      pending.unshift(node);
      continue;
    }
    const topRemainingHeight = cursorY - contentBottom;
    if (nodeSize.height > topRemainingHeight) {
      profile({ phase: "split-start", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: contentWidth, height: topRemainingHeight });
      const split = withMeasureProfile(measureProfile, () => splitForPage(node, topRemainingHeight, contentWidth), measureCache);
      profile({ phase: "split-end", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: contentWidth, height: topRemainingHeight });
      if (split) {
        const beforeSize = measureWithProfile(split.before, contentWidth);
        profile({ phase: "node-render-start", nodeKind: split.before.kind, nodeIndex: currentIndex, pageCount: pages.length, width: beforeSize.width, height: beforeSize.height });
        renderWithMeasureCache(split.before, page, m.left, cursorY, contentWidth);
        profile({ phase: "node-render-end", nodeKind: split.before.kind, nodeIndex: currentIndex, pageCount: pages.length, width: beforeSize.width, height: beforeSize.height });
        cursorY -= beforeSize.height;
        if (split.after) {
          page = pdf.addPage([size.width, size.height]);
          pages.push(page);
          profile({ phase: "page-break", pageCount: pages.length, pendingCount: pending.length + 1 });
          cursorY = contentTop;
          pending.unshift(split.after);
        }
        continue;
      }
    }
    profile({ phase: "node-render-start", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: nodeSize.width, height: nodeSize.height });
    renderWithMeasureCache(node, page, m.left, cursorY, contentWidth);
    profile({ phase: "node-render-end", nodeKind: node.kind, nodeIndex: currentIndex, pageCount: pages.length, width: nodeSize.width, height: nodeSize.height });
    cursorY -= nodeSize.height;
  }

  // Second pass: now that we know the page count, draw header/footer on every page.
  if (options.header || options.footer) {
    const totalPages = pages.length;
    pages.forEach((p, i) => {
      const ctx: PageContext = { pageNumber: i + 1, totalPages };
      if (options.header) {
        renderWithMeasureCache(
          options.header(ctx),
          p,
          m.left,
          size.height - m.top,
          contentWidth
        );
      }
      if (options.footer) {
        renderWithMeasureCache(
          options.footer(ctx),
          p,
          m.left,
          m.bottom + footerHeight,
          contentWidth
        );
      }
    });
  }

  profile({ phase: "finish", pageCount: pages.length });
  return { pages };
}

function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

/**
 * One-call convenience around the full `renderFlow` lifecycle: create a
 * `PDFDocument`, let you build the nodes against it (so fonts and images embed
 * into the same document), paginate them, and return the saved bytes.
 *
 * The `build` callback receives the fresh document — embed fonts there and
 * return the top-level nodes. This is the shortest path from "nothing" to a
 * `Uint8Array`, with no pdf-lib import required:
 *
 * @example
 *   import { cleanTheme, flowToPdf, standardFonts, text, vstack } from "boxpdf";
 *
 *   const bytes = await flowToPdf(async (pdf) => {
 *     const theme = cleanTheme(await standardFonts(pdf));
 *     return [
 *       vstack({ gap: 8 },
 *         text("Receipt #18472", theme.type.h1),
 *         text("May 14, 2026", theme.type.caption)
 *       )
 *     ];
 *   });
 *
 * For full control over the document (multiple render passes, custom save
 * options, returning the `PDFDocument` itself) call `renderFlow` directly.
 */
export async function flowToPdf(
  build: (pdf: PDFDocument) => Node[] | Promise<Node[]>,
  options: FlowOptions = {}
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create({ updateMetadata: options.producer === undefined });
  const nodes = await build(pdf);
  await renderFlow(pdf, nodes, options);
  return pdf.save();
}

/**
 * Convenience: create a new PDFDocument, render a single node onto one page,
 * and return the saved bytes. Use `renderFlow` when you need pagination.
 */
export async function renderToPdf(
  node: Node,
  options: PageOptions = {}
): Promise<Uint8Array> {
  const size = options.size ?? PageSizes.Letter;
  const m = edges(options.margin);
  const contentWidth = size.width - m.left - m.right;
  const warnings = options.warnings ?? true;
  const pdf = await PDFDocument.create({ updateMetadata: options.producer === undefined });
  applyMetadata(pdf, options);
  const page = pdf.addPage([size.width, size.height]);
  if (warnings) {
    const nodeSize = measure(node, contentWidth);
    warnIfOverflowing(node, nodeSize.width, contentWidth, size, m);
  }
  render(node, page, m.left, size.height - m.top, contentWidth, { debug: options.debug });
  return pdf.save();
}

export { PDFDocument };
