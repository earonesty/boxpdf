# boxpdf

Tiny box-layout DSL over [pdf-lib](https://pdf-lib.js.org/). Flexbox-lite for
server-side PDFs in any JS runtime — Node, Cloudflare Workers, Deno, the
browser. No native deps, no WASM, no headless browser.

If you've ever written `page.drawText(x, height - 246 - lineHeight)`, this is
for you.

```ts
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hex, hline, hstack, renderToPdf, text, vstack } from "boxpdf";

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const bytes = await renderToPdf(
  vstack(
    { padding: 32, gap: 12 },
    text("Onward Travel", { size: 22, font: bold }),
    text("Confirmation #F3PU74", { size: 12, font, color: hex("#6b7280") }),
    hline({ color: hex("#e5e7eb") }),
    hstack(
      { gap: 24, justify: "between", width: 515 },
      text("Cebu (CEB) → Ho Chi Minh City (SGN)", { size: 14, font: bold }),
      text("Confirmed", { size: 12, font: bold, color: hex("#1f8a4d") })
    )
  )
);

// `bytes` is a Uint8Array — write it to disk, R2, a Response, etc.
```

## Why?

`pdf-lib` is the right primitive for edge runtimes (no WASM, no fontkit, no
headless Chromium) but its API is coordinate-based. `@react-pdf/renderer` is
declarative but [doesn't run on Cloudflare Workers](https://github.com/diegomura/react-pdf/issues/2497)
because fontkit needs runtime WASM, which Workers disallow.

`boxpdf` is the middle layer: declarative boxes, flex-ish layout, real word
wrapping — built on top of `pdf-lib` and nothing else.

- **~6kB minified.** Pure TypeScript, zero runtime deps beyond `pdf-lib`
  (which is your peer dependency).
- **Works everywhere `pdf-lib` works.** Node 18+, Cloudflare Workers, Deno,
  browsers.
- **Predictable.** No virtual DOM, no scheduler, no reconciliation. Build a
  tree of plain objects with `vstack`/`hstack`/`text`, then `render` it.

## Install

```sh
npm install boxpdf pdf-lib
# or pnpm add / yarn add — pdf-lib is a peer dependency
```

## API at a glance

### Containers

- `vstack(style, ...children)` — vertical layout.
- `hstack(style, ...children)` — horizontal layout.

Container `style`:

| Field | Type | Notes |
| --- | --- | --- |
| `width` / `height` | number | Fixed dimensions; otherwise size to content. |
| `padding` / `margin` | number \| `{ top, right, bottom, left }` | Shorthand or per-side. |
| `background` | RGB | Solid fill. |
| `border` | `{ color, width }` | 1pt+ stroke around the box. |
| `grow` | number | Flex grow weight along the parent's main axis. |
| `gap` | number | Spacing between children. |
| `justify` | `"start"` \| `"center"` \| `"end"` \| `"between"` \| `"around"` \| `"evenly"` | Main-axis distribution. |
| `align` | `"start"` \| `"center"` \| `"end"` \| `"stretch"` | Cross-axis alignment. |

### Leaves

- `text(content, { size, font, color?, align?, width?, lineHeight?, maxLines?, margin? })`
  — text node. Supply `width` to enable word-wrapping. `maxLines` truncates
  with an ellipsis.
- `image(pdfImage, { width, height, margin? })` — already-embedded `PDFImage`.
- `spacer(size, { grow? })` — fixed-size or growing gap.
- `flex(weight = 1)` — shortcut for `spacer(0, { grow: weight })`.
- `hline({ color, thickness?, width?, margin? })` — horizontal rule.
- `vline({ color, thickness?, height?, margin? })` — vertical rule.

### Rendering

- `renderToPdf(node, { size?, margin? })` — one-page convenience.
- `renderFlow(pdf, nodes[], { size?, margin?, reserveBottom? })` — paginate a
  sequence of top-level children. Each child renders atomically; if the next
  child doesn't fit, a new page is added.
- `render(node, page, x, yTop, parentWidth)` — low-level escape hatch when you
  already have a `PDFPage` and want to draw a subtree at a known position.
- `measure(node, parentWidth)` — compute intrinsic size without drawing
  (useful for custom paginators).

### Colors

- `rgb255(r, g, b)` — 0–255 channels.
- `hex("#1f8a4d")` — 3- or 6-digit hex.
- `Colors.{black, white, ink, muted, border, surface}` — a small built-in palette.

## Layout model

`boxpdf`'s layout is flex-like but simpler than real CSS flexbox:

- A `vstack`'s main axis is vertical; an `hstack`'s is horizontal.
- Children size to their content unless they declare an explicit `width` /
  `height` or have `grow > 0`.
- `grow` only applies along the parent's main axis. Cross-axis sizing is
  governed by the child's intrinsic size, capped at the inner container width.
- `justify` and `align` only kick in when there's slack (parent has fixed
  dimensions larger than the content).
- `padding` is inside the border; `margin` is outside.

There's intentionally no `position: absolute`. If you need it, drop down to
`render(node, page, x, y, width)` — that's the escape hatch.

## Pagination

`renderFlow` is the simplest way to fill multi-page documents:

```ts
import { PDFDocument } from "pdf-lib";
import { renderFlow, text, vstack } from "boxpdf";

const pdf = await PDFDocument.create();
const headers = await ...; // build per-line nodes
await renderFlow(pdf, headers, { margin: 48 });
const bytes = await pdf.save();
```

It never splits a child across pages — if the next node won't fit, a fresh
page is added and rendering continues there.

## Running in Cloudflare Workers

`boxpdf` and `pdf-lib` both work in Workers without `nodejs_compat`. Build
your PDF in the request handler, write it into an R2 bucket, and return the
key — or stream the bytes back directly:

```ts
import { Hono } from "hono";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { renderToPdf, text, vstack } from "boxpdf";

const app = new Hono();

app.get("/receipt.pdf", async (c) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bytes = await renderToPdf(
    vstack({ padding: 36 }, text("Thanks for your order!", { size: 18, font }))
  );
  return new Response(bytes, { headers: { "content-type": "application/pdf" } });
});

export default app;
```

## Examples

See [`examples/`](./examples) for runnable scripts.

- `examples/receipt.ts` — single-page receipt with a header band and totals row.
- `examples/itinerary.ts` — a two-band travel itinerary (the case this library
  was extracted from).
- `examples/invoice.ts` — multi-page invoice with line items and pagination.

```sh
pnpm install
pnpm run example   # writes example PDFs to ./fixtures/
```

## Known limits

- No `border-radius` (pdf-lib doesn't expose stroked rounded rects natively).
  Fake it with overlapping rectangles if you really need it.
- No `position: absolute` — by design. Drop to `render()` with explicit
  coordinates if you must.
- Font shaping is whatever `pdf-lib` supports (Helvetica/Times/Courier
  built-ins, plus any TTF you embed). If you need fancy script shaping, you
  need a different stack — `boxpdf` won't help.

## License

MIT © Erik Aronesty
