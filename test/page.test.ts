import { describe, expect, it, beforeAll, vi, afterEach } from "vitest";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import {
  PageSizes,
  pageInner,
  pageContent,
  renderFlow,
  renderToPdf,
  text,
  vstack
} from "../src/index.js";

let font: PDFFont;

beforeAll(async () => {
  const pdf = await PDFDocument.create();
  font = await pdf.embedFont(StandardFonts.Helvetica);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("page helpers", () => {
  it("pageInner subtracts a scalar margin from both sides", () => {
    expect(pageInner(PageSizes.Letter, 36)).toBe(540);
    expect(pageInner(PageSizes.A4, 36)).toBe(523);
  });

  it("pageInner accepts a per-side margin", () => {
    expect(pageInner(PageSizes.Letter, { left: 50, right: 50 })).toBe(512);
    expect(pageInner(PageSizes.Letter, { left: 50 })).toBe(562);
  });

  it("pageContent returns both dimensions net of margin", () => {
    const c = pageContent(PageSizes.Letter, 36);
    expect(c).toEqual({ width: 540, height: 720 });
  });

  it("pageInner with no margin equals raw width", () => {
    expect(pageInner(PageSizes.Letter)).toBe(612);
  });
});

describe("renderFlow default page size", () => {
  it("defaults to LETTER (612×792) — matches pdf-lib", async () => {
    const pdf = await PDFDocument.create();
    const node = vstack({}, text("hi", { size: 12, font }));
    const { pages } = await renderFlow(pdf, [node]);
    const page = pages[0]!;
    expect(page.getWidth()).toBe(612);
    expect(page.getHeight()).toBe(792);
  });

  it("renderToPdf defaults to LETTER as well", async () => {
    const bytes = await renderToPdf(text("hi", { size: 12, font }));
    const reloaded = await PDFDocument.load(bytes);
    const page = reloaded.getPage(0);
    expect(page.getWidth()).toBe(612);
    expect(page.getHeight()).toBe(792);
  });
});

describe("renderFlow overflow warning", () => {
  it("warns when a top-level child exceeds the page content width", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await PDFDocument.create();
    // Letter default = 612; margins 36 ⇒ inner = 540. Force 600pt width.
    const tooWide = vstack({ width: 600 }, text("x", { size: 12, font }));
    await renderFlow(pdf, [tooWide], { margin: 36 });
    expect(warn).toHaveBeenCalledOnce();
    const msg = warn.mock.calls[0]![0] as string;
    expect(msg).toContain("exceeds page content area");
    expect(msg).toContain("Letter");
  });

  it("warning includes a hint to switch to A4 when on Letter", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await PDFDocument.create();
    const tooWide = vstack({ width: 600 }, text("x", { size: 12, font }));
    await renderFlow(pdf, [tooWide], { size: PageSizes.Letter, margin: 36 });
    expect(warn.mock.calls[0]![0]).toContain("A4");
  });

  it("warning suggests Letter when on A4 and content is sized for Letter", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await PDFDocument.create();
    const tooWide = vstack({ width: 540 }, text("x", { size: 12, font })); // Letter-inner
    await renderFlow(pdf, [tooWide], { size: PageSizes.A4, margin: 36 });
    const msg = warn.mock.calls[0]![0] as string;
    expect(msg).toContain("A4");
    expect(msg).toContain("Letter");
  });

  it("does NOT warn when content fits the page", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await PDFDocument.create();
    const fits = vstack({ width: 500 }, text("x", { size: 12, font }));
    await renderFlow(pdf, [fits], { margin: 36 });
    expect(warn).not.toHaveBeenCalled();
  });

  it("warnings: false silences the overflow check", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await PDFDocument.create();
    const tooWide = vstack({ width: 600 }, text("x", { size: 12, font }));
    await renderFlow(pdf, [tooWide], { margin: 36, warnings: false });
    expect(warn).not.toHaveBeenCalled();
  });

  it("warning also fires from renderToPdf", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tooWide = vstack({ width: 700 }, text("x", { size: 12, font }));
    await renderToPdf(tooWide, { margin: 36 });
    expect(warn).toHaveBeenCalledOnce();
  });
});
