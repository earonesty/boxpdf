import { httpSource, openPdf } from "../../../streaming-pdf-reader/dist/index.js";
import { writeHtmlDocument } from "../../../streaming-pdf-reader/packages/html-writer/dist/index.js";

const fixtures = [
  ["Invoice", "https://docs.boxpdf.dev/reader/invoice.pdf"],
  ["Research paper", "https://docs.boxpdf.dev/reader/research-paper.pdf"],
  ["Receipt", "https://docs.boxpdf.dev/reader/receipt.pdf"],
  ["Rich content", "https://docs.boxpdf.dev/reader/rich-content.pdf"],
] as const;

const choices = document.querySelector<HTMLElement>("#semantic-fixture-choices")!;
const nativeFrame = document.querySelector<HTMLIFrameElement>("#semantic-native-frame")!;
const htmlFrame = document.querySelector<HTMLIFrameElement>("#semantic-html-frame")!;
const status = document.querySelector<HTMLElement>("#semantic-demo-status")!;
const metrics = {
  open: document.querySelector<HTMLElement>("#semantic-metric-open")!,
  render: document.querySelector<HTMLElement>("#semantic-metric-render")!,
  pages: document.querySelector<HTMLElement>("#semantic-metric-pages")!,
  resident: document.querySelector<HTMLElement>("#semantic-metric-resident")!,
};

let run = 0;

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
  for (const choice of choices.querySelectorAll("button"))
    choice.classList.toggle("active", choice === button);
  const url = new URL(relativeUrl).href;
  nativeFrame.src = `${url}#toolbar=0&view=FitH`;
  htmlFrame.srcdoc = loadingDocument();
  status.textContent = "Recovering document flow…";
  status.className = "demo-status loading";
  for (const value of Object.values(metrics)) value.textContent = "—";

  let pdf: Awaited<ReturnType<typeof openPdf>> | undefined;
  try {
    const started = performance.now();
    pdf = await openPdf(await httpSource(url), {
      chunkSize: 1024 * 1024,
      maxBytes: 32 * 1024 * 1024,
      maxObjectCacheBytes: 16 * 1024 * 1024,
      maxObjectBytes: 4 * 1024 * 1024,
      maxXrefBytes: 1024 * 1024,
    });
    const opened = performance.now();
    let html = "";
    let pages = 0;
    await writeHtmlDocument(
      pdf.pages(),
      (chunk) => {
        html += chunk;
      },
      {
        profile: "semantic",
        includeDocument: false,
        semanticLookaheadPages: 4,
        onSemanticStats: (stats) => {
          pages = stats.pagesProcessed;
        },
      },
    );
    const finished = performance.now();
    if (currentRun !== run) return;

    htmlFrame.srcdoc = semanticDocument(html);
    metrics.open.textContent = milliseconds(opened - started);
    metrics.render.textContent = milliseconds(finished - opened);
    metrics.pages.textContent = String(pages);
    metrics.resident.textContent = formatBytes(
      pdf.stats.peakResidentBytes + pdf.stats.peakObjectCacheBytes,
    );
    status.textContent = `${pages} page${pages === 1 ? "" : "s"} · streamed with four-page lookahead`;
    status.className = "demo-status ready";
  } catch (error) {
    if (currentRun !== run) return;
    const message = error instanceof Error ? error.message : String(error);
    status.textContent = message;
    status.className = "demo-status error";
    htmlFrame.srcdoc = errorDocument(message);
  } finally {
    pdf?.close();
  }
}

function semanticDocument(html: string): string {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${frameStyles()}</style>${html}`;
}

function loadingDocument(): string {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#64748b}</style><p>Building semantic HTML…</p>`;
}

function errorDocument(message: string): string {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#b42318}</style><p>${escapeHtml(message)}</p>`;
}

function frameStyles(): string {
  return `html{background:#f8fafc}body{margin:0;padding:28px;color:#172033;background:#fff;font:15px/1.58 system-ui,sans-serif}.pdf-document{max-width:760px}.pdf-semantic-document>section{margin-bottom:24px}.pdf-semantic-document h1{font-size:30px}.pdf-semantic-document h2{margin-top:24px;font-size:22px}.pdf-semantic-document h3{font-size:16px}.pdf-semantic-document table{width:100%;margin:18px 0;border-collapse:collapse}.pdf-semantic-document th,.pdf-semantic-document td{padding:8px;border-bottom:1px solid #dbe3ec;text-align:left}.pdf-semantic-document dl>div{display:grid;grid-template-columns:1fr auto;gap:16px;padding:6px 0;border-bottom:1px solid #e5eaf0}.pdf-semantic-document dd{margin:0;font-weight:650}.pdf-semantic-cards,.pdf-semantic-sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:18px 0}.pdf-semantic-cards article,.pdf-semantic-sections section{padding:14px;border:1px solid #dbe3ec;border-radius:8px;background:#f8fafc}.pdf-semantic-cards h3,.pdf-semantic-sections h3{margin:0 0 8px}.pdf-semantic-cards p,.pdf-semantic-sections p{margin:3px 0}`;
}

function milliseconds(value: number): string {
  return `${value.toFixed(value < 10 ? 1 : 0)} ms`;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}

void (async () => {
  const first = choices.querySelector<HTMLButtonElement>("button")!;
  await loadFixture(first, first.dataset.url!);
})();
