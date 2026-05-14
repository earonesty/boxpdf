# boxpdf

A box-layout DSL over [pdf-lib](https://pdf-lib.js.org/). Runs in Node 18+, Cloudflare Workers, Deno, and browsers. No native dependencies, no WASM, no headless browser.

Live gallery: <https://earonesty.github.io/boxpdf/>

```ts
import { PDFDocument, StandardFonts } from "pdf-lib";
import { cleanTheme, hline, hstack, renderFlow, text, vstack } from "boxpdf";

const pdf  = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const theme = cleanTheme(font, bold);

await renderFlow(pdf, [
  vstack({ gap: 8 },
    text("Receipt #18472", theme.type.h1),
    text("May 14, 2026", theme.type.caption)
  ),
  hline(theme.hr),
  hstack({ gap: 16, justify: "between", width: 515 },
    text("Wool socks", theme.type.body),
    text("$28.00", { ...theme.type.body, font: bold, align: "right", width: 80 })
  )
]);

const bytes = await pdf.save();
```

## Install

```sh
npm install boxpdf pdf-lib
```

`pdf-lib` is a peer dependency.

## What it does

- Declarative layout primitives: `vstack`, `hstack`, `text`, `image`, `hline`, `vline`, `spacer`, `flex`, `keepTogether`, `link`, `svgPath`, `table`.
- Padding, margin, background, border, borderRadius, flex-grow, flex-shrink, justify, align.
- Word wrapping with `maxLines` truncation and optional `breakWords`.
- Themes: `cleanTheme`, `stripeTheme`, `editorialTheme`, `brutalistTheme`.
- Multi-page flow with per-page headers and footers.
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
import { cleanTheme, stripeTheme, editorialTheme, brutalistTheme } from "boxpdf";

const theme = cleanTheme(font, bold);
// stripeTheme(font, bold)
// editorialTheme(font, bold, italic)
// brutalistTheme(courier, courierBold)
```

Every theme exposes the same shape: `colors`, `spacing`, `radii`, `type`, `card`, `hr`.

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
| `border` | `{ color, width }` | 1pt+ stroke around the box. |
| `borderRadius` | number | Corner radius. |
| `grow` | number | Flex grow weight along the parent's main axis. |
| `shrink` | number | Flex shrink weight. |
| `gap` | number | Spacing between children. |
| `justify` | `"start"` \| `"center"` \| `"end"` \| `"between"` \| `"around"` \| `"evenly"` | Main-axis distribution. |
| `align` | `"start"` \| `"center"` \| `"end"` \| `"stretch"` | Cross-axis alignment. |

### Leaves

- `text(content, { size, font, color?, align?, width?, lineHeight?, maxLines?, underline?, strikethrough?, margin? })`. Word-wraps when `width` is set. Truncates with ellipsis when `maxLines` is set.
- `image(pdfImage, { width, height, margin? })`. Takes an already-embedded `PDFImage`.
- `spacer(size, { grow? })` / `flex(weight = 1)`. Fixed or growing gap.
- `hline({ color, thickness?, width?, margin? })`.
- `vline({ color, thickness?, height?, margin? })`.
- `link({ href }, child)`. Wraps a child and registers a PDF Link annotation over its rendered bounding box.

### Rendering

- `renderFlow(pdf, nodes[], options)`. Paginates a sequence of top-level children. Options: `size`, `margin`, `header?`, `footer?`, `reserveBottom?`, `title?`, `author?`, `subject?`, `keywords?`, `creator?`, `producer?`, `debug?`, `warnings?`. Headers and footers receive `{ pageNumber, totalPages }`. Defaults to LETTER (612×792). Pass `{ size: PageSizes.A4 }` for A4. When a top-level child's measured width exceeds the page content area, boxpdf emits a `console.warn`. Suppress with `warnings: false`.
- `streamFlow(pdf, writable, asyncIterable, options)`. Incremental page-by-page rendering. Memory stays bounded regardless of page count. Writes PDF bytes to a `WritableStream<Uint8Array>` as each page closes. See the Streaming section below for the contract.
- `renderToPdf(node, options)`. One-page convenience.
- `pageInner(size, margin)` / `pageContent(size, margin)`. Compute the inner content width or rectangle of a page.
- `render(node, page, x, yTop, parentWidth)`. Draws a subtree at a known position on an existing `PDFPage`.
- `measure(node, parentWidth)`. Intrinsic size without drawing.

Pass `{ debug: true }` to outline content boxes in red and margin boxes in orange.

### Helpers

- `loadFont(pdf, source, options?)`. Embed a TTF from URL, bytes, base64, or data URL.
- `loadImage(pdf, source)`. Embed a PNG or JPEG (auto-detected).
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

Bytes ship inside your bundle. No network round-trip.

**The built-in Inter weights.**

```ts
import { loadFont } from "boxpdf";
import { inter, interBold } from "boxpdf/inter";

const font = await loadFont(pdf, inter);
const bold = await loadFont(pdf, interBold);
```

`boxpdf/inter` re-exports the same Inter subset as raw base64 strings (`inter`, `interBold`, `interItalic`) and as `embedInter(pdf, { italic?, tabularFigures? })`.

Importing `boxpdf/inter` loads ~325 KB of font bytes plus `@pdf-lib/fontkit`. The subpath isn't loaded otherwise.

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
await streamFlow(pdf, out, nodes);
```

### Contract

1. All `embedFont` / `embedJpg` / `embedPng` calls must complete before `streamFlow`. Embedding mid-stream throws.
2. The iterable is consumed one node at a time. Pass a generator.
3. `streamFlow` closes the writable on success and aborts it on failure. Don't write to it concurrently.
4. `ctx.totalPages` is not available in headers and footers. Accessing it throws. Use `renderFlow` if you need "Page X of Y".
5. Output is 0-5% larger than `renderFlow`'s default `save()`.

### Memory bench

Peak heap during render. Each measurement runs in its own subprocess. Both modes consume the same pre-built `Node[]` so input cost is in baseline for both. 50 lines of text per page.

| Pages | renderFlow peak | streamFlow peak | Ratio | Output |
| ---:  | ---:            | ---:            | ---:  | ---:   |
|    50 |     31.6 MB     |     12.8 MB     |  2.5× |  70 KB |
|   250 |     66.4 MB     |     15.4 MB     |  4.3× | 347 KB |
|   500 |    134.9 MB     |     18.7 MB     |  7.2× | 693 KB |
|  1000 |    169.0 MB     |     25.4 MB     |  6.6× | 1.4 MB |

At 1000 pages, the streaming path uses ~140 MB less peak memory for byte-equivalent output (sizes within 0.2%). See `docs/design/streaming.md` for the design.

## Cloudflare Workers

Both the core and the `boxpdf/inter` subpath run on Workers without `nodejs_compat`.

```ts
import { Hono } from "hono";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { cleanTheme, renderFlow, text } from "boxpdf";

const app = new Hono();

app.get("/receipt.pdf", async (c) => {
  const pdf  = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const t    = cleanTheme(font, bold);
  await renderFlow(pdf, [
    text("Thanks!", t.type.h1),
    text("This PDF was generated at the edge.", t.type.body)
  ]);
  const bytes = await pdf.save();
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

- A text child won't shrink below the width of its widest whitespace-separated word. Wrapping breaks on whitespace, not mid-word.
- A single-token string (URL, hash, slug) won't shrink at all and overflows its slot visibly. Two opt-ins lower the floor:
  - `maxLines: N`. The engine ellipsizes overflow. The text shrinks to its slot and trims with `…`.
  - `breakWords: true`. CSS `overflow-wrap: break-word`. Hard-breaks at character boundaries.
- When shrunk text rewraps to more lines, the container's intrinsic height grows accordingly.
- When one item hits its min-word floor, its remaining shrink weight redistributes to siblings.
- Works on `vstack` too when the parent has a fixed `height` smaller than the sum of children.
- `link` forwards its child's shrink weight, so linked text shrinks and re-wraps like bare text.

See `examples/flex-shrink.ts`.

## Limitations

- No `position: absolute`. Drop to `render()` with explicit coordinates if you need it.
- Font shaping is whatever pdf-lib and fontkit support. Complex Indic, Arabic, and Thai shaping isn't here. Full HarfBuzz requires a different stack, none of which run on Cloudflare Workers today.
- PDF linearization (reordering the byte stream so byte 1 is page 1) is not done. Streaming generation is supported via `streamFlow`. Linearization is a separate post-process and out of scope.

## License

MIT © Erik Aronesty
