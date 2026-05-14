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
  size?: PageSize;
  margin?: EdgesInput;
}

function applyMetadata(pdf: PDFDocument, options: DocumentMetadata): void {
  if (options.title !== undefined) pdf.setTitle(options.title);
  if (options.author !== undefined) pdf.setAuthor(options.author);
  if (options.subject !== undefined) pdf.setSubject(options.subject);
  if (options.keywords !== undefined) pdf.setKeywords(options.keywords);
  if (options.creator !== undefined) pdf.setCreator(options.creator);
  if (options.producer !== undefined) pdf.setProducer(options.producer);
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
  const size = options.size ?? PageSizes.A4;
  const m = edges(options.margin);
  const reserveBottom = options.reserveBottom ?? 0;
  const contentWidth = size.width - m.left - m.right;

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

  for (const node of nodes) {
    const nodeSize = measure(node, contentWidth);
    if (cursorY - nodeSize.height < contentBottom && cursorY !== contentTop) {
      page = pdf.addPage([size.width, size.height]);
      pages.push(page);
      cursorY = contentTop;
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
  const size = options.size ?? PageSizes.A4;
  const m = edges(options.margin);
  const contentWidth = size.width - m.left - m.right;
  const pdf = await PDFDocument.create({ updateMetadata: options.producer === undefined });
  applyMetadata(pdf, options);
  const page = pdf.addPage([size.width, size.height]);
  render(node, page, m.left, size.height - m.top, contentWidth, { debug: options.debug });
  return pdf.save();
}

export { PDFDocument };
