import { httpSource, openPdf } from "../../../streaming-pdf-reader/dist/index.js";
import { pageToHtml } from "../../../streaming-pdf-reader/packages/html-writer/dist/index.js";

const fixtures = [
  ["Rich content", "../gallery/pdf/rich-content.pdf"],
  ["Invoice", "../gallery/pdf/tailwind-invoice.pdf"],
  ["Utilities", "../gallery/pdf/tailwind-utilities.pdf"],
  ["Clipping", "../gallery/pdf/overflow-clipping.pdf"],
  ["Receipt", "../gallery/pdf/receipt-inter.pdf"],
] as const;
const fixtureBase = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "https://boxpdf.dev/reader/"
  : location.href;

const choices = document.querySelector<HTMLElement>("#fixture-choices")!;
const nativeFrame = document.querySelector<HTMLIFrameElement>("#native-frame")!;
const htmlFrame = document.querySelector<HTMLIFrameElement>("#html-frame")!;
const status = document.querySelector<HTMLElement>("#demo-status")!;
const metrics = {
  open: document.querySelector<HTMLElement>("#metric-open")!,
  render: document.querySelector<HTMLElement>("#metric-render")!,
  bytes: document.querySelector<HTMLElement>("#metric-bytes")!,
  requests: document.querySelector<HTMLElement>("#metric-requests")!,
  resident: document.querySelector<HTMLElement>("#metric-resident")!,
};

let run = 0;

htmlFrame.addEventListener("load", fitHtmlPage);
new ResizeObserver(fitHtmlPage).observe(htmlFrame);

for (const [label, url] of fixtures) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.url = url;
  button.addEventListener("click", () => void loadFixture(button, url));
  choices.append(button);
}

async function loadFixture(button: HTMLButtonElement, relativeUrl: string): Promise<void> {
  const currentRun = ++run;
  for (const choice of choices.querySelectorAll("button")) choice.classList.toggle("active", choice === button);
  const url = new URL(relativeUrl, fixtureBase).href;
  const nativeUrl = new URL(url);
  nativeUrl.searchParams.set("renderer", "native");
  const readerUrl = new URL(url);
  readerUrl.searchParams.set("renderer", "boxpdf");
  nativeFrame.src = `${nativeUrl.href}#toolbar=0&view=FitH`;
  htmlFrame.srcdoc = loadingDocument();
  status.textContent = "Opening with HTTP byte ranges…";
  status.className = "demo-status loading";
  resetMetrics();

  let requests = 0;
  let transferred = 0;
  const measuredFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    requests += 1;
    const clone = response.clone();
    const bytes = await clone.arrayBuffer();
    transferred += bytes.byteLength;
    return response;
  };

  let pdf: Awaited<ReturnType<typeof openPdf>> | undefined;
  try {
    const started = performance.now();
    const source = await httpSource(readerUrl, { fetch: measuredFetch });
    pdf = await openPdf(source, { maxBytes: 2 * 1024 * 1024, maxObjectCacheBytes: 2 * 1024 * 1024 });
    const opened = performance.now();
    const pageCount = await pdf.getPageCount();
    const page = await pdf.getPage(0);
    const html = await pageToHtml(page, { profile: "visual" });
    const finished = performance.now();
    if (currentRun !== run) return;

    htmlFrame.srcdoc = renderedDocument(html);
    metrics.open.textContent = milliseconds(opened - started);
    metrics.render.textContent = milliseconds(finished - opened);
    metrics.bytes.textContent = formatBytes(transferred);
    metrics.requests.textContent = String(requests);
    metrics.resident.textContent = formatBytes(pdf.stats.peakResidentBytes + pdf.stats.peakObjectCacheBytes);
    status.textContent = `Page 1 of ${pageCount} · measured in this browser`;
    status.className = "demo-status ready";
  } catch (error) {
    if (currentRun !== run) return;
    status.textContent = error instanceof Error ? error.message : String(error);
    status.className = "demo-status error";
    htmlFrame.srcdoc = errorDocument(status.textContent);
  } finally {
    pdf?.close();
  }
}

function resetMetrics(): void {
  for (const value of Object.values(metrics)) value.textContent = "—";
}

function milliseconds(value: number): string {
  return `${value.toFixed(value < 10 ? 1 : 0)} ms`;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}

function renderedDocument(page: string): string {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${frameStyles()}</style><main><div id="page-stage">${page}</div></main>`;
}

function loadingDocument(): string {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#64748b;font:14px system-ui}</style><p>Reconstructing visual HTML…</p>`;
}

function errorDocument(message: string): string {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#b42318;font:14px system-ui}</style><p>${escapeHtml(message)}</p>`;
}

function frameStyles(): string {
  return `html,body{margin:0;min-height:100%;background:#dfe5eb}main{display:flex;justify-content:center;padding:8px;box-sizing:border-box}#page-stage{flex:none}.pdf-page{margin:0!important;box-shadow:0 4px 14px #0f172a24;transform-origin:top left}`;
}

function fitHtmlPage(): void {
  const document = htmlFrame.contentDocument;
  const page = document?.querySelector<HTMLElement>(".pdf-page");
  const stage = document?.querySelector<HTMLElement>("#page-stage");
  if (!document || !page || !stage) return;

  page.style.transform = "none";
  const width = page.offsetWidth;
  const height = page.offsetHeight;
  const availableWidth = Math.max(1, document.documentElement.clientWidth - 16);
  const scale = Math.min(1, availableWidth / width);
  page.style.transform = `scale(${scale})`;
  stage.style.width = `${width * scale}px`;
  stage.style.height = `${height * scale}px`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

void (async () => {
  const first = choices.querySelector<HTMLButtonElement>("button")!;
  await loadFixture(first, first.dataset.url!);
})();
