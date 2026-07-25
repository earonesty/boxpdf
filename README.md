# boxpdf

A box-layout DSL over [pdf-lib](https://pdf-lib.js.org/). Implemented in portable JavaScript, it runs in Node 20+, Cloudflare Workers, Deno, and browsers.

Live gallery: <https://earonesty.github.io/boxpdf/>

```ts
import { cleanTheme, flowToPdf, hline, hstack, standardFonts, text, vstack } from "boxpdf";

const bytes = await flowToPdf(async (pdf) => {
  const { font, bold } = await standardFonts(pdf);
  const theme = cleanTheme({ font, bold });

  return [
    vstack({ gap: 8 },
      text("Receipt #18472", theme.type.h1),
      text("May 14, 2026", theme.type.caption)
    ),
    hline(theme.hr),
    hstack({ gap: 16, justify: "between", width: 515 },
      text("Wool socks", theme.type.body),
      text("$28.00", { ...theme.type.body, font: bold, align: "right", width: 80 })
    )
  ];
});
```

`flowToPdf` owns the document lifecycle and returns the saved bytes. `standardFonts` embeds the built-in Helvetica family (regular, bold, italic, bold-italic) in one call.

<details>
<summary>Prefer to manage the document yourself? The explicit path still works.</summary>

```ts
import { PDFDocument, StandardFonts } from "pdf-lib";
import { cleanTheme, renderFlow, text, vstack } from "boxpdf";

const pdf  = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);

await renderFlow(pdf, [
  vstack({ gap: 8 },
    text("Receipt #18472", theme.type.h1),
    text("May 14, 2026", theme.type.caption)
  )
]);

const bytes = await pdf.save();
```

`renderFlow(pdf, nodes, options)` paginates into a document you own and returns `{ pages }` — reach for it when you need multiple render passes, the page objects, or custom `save()` options. `boxpdf` re-exports `PDFDocument` and `StandardFonts` for this explicit lifecycle.

</details>

## Install

```sh
npm install boxpdf pdf-lib
```

`pdf-lib` is a peer dependency.

## What it does

- Declarative layout primitives: `vstack`, `hstack`, `text`, `image`, `hline`, `vline`, `spacer`, `flex`, `keepTogether`, `link`, `svgPath`, `table`.
- Padding, margin, background, background images, borders, borderRadius, overflow clipping, flex-grow, flex-shrink, justify, align.
- Rich paragraphs with mixed inline runs, inline replaced nodes, hard breaks, hanging indents, and optional paragraph floats.
- Word wrapping with `maxLines` truncation, optional `breakWords`, and no-wrap control.
- Themes: `cleanTheme`, `stripeTheme`, `editorialTheme`, `brutalistTheme`.
- Multi-page flow with per-page headers and footers, stack fragmentation, and table row fragmentation.
- Streaming generation for memory-bounded output.
- PDF link annotations, text decorations, document metadata.
- ~7 KB minified core. Custom fonts pull in `@pdf-lib/fontkit` only when you call `loadFont` or `embedInter`.

## Templates

Files in [`templates/`](./templates) cover receipts, boarding passes, resumes, order confirmations, and certificates. Each is a single file.

Scaffold one into your app with the CLI:

```sh
npx boxpdf init receipt --out src/pdf/receipt.ts
npx boxpdf list
```

The CLI also ships a resource-only MCP server for agents:

```sh
claude mcp add boxpdf -- npx -y boxpdf mcp
```

## Themes

```ts
import { cleanTheme, editorialTheme, standardFonts } from "boxpdf";

const theme = cleanTheme(await standardFonts(pdf));            // Helvetica
const serif = editorialTheme(await standardFonts(pdf, "times")); // serif + italic slot
```

Every theme factory accepts either a `{ font, bold, italic? }` object — which is exactly what `standardFonts(pdf)` and `embedInter(pdf)` return — or the legacy positional fonts:

```ts
cleanTheme({ font, bold })            // or cleanTheme(font, bold)
stripeTheme({ font, bold })
editorialTheme({ font, bold, italic }) // or editorialTheme(font, bold, italic)
brutalistTheme({ font, bold })         // courier regular + bold
```

`standardFonts(pdf, family)` takes `"helvetica"` (default), `"times"`, or `"courier"` and returns `{ font, bold, italic, boldItalic }`. Every theme exposes the same shape: `colors`, `spacing`, `radii`, `type`, `card`, `hr`.

## API

### Containers

- `vstack(style, ...children)`. Vertical layout.
- `hstack(style, ...children)`. Horizontal layout.
- `keepTogether({ gap?, margin? }, ...children)`. Paginates atomically.

Container `style`:

| Field | Type | Notes |
| --- | --- | --- |
| `width` / `height` | number | Fixed dimensions; otherwise size to content. |
| `padding` / `margin` | number \| `{ top, right, bottom, left }` | Shorthand or per-side. |
| `background` | RGB | Solid fill. |
| `backgroundImage` | `{ image, width, height, offsetX?, offsetY?, repeat? }` | Image painted behind children and clipped to the box. |
| `border` | `{ color, width }` | 1pt+ stroke around the box. |
| `borderSides` | `{ top?, right?, bottom?, left? }` | Per-side strokes using `{ color, width }`. |
| `borderRadius` | number | Corner radius. |
| `overflow` | `"visible"` \| `"hidden"` | Clips stack children and absolute descendants to the box rectangle. |
| `position` | `"relative"` \| `"absolute"` | CSS-like positioning for boxes. |
| `top` / `right` / `bottom` / `left` | number | Absolute offsets in points. |
| `zIndex` | number | Paint order for positioned boxes; higher values render later. |
| `rotate` | number | Clockwise paint rotation in degrees around the box center; layout is unchanged. |
| `transform` | `BoxTransform[]` | Ordered paint transforms: `translate`, `scale`, `rotate`, `skew`, and `matrix`. |
| `transformOrigin` | `{ x, y }` | Pivot using `{ length, percent }` components; defaults to the box center. |
| `grow` | number | Flex grow weight along the parent's main axis. |
| `shrink` | number | Flex shrink weight. |
| `breakInside` | `"auto"` \| `"avoid"` | Fragmentation hint under `renderFlow`; `avoid` keeps the box atomic. |
| `gap` | number | Spacing between children. |
| `justify` | `"start"` \| `"center"` \| `"end"` \| `"between"` \| `"around"` \| `"evenly"` | Main-axis distribution. |
| `align` | `"start"` \| `"center"` \| `"end"` \| `"stretch"` \| `"baseline"` | Cross-axis alignment. `baseline` is intended for `hstack` rows. |

### Leaves

- `text(content, { size, font, color?, align?, width?, lineHeight?, maxLines?, underline?, strikethrough?, margin? })`. Word-wraps when `width` is set. Truncates with ellipsis when `maxLines` is set. Default `lineHeight` uses the font's full height, including descenders.
- `paragraph({ width?, align?, lineHeight?, margin?, paddingLeft?, textIndent?, wrap?, floats? }, ...runs)`. Mixed inline text runs and atomic inline nodes that wrap together as one paragraph. Use `run(text, style)`, `linkRun(text, style, href)`, and `inlineNode(node, { verticalAlign?, href? })`. Newlines in runs create hard breaks; `wrap: false` disables soft wrapping.
- `image(pdfImage, { width, height, margin? })`. Takes an already-embedded `PDFImage`.
- `imageFit(pdfImage, { width, height, fit?, margin? })`. Draws an image centered in a fixed rectangle, scaled to contain (default) or cover with clipping.
- `spacer(size, { grow? })` / `flex(weight = 1)`. Fixed or growing gap.
- `hline({ color, thickness?, width?, margin? })`.
- `vline({ color, thickness?, height?, margin? })`.
- `link({ href }, child)`. Wraps a child and registers a PDF Link annotation over its rendered bounding box.
- `table({ columns, rows, ... })`. Fixed / auto / fractional columns with header/footer rows, dividers, styled cells, and row-level page fragmentation under `renderFlow`. Cells can be plain nodes or `{ content, colSpan?, padding?, background?, border?, borderSides?, borderRadius?, align?, valign? }`.

### Rendering

- `flowToPdf(build, options?)`. The shortest path to bytes. Creates a `PDFDocument`, hands it to your `build(pdf)` callback (embed fonts/images there and return the top-level nodes), paginates with `renderFlow`, and returns the saved `Uint8Array`. Same `options` as `renderFlow`.
- `renderFlow(pdf, nodes[], options)`. Paginates a sequence of top-level children. Top-level `vstack` nodes may fragment between children; `table()` fragments between rows and repeats headers on continuation pages. Use `keepTogether()` or `breakInside: "avoid"` for atomic blocks. Options: `size`, `margin`, `header?`, `footer?`, `reserveBottom?`, `title?`, `author?`, `subject?`, `keywords?`, `creator?`, `producer?`, `debug?`, `warnings?`, `profile?`. Headers and footers receive `{ pageNumber, totalPages }`. Defaults to LETTER (612×792). Pass `{ size: PageSizes.A4 }` for A4. When a top-level child's measured width exceeds the page content area, boxpdf emits a `console.warn`. Suppress with `warnings: false`.
- `savePdf(pdf, options?)`. Save a caller-owned document, optionally with password encryption. Calling `pdf.save()` directly always remains pdf-lib's unencrypted behavior.
- `streamFlow(pdf, writable, asyncIterable, options)`. Incremental page-by-page rendering. Memory stays bounded regardless of page count. Writes PDF bytes to a `WritableStream<Uint8Array>` as each page closes. See the Streaming section below for the contract.
- `renderToPdf(node, options)`. One-page convenience.
- `pageInner(size, margin)` / `pageContent(size, margin)`. Compute the inner content width or rectangle of a page.
- `render(node, page, x, yTop, parentWidth)`. Draws a subtree at a known position on an existing `PDFPage`.
- `measure(node, parentWidth)`. Computes intrinsic size independently of rendering.

Pass `{ debug: true }` to outline content boxes in red and margin boxes in orange.

### Helpers

- `standardFonts(pdf, family?)`. Embed a built-in pdf-lib family (`"helvetica"` default, `"times"`, `"courier"`) and get `{ font, bold, italic, boldItalic }` back — ready to drop into any theme. These use compact PDF standard-font references.
- `loadFont(pdf, source, options?)`. Embed a TTF from URL, bytes, base64, or data URL.
- `loadImage(pdf, source)`. Embed a PNG or JPEG (auto-detected).
- `aspectRatio(ratio, { width })` / `aspectRatio(ratio, { height })`. Derive the missing dimension for fixed-ratio boxes or images.
- `formatCurrency(n, { currency, locale })`. `Intl.NumberFormat` wrapper.
- `defineStyles({ ... })`. Typed identity for reusable style bundles.
- `hex("#1f8a4d")` / `rgb255(31, 138, 77)`. Color builders.

## Loading fonts

Three options.

**Bundled bytes via the CLI.** Recommended for production.

```sh
npx boxpdf font add ./Acme-Regular.ttf=regular ./Acme-Bold.ttf=bold \
  --out src/fonts/acme.ts
```

Generates `src/fonts/acme.ts` with `export const` base64 strings. Then:

```ts
import { loadFont } from "boxpdf";
import { regular, bold } from "./fonts/acme.js";

const font = await loadFont(pdf, regular);
const acmeBold = await loadFont(pdf, bold);
```

Bytes ship inside your bundle for immediate local loading.

**The built-in Inter weights.**

```ts
import { loadFont } from "boxpdf";
import { inter, interBold } from "boxpdf/inter";

const font = await loadFont(pdf, inter);
const bold = await loadFont(pdf, interBold);
```

`boxpdf/inter` re-exports the same Inter subset as raw base64 strings (`inter`, `interBold`, `interItalic`) and as `embedInter(pdf, { italic?, tabularFigures? })`.

Importing `boxpdf/inter` loads ~325 KB of font bytes plus `@pdf-lib/fontkit`. Core-only imports stay on the smaller core bundle.

```ts
import { embedInter } from "boxpdf/inter";

const { font, bold } = await embedInter(pdf);
const theme = cleanTheme(font, bold);
```

Pass `{ tabularFigures: true }` to also get tabular-numeral variants for money columns:

```ts
const { font, bold, tabularFont, tabularBold } = await embedInter(pdf, {
  tabularFigures: true
});

text(formatCurrency(amount), { size: 12, font: tabularBold, align: "right" });
```

**Fetch from a URL.**

```ts
const brand = await loadFont(pdf, "https://example.com/Acme-Regular.ttf");
```

The full TTF gets fetched and subsetted at embed time. On Cloudflare Workers with a warm cache this is fast (~5-15 ms). On a cold cache or in Node you pay the full fetch each time.

`loadFont` accepts the same `{ subset?: boolean; features?: { tnum: true } }` options regardless of the source. Use `features: { tnum: true }` to enable tabular numerals.

## Password encryption

BoxPDF can write PDF 2.0 password-encrypted output using the Standard Security
Handler revision 6 and AES-256. Encryption uses the runtime's Web Crypto
implementation and adds no crypto dependency to browser bundles. The
implementation is loaded as a separate chunk only when encryption is requested.

```ts
const bytes = await flowToPdf(
  async (pdf) => {
    const { font } = await standardFonts(pdf);
    return [text("Confidential", { font, size: 18 })];
  },
  {
    encryption: {
      password: "document-open-password",
      ownerPassword: "administrative-password",
      permissions: {
        printing: "lowResolution",
        copying: false,
        modify: false
      }
    }
  }
);
```

For a caller-owned document, save through `savePdf`:

```ts
import { PDFDocument, renderFlow, savePdf } from "boxpdf";

const pdf = await PDFDocument.create();
await renderFlow(pdf, nodes);
const bytes = await savePdf(pdf, {
  encryption: { password: "open me" }
});
```

`password` is required and cannot prepare to an empty value. `ownerPassword` is
optional; when omitted, BoxPDF generates and discards a random internal owner
credential. Passwords use SASLprep and may contain Unicode, with a maximum of
127 UTF-8 bytes after preparation. Available permissions are `printing`,
`modify`, `copying`, `annotate`, `fillForms`, and `assemble`.

PDF permissions are advisory viewer settings, not DRM. Send the password by a
different channel from the PDF. Encryption cannot be combined with PDF/A, and
BoxPDF does not decrypt input PDFs or preserve existing signatures. Saving the
same document again creates fresh keys, salts, file identifiers, and IVs.

## Streaming output

For long-running document generation, use `streamFlow` instead of `renderFlow`. It emits PDF bytes to a `WritableStream<Uint8Array>` as each page closes. Peak heap is bounded at `O(shared resources + one page in flight)` regardless of total page count.

```ts
import { PDFDocument, StandardFonts } from "pdf-lib";
import { streamFlow, text, cleanTheme } from "boxpdf";

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
streamFlow(pdf, writable, generate(font, bold)).catch(console.error);

return new Response(readable, {
  headers: { "content-type": "application/pdf" }
});

async function* generate(font, bold) {
  for await (const order of fetchOrders()) {
    yield buildOrderRow(font, bold, order);
  }
}
```

For Node, adapt a `stream.Writable`:

```ts
import { createWriteStream } from "node:fs";
import { streamFlow, nodeAdapter } from "boxpdf";

const out = nodeAdapter(createWriteStream("./report.pdf"));
await streamFlow(pdf, out, nodes, {
  encryption: { password: "open me" }
});
```

If one logical stack or table is too large to construct at once, emit bounded
pieces with `flowContinuation`. Adjacent pieces with the same id are paginated
as though they were one node, including stack gaps, decoration, table headers,
and row dividers:

```ts
for (let offset = 0; offset < rows.length; offset += 100) {
  const final = offset + 100 >= rows.length;
  yield flowContinuation(
    table({ columns, header, rows: rows.slice(offset, offset + 100) }),
    "orders",
    final
  );
}
```

Continuation fragments must be consecutive and the last one must set
`final: true`; `streamFlow` rejects interrupted or unfinished sequences instead
of silently producing an incomplete layout.

### Contract

1. All `embedFont` / `embedJpg` / `embedPng` calls must complete before `streamFlow`. Embedding mid-stream throws.
2. The iterable is consumed one node at a time. Pass a generator.
3. `streamFlow` takes exclusive ownership of the writable, closing it on success and aborting it on failure.
4. Streaming headers and footers receive `ctx.pageNumber`. Use `renderFlow` for headers or footers that display "Page X of Y"; accessing `ctx.totalPages` during streaming throws.
5. Output is 0-5% larger than `renderFlow`'s default `save()`.

### Memory bench

Peak heap during render. Each measurement runs in its own subprocess. 50 lines of text per page. `@react-pdf/renderer` included for shape comparison.

| Pages | streamFlow peak | renderFlow peak | @react-pdf peak | Output |
| ---:  | ---:            | ---:            | ---:            | ---:   |
|    50 |     12.8 MB     |     31.7 MB     |    160.8 MB     |  70 KB |
|   250 |     15.4 MB     |     91.1 MB     |    643.1 MB     | 347 KB |
|   500 |     18.7 MB     |    120.8 MB     |  1,219.9 MB     | 693 KB |
|  1000 |     25.4 MB     |    219.6 MB     |  2,292.6 MB     | 1.4 MB |

streamFlow holds peak heap roughly flat (12 → 25 MB across a 100× workload increase). renderFlow scales roughly linearly with page count. `@react-pdf/renderer` adds ~2.3 MB per page in this workload and peaks at 2.3 GB by 1000 pages. See `docs/design/streaming.md` for the design and the chart.

The continuation path has its own heap-capped subprocess check. Unlike the
older comparison above, it constructs every fragment lazily and forces a GC
after output to distinguish V8's allocation high-water mark from the retained
live set:

| Continuation fragments | Output pages | Sampled peak heap | Retained heap after GC | Output |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 81 | ~58 MB | ~16 MB | 129 KB |
| 1000 | 810 | ~125 MB | ~26 MB | 1.3 MB |

Both runs complete with `--max-old-space-size=128`. Across the 10× workload,
the retained heap grows by about 10 MB, primarily from the final page tree and xref
index; rendered page content and continuation input are released incrementally.
Reproduce it with `pnpm memory:check:continuation`.

## Cloudflare Workers

Both the core and the `boxpdf/inter` subpath run on Workers without `nodejs_compat`.

```ts
import { Hono } from "hono";
import { cleanTheme, flowToPdf, standardFonts, text } from "boxpdf";

const app = new Hono();

app.get("/receipt.pdf", async (c) => {
  const bytes = await flowToPdf(async (pdf) => {
    const t = cleanTheme(await standardFonts(pdf));
    return [
      text("Thanks!", t.type.h1),
      text("This PDF was generated at the edge.", t.type.body)
    ];
  });
  return new Response(bytes, { headers: { "content-type": "application/pdf" } });
});

export default app;
```

## Examples

Runnable scripts in [`examples/`](./examples):

- `receipt.ts`. Single-page receipt with totals.
- `itinerary.ts`. Two-band travel itinerary.
- `invoice.ts`. Multi-page invoice with running header and footer plus `keepTogether`.
- `debug.ts`. Layout with `{ debug: true }`.
- `themes-showcase.ts`. The same receipt rendered in all four themes.
- `inter-showcase.ts`. Clean theme rendered with Inter.
- `flex-shrink.ts`. Three URL-overflow behaviors side by side.
- `hanging-indent.ts`. Paragraph `paddingLeft` plus negative `textIndent` for list markers.
- `overflow-clipping.ts`. Clipped cards with absolute overlays and background images.

## Flex-shrink

Opt-in via `shrink: number` on any child of an `hstack` or `vstack`. When the sum of children's intrinsic main-axis sizes exceeds the parent's available space, items with `shrink > 0` give up shares proportional to `shrink × baseSize`. Items with `shrink = 0` (the default) are frozen.

```ts
hstack(
  { width: 360, gap: 16 },
  text("Customer:", { size: 11, font: bold }),
  text("Mr. Algernon Hephaestus Constantine Pemberton-Smythe III", {
    size: 11, font, shrink: 1
  })
)
```

Behavior:

- A text child's minimum width equals its widest whitespace-separated word. Wrapping occurs at whitespace boundaries.
- A single-token string (URL, hash, slug) preserves its intrinsic width and visibly overflows its slot. Two opt-ins lower the floor:
  - `maxLines: N`. The engine ellipsizes overflow. The text shrinks to its slot and trims with `…`.
  - `breakWords: true`. CSS `overflow-wrap: break-word`. Hard-breaks at character boundaries.
- When shrunk text rewraps to more lines, the container's intrinsic height grows accordingly.
- When one item hits its min-word floor, its remaining shrink weight redistributes to siblings.
- Works on `vstack` too when the parent has a fixed `height` smaller than the sum of children.
- `link` forwards its child's shrink weight, so linked text shrinks and re-wraps like bare text.

See `examples/flex-shrink.ts`.

## Absolute positioning

Boxes can use a small CSS-like positioning model:

```ts
vstack(
  { width: 240, height: 120, position: "relative", padding: 16 },
  text("Receipt", { size: 18, font: bold }),
  hstack(
    { position: "absolute", top: 12, right: 12, width: 70 },
    text("PAID", { size: 14, font: bold, align: "center", width: 70 })
  )
)
```

Behavior:

- Any positioned box establishes the containing block for absolute descendant boxes.
- `position: "absolute"` removes a `vstack` or `hstack` from normal stack flow.
- Absolute boxes render after normal children, so they can be used for stamps, badges, overlays, and watermarks.
- `top`, `right`, `bottom`, and `left` are point offsets from the nearest positioned ancestor, falling back to the current `render()` root.
- If both `left` and `right` are set and `width` is omitted, the box stretches to the remaining width. `top` plus `bottom` does the same for height.
- Absolute siblings render by `zIndex` from low to high. Boxes with the same `zIndex` keep document order.
- Parent measurement, gaps, flex grow/shrink, and pagination ignore absolute boxes. Give the containing box a fixed `width` and `height` when you need stable placement.

## Limitations

- Positioning supports relative containing boxes, out-of-flow absolute boxes, point offsets, `zIndex`, and stretch from paired edges.
- Font shaping follows pdf-lib and fontkit support. Complex Indic, Arabic, and Thai scripts require a HarfBuzz-based stack; available HarfBuzz stacks currently target runtimes beyond Cloudflare Workers.
- `streamFlow` supports incremental generation. PDF linearization (reordering the byte stream so byte 1 is page 1) remains a separate post-process.

## License

MIT © Erik Aronesty
