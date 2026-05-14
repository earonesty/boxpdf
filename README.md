# boxpdf

Tiny box-layout DSL over [pdf-lib](https://pdf-lib.js.org/). Flexbox-lite for
server-side PDFs in any JS runtime — Node, Cloudflare Workers, Deno, the
browser. No native deps, no WASM, no headless browser.

**[Live gallery, themes, and template browser →](https://earonesty.github.io/boxpdf/)**

If you've ever written `page.drawText(x, height - 246 - lineHeight)`, this is
for you.

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

const bytes = await pdf.save();  // Uint8Array — write to disk, R2, a Response, etc.
```

## Why?

`pdf-lib` is the right primitive for edge runtimes (no WASM, no fontkit, no
headless Chromium) but its API is coordinate-based. `@react-pdf/renderer` is
declarative but doesn't run on Cloudflare Workers because fontkit needs
runtime WASM, which Workers disallow.

`boxpdf` is the middle layer: declarative boxes, flex-ish layout, real word
wrapping — built on top of `pdf-lib` and nothing else by default.

- **~7 KB minified core.** Pure TypeScript. Custom fonts pull in
  `@pdf-lib/fontkit` only when you call `embedFont` / `embedInter`.
- **Works everywhere `pdf-lib` works.** Node 18+, Cloudflare Workers (verified
  end-to-end, no `nodejs_compat`), Deno, browsers.
- **Predictable.** No virtual DOM, no scheduler, no reconciliation. Build a
  tree of plain objects with `vstack`/`hstack`/`text`, then `render` it.

## Install

```sh
npm install boxpdf pdf-lib
# pdf-lib is a peer dependency.
```

## Templates

Copy-paste files in [`templates/`](./templates) — receipt, boarding pass,
resume, order confirmation, certificate. Each one is a single file that
renders to a polished PDF.

```sh
pnpm install
pnpm run gallery   # renders all templates + every showcase example
```

See the [live gallery](https://earonesty.github.io/boxpdf/#templates) for
thumbnails and source links.

## Themes

Same identical layout code, four named themes:

```ts
import { cleanTheme, stripeTheme, editorialTheme, brutalistTheme } from "boxpdf";

const theme =
  cleanTheme(font, bold)    // modern SaaS default — soft borders, 8pt rounded
  // stripeTheme(font, bold)         // square corners, thin borders, monochrome SaaS
  // editorialTheme(font, bold, italic)  // Times serif, warm cream, italic captions
  // brutalistTheme(courier, courierBold) // monospace, 2pt black borders, lemon accent
;
```

Every theme exposes the same shape: `colors`, `spacing`, `radii`, `type`,
`card`, `hr`. Templates compose from these tokens instead of hex/size
literals.

## API at a glance

### Containers

- `vstack(style, ...children)` — vertical layout.
- `hstack(style, ...children)` — horizontal layout.
- `keepTogether({ gap?, margin? }, ...children)` — paginates atomically
  (won't split across pages).

Container `style`:

| Field | Type | Notes |
| --- | --- | --- |
| `width` / `height` | number | Fixed dimensions; otherwise size to content. |
| `padding` / `margin` | number \| `{ top, right, bottom, left }` | Shorthand or per-side. |
| `background` | RGB | Solid fill. |
| `border` | `{ color, width }` | 1pt+ stroke around the box. |
| `borderRadius` | number | Corner radius. Applied to background fill and border. |
| `grow` | number | Flex grow weight along the parent's main axis. |
| `gap` | number | Spacing between children. |
| `justify` | `"start"` \| `"center"` \| `"end"` \| `"between"` \| `"around"` \| `"evenly"` | Main-axis distribution. |
| `align` | `"start"` \| `"center"` \| `"end"` \| `"stretch"` | Cross-axis alignment. |

### Leaves

- `text(content, { size, font, color?, align?, width?, lineHeight?, maxLines?, underline?, strikethrough?, margin? })`
  — text node. Word-wraps when `width` is set; truncates with ellipsis when
  `maxLines` is.
- `image(pdfImage, { width, height, margin? })` — already-embedded `PDFImage`.
- `spacer(size, { grow? })` / `flex(weight = 1)` — fixed or growing gap.
- `hline({ color, thickness?, width?, margin? })` — horizontal rule.
- `vline({ color, thickness?, height?, margin? })` — vertical rule.
- `link({ href }, child)` — wraps a child and registers a PDF Link
  annotation over its rendered bounding box.

### Rendering

- `renderToPdf(node, options)` — one-page convenience.
- `renderFlow(pdf, nodes[], options)` — paginate a sequence of top-level
  children. Options: `size`, `margin`, `header?`, `footer?`, `reserveBottom?`,
  `title?`, `author?`, `subject?`, `keywords?`, `creator?`, `producer?`,
  `debug?`. Headers/footers receive `{ pageNumber, totalPages }`.
- `render(node, page, x, yTop, parentWidth)` — escape hatch for drawing a
  subtree at a known position on an existing `PDFPage`.
- `measure(node, parentWidth)` — intrinsic size without drawing.

Pass `{ debug: true }` to render-with-overlay (red content boxes, orange
margin boxes).

### Helpers

- `embedFont(pdf, { source })` — embed a TTF from URL / bytes / data URL.
- `loadImage(pdf, source)` — embed a PNG or JPEG (auto-detected) from
  URL / bytes / data URL.
- `formatCurrency(n, { currency, locale })` — `Intl.NumberFormat` wrapper.
- `defineStyles({ ... })` — typed identity for reusable style bundles.
- `hex("#1f8a4d")` / `rgb255(31, 138, 77)` — color builders.

### Inter font (optional)

```ts
import { embedInter } from "boxpdf/inter";

const { font, bold } = await embedInter(pdf);  // ~82 KB / weight, subsetted
const theme = cleanTheme(font, bold);
```

`boxpdf/inter` is a separate subpath. Importing it loads ~325 KB of font
bytes plus `@pdf-lib/fontkit`; if you don't import it, neither hits your
bundle.

## Cloudflare Workers

Both the core and the `boxpdf/inter` subpath are verified to run on
Cloudflare Workers without `nodejs_compat`. Drop into a handler:

```ts
import { Hono } from "hono";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { cleanTheme, renderFlow, text, vstack } from "boxpdf";

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

See [`examples/`](./examples) for runnable scripts.

- `examples/receipt.ts` — single-page receipt with totals.
- `examples/itinerary.ts` — two-band travel itinerary.
- `examples/invoice.ts` — multi-page invoice with running header / footer
  and `keepTogether`.
- `examples/debug.ts` — layout with `{ debug: true }`.
- `examples/themes-showcase.ts` — same receipt rendered in all four themes.
- `examples/inter-showcase.ts` — clean theme rendered with Inter font.

## Known limits

- **No flex-shrink yet.** Children that exceed their parent's main-axis
  dimension overflow rather than shrinking. Give wrapping text an explicit
  `width`, or size containers explicitly. Planned for v2.
- **No `position: absolute`** — by design. Drop to `render()` with explicit
  coordinates if you must.
- **Font shaping** is whatever pdf-lib / fontkit support. Complex Indic /
  Arabic / Thai shaping isn't here. If you need full HarfBuzz, you need a
  different stack — none of which run on Cloudflare Workers today.
- **Streaming output** isn't real today. Page-at-a-time streaming requires
  our own PDF serializer; tracked for v2.

## License

MIT © Erik Aronesty
