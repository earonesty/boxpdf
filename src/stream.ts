/**
 * streamFlow — incremental page-by-page PDF generation with bounded
 * memory. See docs/design/streaming.md for the rationale.
 *
 * Reuses everything from renderFlow except the byte-serialization step.
 * Pages are rendered, their delta refs are serialized to a writable, and
 * page-local refs are freed before the next page renders. Compressible
 * dicts are batched into pdf-lib's PDFObjectStream; the xref is a
 * PDFCrossRefStream — keeps streamed output within ~5-15% of renderFlow's
 * default size.
 */
import {
  type PDFDocument,
  type PDFObject,
  PDFDict,
  PDFArray,
  PDFRef,
  PDFName,
  PDFNumber,
  PDFStream,
  PDFContentStream,
  PDFInvalidObject,
  PDFObjectStream,
  PDFCrossRefStream
} from "pdf-lib";
import { measure } from "./measure.js";
import { render } from "./render.js";
import { edges, type EdgesInput, type Node } from "./types.js";
import {
  PageSizes,
  type PageSize,
  type DocumentMetadata
} from "./document.js";

export interface StreamPageContext {
  /** Current page number, 1-indexed. */
  pageNumber: number;
}

export interface StreamFlowOptions extends DocumentMetadata {
  /** Page size; defaults to LETTER. */
  size?: PageSize;
  margin?: EdgesInput;
  reserveBottom?: number;
  /**
   * Per-page header builder. Receives `{ pageNumber }` only — accessing
   * `ctx.totalPages` THROWS. Switch to `renderFlow` if you need it.
   */
  header?: (ctx: StreamPageContext) => Node;
  /** Same as `header` but for the bottom of every page. */
  footer?: (ctx: StreamPageContext) => Node;
  debug?: boolean;
  /**
   * Number of compressible objects packed per ObjStm. Default 50,
   * matching pdf-lib's `PDFStreamWriter`. Smaller = lower memory peak
   * (smaller buffer) but slightly less compression. Larger = vice versa.
   */
  objectsPerStream?: number;
  warnings?: boolean;
}

/**
 * Render `nodes` as a multi-page PDF, emitting bytes to `writable` as
 * each page closes. Memory stays bounded at `O(shared resources + one
 * page in flight)` regardless of total page count.
 *
 * Contract:
 *   1. Embed any fonts / images BEFORE calling streamFlow. Mid-stream
 *      embedding throws.
 *   2. The iterable is consumed lazily — yield one node at a time from
 *      a generator. Materializing the whole array defeats the point.
 *   3. `writable` is closed by streamFlow on success and aborted on
 *      failure. Don't write to it concurrently.
 *   4. Header/footer callbacks receive `{ pageNumber }` only. Reading
 *      `ctx.totalPages` throws.
 *
 * @returns The total number of pages written.
 */
