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
  `@pdf-lib/fontkit` as dev-dep only when you call `embedFont` / `embedInter`.
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

Or scaffold one into your app with the CLI:

```sh
npx boxpdf init receipt --out src/pdf/receipt.ts
npx boxpdf list
```

`boxpdf` also ships a tiny resource-only MCP server so agents can load the
README, usage guide, and template sources without you pasting docs into chat:

```sh
claude mcp add boxpdf -- npx -y boxpdf mcp
```

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
| `shrink` | number | Flex shrink weight — overflowing children give up `shrink × baseSize` shares of the overflow. |
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

### Three ways to load a font

For any custom font (not the built-in `StandardFonts.Helvetica` / etc.), use
`loadFont(pdf, source, options?)`. The source can be:

**1) Bundled bytes via the CLI — recommended for production.**

```sh
npx boxpdf font add ./Acme-Regular.ttf=regular ./Acme-Bold.ttf=bold \
  --out src/fonts/acme.ts
```

Generates `src/fonts/acme.ts` with two `export const` base64 strings.
Then in your code:

```ts
import { loadFont } from "boxpdf";
import { regular, bold } from "./fonts/acme.js";

const font = await loadFont(pdf, regular);
const acmeBold = await loadFont(pdf, bold);
```

Bytes ship inside your bundle — no network round-trip, predictable cold-start
cost, works in every runtime.

**2) The built-in Inter weights.**

```ts
import { loadFont } from "boxpdf";
import { inter, interBold } from "boxpdf/inter";

const font = await loadFont(pdf, inter);
const bold = await loadFont(pdf, interBold);
```

`boxpdf/inter` re-exports the same Inter subset both as raw base64 strings
(`inter`, `interBold`, `interItalic`) and as the convenience helper
`embedInter(pdf, { italic?, tabularFigures? })` that loads several at once.

**3) Fetch from a URL — good for edge runtimes where the asset is cache-friendly.**

```ts
const brand = await loadFont(pdf, "https://example.com/Acme-Regular.ttf");
```

The full TTF gets fetched and subsetted at embed time. On Cloudflare Workers
with a warm cache this is fast (~5–15 ms); on a cold cache or in Node
you pay the full fetch each time. For production prefer option (1).

`loadFont` accepts the same `{ subset?: boolean; features?: { tnum: true } }`
options regardless of the source. Use `features: { tnum: true }` to enable
tabular numerals for money columns.

### Inter font (optional)

```ts
import { embedInter } from "boxpdf/inter";

const { font, bold } = await embedInter(pdf);  // ~82 KB / weight, subsetted
const theme = cleanTheme(font, bold);
```

`boxpdf/inter` is a separate subpath. Importing it loads ~325 KB of font
bytes plus `@pdf-lib/fontkit`; if you don't import it, neither hits your
bundle.

Pass `{ tabularFigures: true }` to also get tabular-numeral variants. Use
them for money columns and number-heavy tables — every digit gets the
same advance width so totals line up to a fixed grid:

```ts
const { font, bold, tabularFont, tabularBold } = await embedInter(pdf, {
  tabularFigures: true
});

text(formatCurrency(amount), { size: 12, font: tabularBold, align: "right" });
```

The proportional `font` / `bold` are still preferred for body text — Inter's
proportional `1` is narrower than `0`, which reads better in prose. Use the
tabular pair only where you need the alignment.

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

## Flex-shrink

Opt-in via `shrink: number` on any child of an `hstack` or `vstack`. When the
sum of children's intrinsic main-axis sizes exceeds the parent's available
space, items with `shrink > 0` give up shares proportional to
`shrink × baseSize`. Items with `shrink = 0` (the default) are frozen.

```ts
hstack(
  { width: 360, gap: 16 },
  text("Customer:", { size: 11, font: bold }),                       // shrink: 0 — keeps its intrinsic width
  text("Mr. Algernon Hephaestus Constantine Pemberton-Smythe III", { // shrink: 1 — re-wraps to the leftover slot
    size: 11, font, shrink: 1
  })
)
```

- **Text floor (CSS-idiomatic).** A text child won't shrink below the width
  of its widest single whitespace-separated word — wrapping breaks on
  whitespace, never mid-word. A single-token string with no whitespace
  (URL, hash, slug) therefore won't shrink at all and overflows its slot
  visibly. Two opt-ins lower the floor:
  - `maxLines: N` — engine ellipsizes overflow, so the floor drops to 0 and
    the text shrinks to its slot and trims with `…`. Use this for clean
    truncation of long URLs / names in tight columns.
  - `breakWords: true` — CSS `overflow-wrap: break-word`; the engine
    hard-breaks at character boundaries. Use this for monospace tables,
    hashes, long identifiers where wrapping is preferred to truncation.
- **Cross-axis recomputes.** When shrunk text rewraps to more lines, the
  container's intrinsic height grows accordingly.
- **Iterative.** When one item hits its min-word floor, its remaining
  shrink weight redistributes to siblings — same model as CSS flexbox.
- **Vertical too.** Works on `vstack` when the parent has a fixed `height`
  smaller than the sum of children.
- **Through `link`.** A `link` wrapper forwards its child's shrink weight,
  so linked text shrinks and re-wraps just like bare text.

See `examples/flex-shrink.ts` for a runnable showcase.

## Known limits

- **No `position: absolute`** — by design. Drop to `render()` with explicit
  coordinates if you must.
- **Font shaping** is whatever pdf-lib / fontkit support. Complex Indic /
  Arabic / Thai shaping isn't here. If you need full HarfBuzz, you need a
  different stack — none of which run on Cloudflare Workers today.
- **Streaming output** isn't real today. Page-at-a-time streaming requires
  our own PDF serializer; tracked for v2.

## License

MIT © Erik Aronesty
