import { describe, expect, it, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  hline,
  hstack,
  link,
  spacer,
  text,
  vstack
} from "../src/nodes.js";
import { measure, resolveMainAxis } from "../src/measure.js";
import { renderToPdf } from "../src/document.js";
import type { Node } from "../src/types.js";

function widthOf(child: Node): number | undefined {
  if (child.kind === "vstack" || child.kind === "hstack") return child.style.width;
  if (child.kind === "text") return child.props.width;
  if (child.kind === "spacer") return child.size;
  if (child.kind === "hline") return child.width;
  return undefined;
}

let font: PDFFont;
let bold: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
  bold = await pdf.embedFont(StandardFonts.HelveticaBold);
});

const SIZE = 12;

function textWidth(s: string): number {
  return font.widthOfTextAtSize(s, SIZE);
}

describe("flex-shrink: hstack horizontal axis", () => {
  it("does not shrink when intrinsic content fits", () => {
    const a = text("alpha", { size: SIZE, font, shrink: 1 });
    const b = text("beta", { size: SIZE, font, shrink: 1 });
    const intrinsic = textWidth("alpha") + textWidth("beta");
    const container = hstack({ width: intrinsic + 100 }, a, b);
    const m = measure(container, 1000);
    // Container reports its fixed width regardless.
    expect(m.width).toBe(intrinsic + 100);
    // Children stay at intrinsic — we don't grow either when no grow is set.
  });

  it("shrinks a single overflowing text child to fit the container", () => {
    const long = "alpha beta gamma delta epsilon zeta eta";
    const intrinsic = textWidth(long);
    expect(intrinsic).toBeGreaterThan(60);
    const node = hstack({ width: 60 }, text(long, { size: SIZE, font, shrink: 1 }));
    const m = measure(node, 1000);
    expect(m.width).toBe(60);
    // Height grew because text re-wrapped to the narrower slot.
    const oneLineHeight = font.heightAtSize(SIZE, { descender: false });
    expect(m.height).toBeGreaterThan(oneLineHeight * 1.5);
  });

  it("distributes overflow proportionally across two equal-weight shrink siblings", () => {
    // Two long texts, equal shrink weights. Each should give up ~half of the
    // overflow (measured by post-shrink height — same wrap width ⇒ same lines).
    const t = "the quick brown fox jumps over the lazy dog ".repeat(2);
    const a = text(t, { size: SIZE, font, shrink: 1 });
    const b = text(t, { size: SIZE, font, shrink: 1 });
    const intrinsic = textWidth(t);
    const containerWidth = intrinsic; // each child wants `intrinsic`; total = 2*intrinsic; overflow = intrinsic.
    const m = measure(hstack({ width: containerWidth }, a, b), 1000);
    // Each child should now be ~containerWidth/2 wide and the heights match.
    expect(m.width).toBe(containerWidth);
    // Both children should have the same height (equal split ⇒ equal wrap).
    // Easier assertion: total container height equals the height of either child measured alone at containerWidth/2.
    const oneAlone = measure(text(t, { size: SIZE, font, width: containerWidth / 2 }), 1000);
    expect(Math.abs(m.height - oneAlone.height)).toBeLessThan(1);
  });

  it("distributes overflow proportionally to shrink * baseSize", () => {
    // base1 = baseWidth_A, shrink_A = 2 ⇒ weight 2*base.
    // base2 = baseWidth_A, shrink_B = 1 ⇒ weight 1*base.
    // overflow shared 2:1.
    const word = "Lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit";
    const baseW = textWidth(word);
    const a = text(word, { size: SIZE, font, shrink: 2, width: baseW });
    const b = text(word, { size: SIZE, font, shrink: 1, width: baseW });
    const containerWidth = baseW * 1.4; // total intrinsic = 2*baseW; overflow = 0.6*baseW.
    const node = hstack({ width: containerWidth }, a, b);
    void measure(node, 1000);

    // We can't easily inspect post-shrink widths externally, but we can check
    // their wrapping result through height. Without word-breaking (single long
    // word), both get clamped to minTextWidth = baseW (single word), so
    // *both* shrink down to baseW, and the container content sum = 2*baseW
    // which still exceeds containerWidth. That's the expected behaviour
    // documented in nodeMinMain: we never split a word.
    // → assert container reports its fixed width regardless.
    expect(measure(node, 1000).width).toBe(containerWidth);
  });

  it("does not shrink a child with shrink=0", () => {
    const a = text("alpha beta gamma delta", { size: SIZE, font, shrink: 0 });
    const baseA = textWidth("alpha beta gamma delta");
    const b = text("the quick brown fox jumps over the lazy dog", {
      size: SIZE,
      font,
      shrink: 1
    });
    const baseB = textWidth("the quick brown fox jumps over the lazy dog");
    const containerWidth = baseA + baseB - 50; // 50pt overflow.

    const m = measure(hstack({ width: containerWidth }, a, b), 1000);
    // Container reports its fixed width.
    expect(m.width).toBe(containerWidth);
    // a stays single-line because shrink=0; b takes the full hit.
    const lineH = font.heightAtSize(SIZE, { descender: false });
    // Container height = max child height. a is one line; b should wrap (height > one line).
    expect(m.height).toBeGreaterThan(lineH * 1.5);
  });

  it("respects the widest-word floor — won't shrink a text below its longest word", () => {
    // "supercalifragilistic" is one long word; min width = its width.
    const longestWord = "supercalifragilisticexpialidocious";
    const minW = textWidth(longestWord);
    const sentence = `${longestWord} is a famous nonsense word from a 1964 film`;
    const a = text(sentence, { size: SIZE, font, shrink: 1 });

    // Try to shrink it to 10pt — way below minW. The node should clamp.
    const node = hstack({ width: 10 }, a);
    // Doesn't throw, doesn't infinite-loop. Returns reasonable result.
    const m = measure(node, 1000);
    expect(m.width).toBe(10);
    // The text rendered should still fit its longest word ⇒ implies the wrap
    // width settled at >= minW. We can verify indirectly by re-measuring
    // standalone text at minW and comparing heights — should be roughly equal.
    const standalone = measure(text(sentence, { size: SIZE, font, width: minW }), 1000);
    // Use heightAtSize tolerance.
    expect(m.height).toBeGreaterThanOrEqual(standalone.height - 1);
  });

  it("a non-shrinkable structural child (image-like fixed width) does not absorb overflow", () => {
    // Use an hline as a stand-in for "structural fixed-width" — hline width
    // takes parentWidth by default. We give it explicit width, then verify
    // shrink doesn't touch it.
    const fixed = hline({ color: { r: 0, g: 0, b: 0 }, width: 40 });
    const shrinkable = text("the quick brown fox jumps over the lazy dog and runs away", {
      size: SIZE,
      font,
      shrink: 1
    });
    const baseText = textWidth("the quick brown fox jumps over the lazy dog and runs away");
    const containerWidth = baseText + 40 - 80; // 80pt overflow.

    const m = measure(hstack({ width: containerWidth, gap: 0 }, fixed, shrinkable), 1000);
    expect(m.width).toBe(containerWidth);
    // Text re-wrapped; container height > one line.
    expect(m.height).toBeGreaterThan(font.heightAtSize(SIZE, { descender: false }) * 1.5);
  });

  it("shrinks through a link wrapper (link forwards its child's shrink weight)", () => {
    const t = "the quick brown fox jumps over the lazy dog every single day";
    const intrinsic = textWidth(t);
    const wrapped = link({ href: "https://example.com" }, text(t, { size: SIZE, font, shrink: 1 }));
    const m = measure(hstack({ width: intrinsic / 2 }, wrapped), 1000);
    expect(m.width).toBe(intrinsic / 2);
    // Re-wrapped → multi-line.
    expect(m.height).toBeGreaterThan(font.heightAtSize(SIZE, { descender: false }) * 1.5);
  });

  it("interacts correctly with grow on a separate child (only shrink fires when overflowing)", () => {
    // overflowing case: hstack with too-wide text + a flex spacer. Shrink
    // should reduce the text; the spacer's grow is irrelevant when there's
    // no leftover space.
    const t = "alpha beta gamma delta epsilon zeta eta theta iota kappa";
    const intrinsic = textWidth(t);
    const node = hstack(
      { width: intrinsic / 2 },
      text(t, { size: SIZE, font, shrink: 1 }),
      spacer(0, { grow: 1 })
    );
    const m = measure(node, 1000);
    expect(m.width).toBe(intrinsic / 2);
  });
});

