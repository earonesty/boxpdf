import { PDFDocument, type PDFPage } from "pdf-lib";
import { measure } from "./measure.js";
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
    if (measure(candidate, contentWidth).height <= availableHeight || i === 0) {
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
    if (measure(candidate, contentWidth).height <= availableHeight || i === 0) {
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

  applyMetadata(pdf, options);

  const probeCtx: PageContext = { pageNumber: 1, totalPages: 1 };
  const headerHeight = options.header
    ? measure(options.header(probeCtx), contentWidth).height
    : 0;
  const footerHeight = options.footer
    ? measure(options.footer(probeCtx), contentWidth).height
    : 0;

  const headerGap = options.header ? 12 : 0;
  const footerGap = options.footer ? 12 : 0;
  const contentTop = size.height - m.top - headerHeight - headerGap;
  const contentBottom = m.bottom + footerHeight + footerGap + reserveBottom;

  const pages: PDFPage[] = [];
  let page = pdf.addPage([size.width, size.height]);
  pages.push(page);
  let cursorY = contentTop;

  const pending = [...nodes];
  while (pending.length > 0) {
    const node = pending.shift()!;
    const nodeSize = measure(node, contentWidth);
    if (warnings) warnIfOverflowing(node, nodeSize.width, contentWidth, size, m);
    const remainingHeight = cursorY - contentBottom;
    if (nodeSize.height > remainingHeight) {
      const split = splitForPage(node, remainingHeight, contentWidth);
      if (split && cursorY !== contentTop) {
        const beforeSize = measure(split.before, contentWidth);
        render(split.before, page, m.left, cursorY, contentWidth, { debug: options.debug });
        cursorY -= beforeSize.height;
        if (split.after) {
          page = pdf.addPage([size.width, size.height]);
          pages.push(page);
          cursorY = contentTop;
          pending.unshift(split.after);
        }
        continue;
      }
    }
    if (cursorY - nodeSize.height < contentBottom && cursorY !== contentTop) {
      page = pdf.addPage([size.width, size.height]);
      pages.push(page);
      cursorY = contentTop;
      pending.unshift(node);
      continue;
    }
    const topRemainingHeight = cursorY - contentBottom;
    if (nodeSize.height > topRemainingHeight) {
      const split = splitForPage(node, topRemainingHeight, contentWidth);
      if (split) {
        const beforeSize = measure(split.before, contentWidth);
        render(split.before, page, m.left, cursorY, contentWidth, { debug: options.debug });
        cursorY -= beforeSize.height;
        if (split.after) {
          page = pdf.addPage([size.width, size.height]);
          pages.push(page);
          cursorY = contentTop;
          pending.unshift(split.after);
        }
        continue;
      }
    }
    render(node, page, m.left, cursorY, contentWidth, { debug: options.debug });
    cursorY -= nodeSize.height;
  }

  // Second pass: now that we know the page count, draw header/footer on every page.
  if (options.header || options.footer) {
    const totalPages = pages.length;
    pages.forEach((p, i) => {
      const ctx: PageContext = { pageNumber: i + 1, totalPages };
      if (options.header) {
        render(
          options.header(ctx),
          p,
          m.left,
          size.height - m.top,
          contentWidth,
          { debug: options.debug }
        );
      }
      if (options.footer) {
        render(
          options.footer(ctx),
          p,
          m.left,
          m.bottom + footerHeight,
          contentWidth,
          { debug: options.debug }
        );
      }
    });
  }

  return { pages };
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
