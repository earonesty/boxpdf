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

export interface PageOptions extends RenderOptions {
  size?: PageSize;
  margin?: EdgesInput;
}

export interface FlowOptions extends PageOptions {
  /**
   * Number of points to leave free at the bottom of every page. Children that
   * would extend past `pageSize.height - margin.bottom - reserveBottom` are
   * pushed to the next page intact (no mid-child page breaks).
   */
  reserveBottom?: number;
}

/**
 * Render a sequence of top-level nodes onto one or more pages, breaking to a
 * new page when the next node would overflow. Each child is rendered atomically
 * (no mid-child splits). Returns the populated `PDFDocument`.
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
  const contentTop = size.height - m.top;
  const contentBottom = m.bottom + reserveBottom;

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
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([size.width, size.height]);
  render(node, page, m.left, size.height - m.top, contentWidth, { debug: options.debug });
  return pdf.save();
}

export { PDFDocument };