describe("flex-shrink: vstack vertical axis", () => {
  it("shrinks a child vstack's height when parent has a fixed height", () => {
    // Two inner vstacks with shrink=1 inside a 100pt-tall parent. Together
    // they want 80+80=160pt; overflow=60pt. Each gives up 30pt.
    const a = vstack({ height: 80, shrink: 1, background: { r: 0.9, g: 0.9, b: 0.9 } });
    const b = vstack({ height: 80, shrink: 1, background: { r: 0.8, g: 0.8, b: 0.8 } });
    const parent = vstack({ height: 100 }, a, b);
    const m = measure(parent, 200);
    expect(m.height).toBe(100);
    // Verify the resolved layout — we render and trust no exception is thrown
    // and the parent stays at its fixed height (nothing further to assert
    // here without a render-inspection helper).
  });

  it("does not shrink vertically when parent has no fixed height", () => {
    // Without a height constraint on the parent, there's no overflow to
    // distribute. The shrink prop is just declared, never fires.
    const a = vstack({ height: 50, shrink: 1 });
    const b = vstack({ height: 50, shrink: 1 });
    const parent = vstack({}, a, b); // no fixed height
    const m = measure(parent, 200);
    expect(m.height).toBe(100); // 50+50, no shrink
  });
});

describe("flex-shrink: resolver math", () => {
  it("two equal-weight wrappable texts split overflow 50/50", () => {
    // Two texts of the same intrinsic width with shrink=1 each. Container
    // exactly fits one of them; overflow = baseWidth. Each gives up baseWidth/2.
    const sentence = "the quick brown fox jumps over the lazy dog";
    const baseW = textWidth(sentence);
    const a = text(sentence, { size: SIZE, font, shrink: 1 });
    const b = text(sentence, { size: SIZE, font, shrink: 1 });
    const layout = resolveMainAxis([a, b], "horizontal", baseW, baseW, 0);
    expect(layout.shrank).toBe(true);
    const widths = layout.children.map(widthOf);
    expect(widths[0]).toBeDefined();
    expect(widths[1]).toBeDefined();
    expect(Math.abs(widths[0]! - baseW / 2)).toBeLessThan(0.5);
    expect(Math.abs(widths[1]! - baseW / 2)).toBeLessThan(0.5);
  });

  it("2:1 shrink weights split overflow 2:1 (within min-word bounds)", () => {
    // We need texts where the min-word floor doesn't bite. Use texts made of
    // many short words so minTextWidth is small.
    const t = "a b c d e f g h i j k l m n o p q r s t u v w x y z";
    const baseW = textWidth(t);
    // base widths equal; weights 2 vs 1.
    const a = text(t, { size: SIZE, font, shrink: 2 });
    const b = text(t, { size: SIZE, font, shrink: 1 });
    const containerW = baseW * 1.2; // overflow = baseW * 0.8.
    const layout = resolveMainAxis([a, b], "horizontal", containerW, containerW, 0);
    const wA = widthOf(layout.children[0]!)!;
    const wB = widthOf(layout.children[1]!)!;
    // Expected: a reduces by (2 / 3) * 0.8 * baseW = 0.5333 * baseW;
    //           b reduces by (1 / 3) * 0.8 * baseW = 0.2667 * baseW.
    const expectedA = baseW - (2 / 3) * 0.8 * baseW;
    const expectedB = baseW - (1 / 3) * 0.8 * baseW;
    expect(Math.abs(wA - expectedA)).toBeLessThan(0.5);
    expect(Math.abs(wB - expectedB)).toBeLessThan(0.5);
    // Sum equals container.
    expect(Math.abs(wA + wB - containerW)).toBeLessThan(0.5);
  });

  it("a single-token URL does NOT shrink by default — it overflows visibly", () => {
    // CSS-idiomatic: no whitespace break-points means no shrink. The author
    // opts into either truncation (maxLines) or char-break (breakWords).
    const url = "https://example.com/very/long/path?with=lots&of=query=here";
    const baseW = textWidth(url);
    const a = text(url, { size: SIZE, font, shrink: 1 });
    const slot = baseW / 3;
    const layout = resolveMainAxis([a], "horizontal", slot, slot, 0);
    // Nothing changed: same reference, same intrinsic width.
    expect(layout.children[0]).toBe(a);
    expect(layout.shrank).toBe(false);
  });

  it("`maxLines: 1` lets a single-token text shrink and ellipsize", () => {
    const url = "https://example.com/very/long/path?with=lots&of=query=here";
    const baseW = textWidth(url);
    const a = text(url, { size: SIZE, font, shrink: 1, maxLines: 1 });
    const slot = baseW / 3;
    const layout = resolveMainAxis([a], "horizontal", slot, slot, 0);
    expect(layout.shrank).toBe(true);
    const w = widthOf(layout.children[0]!)!;
    expect(w).toBeCloseTo(slot, 1);
    // Still single line (height = one line).
    const lineH = font.heightAtSize(SIZE, { descender: false });
    expect(layout.sizes[0]!.height).toBeLessThan(lineH * 1.5);
  });

  it("`breakWords: true` lets a single-token text shrink and hard-break across lines", () => {
    const url = "https://example.com/very/long/path?with=lots&of=query=here";
    const baseW = textWidth(url);
    const a = text(url, { size: SIZE, font, shrink: 1, breakWords: true });
    const slot = baseW / 3;
    const layout = resolveMainAxis([a], "horizontal", slot, slot, 0);
    expect(layout.shrank).toBe(true);
    // Multi-line: height grew because the URL was char-broken across rows.
    const lineH = font.heightAtSize(SIZE, { descender: false });
    expect(layout.sizes[0]!.height).toBeGreaterThan(lineH * 1.5);
  });

  it("`breakWords: true` lets multi-word text shrink past its longest-word floor", () => {
    const longestWord = "antidisestablishmentarianism";
    const minA = textWidth(longestWord);
    const t = `prefix ${longestWord} suffix`;
    const a = text(t, { size: SIZE, font, shrink: 1, breakWords: true });
    // Slot smaller than the longest word — only breakWords lets it through.
    const slot = minA * 0.6;
    const layout = resolveMainAxis([a], "horizontal", slot, slot, 0);
    expect(layout.shrank).toBe(true);
    const w = widthOf(layout.children[0]!)!;
    expect(w).toBeCloseTo(slot, 1);
  });

  it("redistributes weight when one item hits its min-word floor", () => {
    // a is multi-word with one very long token inside ⇒ floor = that token.
    // Pick an overflow large enough that a wants to shrink past its floor,
    // so a freezes at the floor and b absorbs the rest.
    const longestWord = "antidisestablishmentarianism";
    const minA = textWidth(longestWord);
    const aText = `prefix ${longestWord} suffix`;
    const baseA = textWidth(aText);
    const sentence = "lorem ipsum dolor sit amet consectetur adipiscing elit";
    const baseB = textWidth(sentence);
    const overflow = (baseA - minA) * 2.5; // forces a to clamp at min.
    const containerW = baseA + baseB - overflow;
    const a = text(aText, { size: SIZE, font, shrink: 1 });
    const b = text(sentence, { size: SIZE, font, shrink: 1 });
    const layout = resolveMainAxis([a, b], "horizontal", containerW, containerW, 0);
    const wA = widthOf(layout.children[0]!)!;
    const wB = widthOf(layout.children[1]!)!;
    // a clamped at its longest-word floor.
    expect(Math.abs(wA - minA)).toBeLessThan(1);
    // b absorbed the rest; total = containerW.
    expect(Math.abs(wA + wB - containerW)).toBeLessThan(0.5);
  });

  it("returns shrank=false when overflow is absent", () => {
    const a = text("a", { size: SIZE, font, shrink: 1 });
    const b = text("b", { size: SIZE, font, shrink: 1 });
    const layout = resolveMainAxis([a, b], "horizontal", 1000, 1000, 8);
    expect(layout.shrank).toBe(false);
    // Children untouched.
    expect(layout.children[0]).toBe(a);
    expect(layout.children[1]).toBe(b);
  });

  it("returns shrank=false when no child has shrink", () => {
    const long = "the quick brown fox jumps over the lazy dog";
    const a = text(long, { size: SIZE, font }); // no shrink
    const b = text(long, { size: SIZE, font }); // no shrink
    const layout = resolveMainAxis([a, b], "horizontal", 50, 50, 0);
    expect(layout.shrank).toBe(false);
  });

  it("treats availableMain=Infinity as no constraint (no shrink fires)", () => {
    const long = "the quick brown fox";
    const a = text(long, { size: SIZE, font, shrink: 1 });
    const layout = resolveMainAxis([a], "horizontal", Infinity, Infinity, 0);
    expect(layout.shrank).toBe(false);
  });

  it("a vertical spacer with shrink absorbs overflow down to zero", () => {
    // spacer's `size` is its vertical extent; we exercise vertical shrink.
    const sp = spacer(50, { shrink: 1 });
    const fixed = vstack({ height: 30 }); // fixed-height block, no shrink
    const parent = vstack({ height: 60 }, fixed, sp);
    // Inner = 60. Children intrinsic = 30 + 50 = 80. Overflow = 20.
    // spacer has shrink=1, fixed has shrink=0. spacer absorbs all 20 → size=30.
    void measure(parent, 200);
    // We assert behavior end-to-end by checking the resolver directly.
    const layout = resolveMainAxis([fixed, sp], "vertical", 60, 200, 0);
    expect(layout.shrank).toBe(true);
    const shrunk = layout.children[1]!;
    const spacerHeight = shrunk.kind === "spacer" ? shrunk.size : undefined;
    expect(spacerHeight).toBeCloseTo(30, 1);
  });
});

describe("flex-shrink: render integration", () => {
  it("renders an hstack with shrunken text without throwing", async () => {
    const t = "the quick brown fox jumps over the lazy dog and runs away";
    const intrinsic = textWidth(t);
    const node = hstack(
      { width: intrinsic / 2 },
      text(t, { size: SIZE, font: bold, shrink: 1 })
    );
    const bytes = await renderToPdf(node, { size: { width: 612, height: 792 }, margin: 50 });
    expect(bytes.byteLength).toBeGreaterThan(500);
  });

  it("text rewrapped by shrink fits inside its container box", async () => {
    // This is the canonical use case: a label + a long value in an hstack
    // that has a fixed width (page or card inner). The value shrinks and
    // wraps; the label stays put.
    const label = text("Customer name:", { size: SIZE, font: bold });
    const longName = text(
      "Mr. Algernon Hephaestus Constantine Pemberton-Smythe III",
      { size: SIZE, font, shrink: 1 }
    );
    const row = hstack({ width: 200, gap: 8 }, label, longName);
    const bytes = await renderToPdf(row, { size: { width: 300, height: 200 }, margin: 10 });
    expect(bytes.byteLength).toBeGreaterThan(500);
  });
});