export async function streamFlow(
  pdf: PDFDocument,
  writable: WritableStream<Uint8Array>,
  nodes: AsyncIterable<Node> | Iterable<Node>,
  options: StreamFlowOptions = {}
): Promise<{ pageCount: number }> {
  const size = options.size ?? PageSizes.Letter;
  const m = edges(options.margin);
  const reserveBottom = options.reserveBottom ?? 0;
  const contentWidth = size.width - m.left - m.right;
  const objectsPerStream = options.objectsPerStream ?? 50;
  const warnings = options.warnings ?? true;

  applyMetadata(pdf, options);

  // Force pdf-lib to embed fonts/images NOW so they appear in the
  // initial-refs snapshot below. Without this, Standard fonts and any
  // pre-embedFont'd resources stay lazy until save(), and our snapshot
  // misses them — they'd appear mid-stream in page deltas and end up
  // confusing the embed-vs-page-local classification.
  await pdf.flush();
  const ctx = pdf.context;

  // Pre-measure header/footer. Constant across pages — same approximation
  // as renderFlow.
  const probeCtx = throwingCtx(1);
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

  // Identify the two refs that mutate during streaming and must be
  // written LAST, not now. Everything else in the foundation snapshot is
  // stable (fonts, images already embedded).
  const catalogRef = ctx.trailerInfo.Root as PDFRef;
  const pagesDictRef = pdf.catalog.get(PDFName.of("Pages")) as PDFRef;
  const deferredKeys = new Set<string>([refKey(catalogRef), refKey(pagesDictRef)]);

  // Foundation snapshot — anything currently in the context that isn't
  // /Pages or /Catalog is a stable resource to be written now.
  const initialEntries = ctx.enumerateIndirectObjects() as [PDFRef, PDFObject][];
  const initialKeys = new Set(initialEntries.map(([r]) => refKey(r)));
  const handledKeys = new Set<string>(); // refs we've already written OR queued in the buffer

  // Track pdf-lib's lazy-embed pool sizes (.fonts and .images) so we can
  // detect mid-stream embeds even when they haven't been flushed into
  // indirectObjects yet. pdf-lib exposes these as private fields; we
  // cross-cast to read them. If the cast ever fails (future pdf-lib
  // refactor), detection silently no-ops — the contract is still
  // documented; this is just an extra safety net.
  const pdfInternals = pdf as unknown as {
    fonts?: { length: number }[];
    images?: { length: number }[];
  };
  const initialFontCount = Array.isArray(pdfInternals.fonts) ? pdfInternals.fonts.length : 0;
  const initialImageCount = Array.isArray(pdfInternals.images) ? pdfInternals.images.length : 0;

  function checkMidStreamEmbed(): void {
    const fc = Array.isArray(pdfInternals.fonts) ? pdfInternals.fonts.length : initialFontCount;
    const ic = Array.isArray(pdfInternals.images) ? pdfInternals.images.length : initialImageCount;
    if (fc > initialFontCount) {
      throw new Error(
        `[boxpdf streamFlow] a font was embedded after streamFlow began. ` +
          `Embed all fonts and images BEFORE calling streamFlow.`
      );
    }
    if (ic > initialImageCount) {
      throw new Error(
        `[boxpdf streamFlow] an image was embedded after streamFlow began. ` +
          `Embed all fonts and images BEFORE calling streamFlow.`
      );
    }
  }

  // Collect xref entries in our own data structure so we can sort by
  // object number before building the PDFCrossRefStream (pdf-lib requires
  // ascending order). We write objects to the stream as we go, then
  // build + emit the xref at the very end.
  type Entry =
    | { kind: "uncompressed"; objNum: number; offset: number }
    | { kind: "compressed"; objNum: number; objStmObjNum: number; index: number };
  const xrefEntries: Entry[] = [];

  const writer = writable.getWriter();
  let offset = 0;

  // Buffer of compressible (non-PDFStream) dicts waiting to be packed
  // into the next PDFObjectStream.
  const compressibleBuffer: [PDFRef, PDFObject][] = [];

  async function writeBytes(bytes: Uint8Array): Promise<void> {
    await writer.ready;
    await writer.write(bytes);
    offset += bytes.length;
  }

  async function writeObject(ref: PDFRef, obj: PDFObject, recordXref: boolean, freeAfter: boolean): Promise<void> {
    const bytes = frameObject(ref, obj);
    if (recordXref) {
      xrefEntries.push({ kind: "uncompressed", objNum: ref.objectNumber, offset });
    }
    await writeBytes(bytes);
    handledKeys.add(refKey(ref));
    if (freeAfter) ctx.delete(ref);
  }

  async function flushCompressibleBuffer(): Promise<void> {
    if (compressibleBuffer.length === 0) return;
    const chunk = compressibleBuffer.slice();
    compressibleBuffer.length = 0;
    const objStmRef = ctx.nextRef() as PDFRef;
    const objStm = PDFObjectStream.withContextAndObjects(ctx, chunk, true);
    for (let i = 0; i < chunk.length; i++) {
      const [r] = chunk[i]!;
      xrefEntries.push({
        kind: "compressed",
        objNum: r.objectNumber,
        objStmObjNum: objStmRef.objectNumber,
        index: i
      });
      // Already in handledKeys from the buffer step; keep ctx entry alive
      // for pdf-lib's bookkeeping (page tree traversals etc).
    }
    await writeObject(objStmRef, objStm, true, /*freeAfter=*/ true);
  }

  async function bufferOrFlushCompressible(ref: PDFRef, obj: PDFObject): Promise<void> {
    if (objectsPerStream <= 1) {
      await writeObject(ref, obj, /*recordXref=*/ true, /*freeAfter=*/ false);
      return;
    }
    compressibleBuffer.push([ref, obj]);
    handledKeys.add(refKey(ref));
    if (compressibleBuffer.length >= objectsPerStream) {
      await flushCompressibleBuffer();
    }
  }

  async function serializeRef(ref: PDFRef, obj: PDFObject): Promise<void> {
    const key = refKey(ref);
    if (handledKeys.has(key)) return;
    if (deferredKeys.has(key)) return; // /Pages and /Catalog written at end
    if (
      obj instanceof PDFStream ||
      obj instanceof PDFInvalidObject ||
      ref.generationNumber !== 0
    ) {
      // Free PDFStream objects (content streams, image XObjects, font byte
      // streams) — these are the memory-heavy ones. Keep dicts so
      // pdf-lib's page tree bookkeeping survives.
      const freeAfter = obj instanceof PDFStream;
      await writeObject(ref, obj, true, freeAfter);
    } else {
      await bufferOrFlushCompressible(ref, obj);
    }
  }

  try {
    // 1. Header
    await writeBytes(headerBytes());

    // 2. Foundation refs (stable embedded resources)
    for (const [ref, obj] of initialEntries) {
      await serializeRef(ref, obj);
    }

    // 3. Page loop (lazy — page is created on first node).
    let pageCount = 0;
    let currentPage: ReturnType<PDFDocument["addPage"]> | undefined;
    let cursorY = contentTop;

    const startPage = (): void => {
      currentPage = pdf.addPage([size.width, size.height]);
      if (options.header) {
        render(
          options.header(throwingCtx(pageCount + 1)),
          currentPage,
          m.left,
          size.height - m.top,
          contentWidth,
          { debug: options.debug }
        );
      }
      cursorY = contentTop;
    };

    const closePage = async (): Promise<void> => {
      if (!currentPage) return;
      if (options.footer) {
        render(
          options.footer(throwingCtx(pageCount + 1)),
          currentPage,
          m.left,
          m.bottom + footerHeight,
          contentWidth,
          { debug: options.debug }
        );
      }
      pageCount += 1;

      // Drain delta refs: page dict (compressible) + content streams
      // (standalone) + any annotations. If a NEW ref appears that isn't
      // page-local (a font, image XObject, etc.), it means the caller
      // embedded a resource after streamFlow started — throw with a
      // pointer to the contract.
      const after = ctx.enumerateIndirectObjects() as [PDFRef, PDFObject][];
      for (const [ref, obj] of after) {
        const key = refKey(ref);
        if (handledKeys.has(key)) continue;
        if (deferredKeys.has(key)) continue;
        if (!initialKeys.has(key) && !isPageLocalRef(obj)) {
          throw new Error(
            `[boxpdf streamFlow] new resource (${describeRef(obj)}, ref ${ref.objectNumber}) ` +
              `was registered after streamFlow started. Embed all fonts and ` +
              `images BEFORE calling streamFlow.`
          );
        }
        await serializeRef(ref, obj);
      }
      currentPage = undefined;
    };

    for await (const node of nodes) {
      checkMidStreamEmbed();

      const nodeSize = measure(node, contentWidth);
      if (warnings && nodeSize.width > contentWidth + 0.5) {
        console.warn(
          `[boxpdf] top-level ${node.kind} measured ${nodeSize.width.toFixed(1)}pt — ` +
            `exceeds page content area ${contentWidth.toFixed(1)}pt`
        );
      }

      if (!currentPage) startPage();
      else if (cursorY - nodeSize.height < contentBottom) {
        await closePage();
        startPage();
      }

      render(node, currentPage!, m.left, cursorY, contentWidth, {
        debug: options.debug
      });
      cursorY -= nodeSize.height;
    }

    if (currentPage) await closePage();

    // 4. Catch up on any newly-registered refs (e.g. annotations added
    //    after the last drawText). serializeRef de-dupes via handledKeys.
    const finalSweep = ctx.enumerateIndirectObjects() as [PDFRef, PDFObject][];
    for (const [ref, obj] of finalSweep) {
      await serializeRef(ref, obj);
    }

    // 5. Flush remaining compressible buffer as the final ObjStm.
    await flushCompressibleBuffer();

    // 6. Write deferred refs (/Pages with all kids, /Catalog).
    const pagesDict = ctx.lookup(pagesDictRef);
    const catalogDict = ctx.lookup(catalogRef);
    if (pagesDict) await writeObject(pagesDictRef, pagesDict, true, false);
    if (catalogDict) await writeObject(catalogRef, catalogDict, true, false);

    // 7. Build + write the cross-reference stream itself.
    const xrefStreamRef = ctx.nextRef() as PDFRef;
    const xrefOffset = offset;
    xrefEntries.push({
      kind: "uncompressed",
      objNum: xrefStreamRef.objectNumber,
      offset: xrefOffset
    });

    // Sort by objNum ascending (required by PDFCrossRefStream).
    xrefEntries.sort((a, b) => a.objNum - b.objNum);

    const trailerDict = ctx.obj({
      Root: ctx.trailerInfo.Root,
      Info: ctx.trailerInfo.Info,
      ID: ctx.trailerInfo.ID
    });
    const xrefStream = PDFCrossRefStream.create(trailerDict, true);
    for (const e of xrefEntries) {
      if (e.kind === "uncompressed") {
        xrefStream.addUncompressedEntry(PDFRef.of(e.objNum), e.offset);
      } else {
        xrefStream.addCompressedEntry(
          PDFRef.of(e.objNum),
          PDFRef.of(e.objStmObjNum),
          e.index
        );
      }
    }
    xrefStream.dict.set(
      PDFName.of("Size"),
      PDFNumber.of(ctx.largestObjectNumber + 1)
    );
    await writeBytes(frameObject(xrefStreamRef, xrefStream));

    // 8. Trailer (just startxref + %%EOF — the dict lives inside the
    //    xref stream's own dict).
    await writeBytes(encodeAscii(`startxref\n${xrefOffset}\n%%EOF\n`));

    await writer.close();
    return { pageCount };
  } catch (err) {
    try {
      await writer.abort(err as Error);
    } catch {
      /* writer may already be in errored state */
    }
    throw err;
  } finally {
    try {
      writer.releaseLock();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Adapt a Node `stream.Writable` (e.g. `fs.createWriteStream`,
 * `http.ServerResponse`) to a Web `WritableStream<Uint8Array>`.
 * Respects Node-side backpressure via the `drain` event.
 */
export function nodeAdapter(
  writable: NodeJS.WritableStream
): WritableStream<Uint8Array> {
  return new WritableStream<Uint8Array>({
    write(chunk: Uint8Array): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const flushed = writable.write(chunk, (err) => {
          if (err) reject(err);
        });
        if (flushed) resolve();
        else writable.once("drain", () => resolve());
      });
    },
    close(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        writable.end(() => resolve());
        writable.on("error", reject);
      });
    },
    abort(reason: unknown): Promise<void> {
      return new Promise<void>((resolve) => {
        const w = writable as NodeJS.WritableStream & {
          destroy?: (err?: Error) => void;
        };
        if (w.destroy) w.destroy(reason instanceof Error ? reason : new Error(String(reason)));
        resolve();
      });
    }
  });
}

// ---------- helpers ----------

function applyMetadata(pdf: PDFDocument, options: DocumentMetadata): void {
  if (options.title !== undefined) pdf.setTitle(options.title);
  if (options.author !== undefined) pdf.setAuthor(options.author);
  if (options.subject !== undefined) pdf.setSubject(options.subject);
  if (options.keywords !== undefined) pdf.setKeywords(options.keywords);
  if (options.creator !== undefined) pdf.setCreator(options.creator);
  if (options.producer !== undefined) pdf.setProducer(options.producer);
}

function throwingCtx(pageNumber: number): StreamPageContext {
  return new Proxy({ pageNumber } as StreamPageContext, {
    get(target, prop, receiver) {
      if (prop === "totalPages") {
        throw new Error(
          "streamFlow doesn't know totalPages — the total page count " +
            "isn't knowable while streaming. Switch to renderFlow if you " +
            "need 'Page X of Y' in headers/footers."
        );
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

function refKey(ref: PDFRef): string {
  return `${ref.objectNumber}-${ref.generationNumber}`;
}

function encodeAscii(s: string): Uint8Array {
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
  return buf;
}

function headerBytes(): Uint8Array {
  // %PDF-1.7\n%<4 high bytes to mark this as binary>\n
  const head = encodeAscii("%PDF-1.7\n");
  const marker = new Uint8Array([0x25, 0xff, 0xff, 0xff, 0xff, 0x0a]);
  const out = new Uint8Array(head.length + marker.length);
  out.set(head, 0);
  out.set(marker, head.length);
  return out;
}

/**
 * Classify a ref appearing in a per-page delta:
 *   - page dict (PDFDict with /Type /Page) → OK
 *   - annotation dict (PDFDict with /Type /Annot) → OK
 *   - content stream (PDFContentStream) → OK
 *   - anything else (font dict, image XObject, font byte stream...) → NOT OK
 */
function isPageLocalRef(obj: PDFObject): boolean {
  if (obj instanceof PDFContentStream) return true;
  if (obj instanceof PDFDict) {
    const type = obj.get(PDFName.of("Type"));
    if (type instanceof PDFName) {
      const s = type.toString();
      if (s === "/Page" || s === "/Annot" || s === "/Pages") return true;
    }
    // Dicts without an explicit /Type are conservatively allowed —
    // some annotation variants omit it. Truly suspicious objects
    // (fonts) always carry a /Type.
    if (type === undefined) return true;
    return false;
  }
  // PDFArray and PDFStream subclasses (other than PDFContentStream):
  // not expected page-locally.
  return false;
}

function describeRef(obj: PDFObject): string {
  if (obj instanceof PDFDict) {
    const t = obj.get(PDFName.of("Type"));
    const s = obj.get(PDFName.of("Subtype"));
    const parts = [obj.constructor.name];
    if (t instanceof PDFName) parts.push(t.toString());
    if (s instanceof PDFName) parts.push(s.toString());
    return parts.join(" ");
  }
  if (obj instanceof PDFStream) {
    const t = obj.dict?.get?.(PDFName.of("Type"));
    const s = obj.dict?.get?.(PDFName.of("Subtype"));
    const parts = [obj.constructor.name];
    if (t instanceof PDFName) parts.push(t.toString());
    if (s instanceof PDFName) parts.push(s.toString());
    return parts.join(" ");
  }
  return obj.constructor.name;
}

function frameObject(ref: PDFRef, obj: PDFObject): Uint8Array {
  const headerStr = `${ref.objectNumber} ${ref.generationNumber} obj\n`;
  const trailerStr = `\nendobj\n`;
  const objSize = obj.sizeInBytes();
  const total = headerStr.length + objSize + trailerStr.length;
  const buf = new Uint8Array(total);
  let pos = 0;
  for (let i = 0; i < headerStr.length; i++) buf[pos++] = headerStr.charCodeAt(i);
  pos += obj.copyBytesInto(buf, pos);
  for (let i = 0; i < trailerStr.length; i++) buf[pos++] = trailerStr.charCodeAt(i);
  if (pos !== total) {
    throw new Error(`frameObject size mismatch: predicted ${total}, wrote ${pos}`);
  }
  return buf;
}
