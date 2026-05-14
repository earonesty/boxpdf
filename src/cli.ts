#!/usr/bin/env node

import { createInterface } from "node:readline";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const templates = ["receipt", "boarding-pass", "resume", "order-confirmation", "certificate"] as const;

type TemplateName = (typeof templates)[number];

interface InitOptions {
  force: boolean;
  out?: string;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: unknown;
}

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

const templateDir = fileURLToPath(new URL("../templates/", import.meta.url));
const readmePath = fileURLToPath(new URL("../README.md", import.meta.url));
const protocolVersion = "2025-11-25";

const help = `boxpdf

Usage:
  boxpdf init <template> [--out <file>] [--force]
  boxpdf font add <path>=<key> [<path>=<key>...] --out <file> [--force]
  boxpdf mcp
  boxpdf list
  boxpdf help

Templates:
  ${templates.join("\n  ")}

Examples:
  boxpdf init receipt
  boxpdf init order-confirmation --out src/pdf/order-confirmation.ts
  boxpdf font add ./Acme-Regular.ttf=regular ./Acme-Bold.ttf=bold --out src/fonts/acme.ts
  claude mcp add boxpdf -- npx -y boxpdf mcp
`;

function printHelp(): void {
  console.log(help);
}

function printList(): void {
  for (const template of templates) console.log(template);
}

function fail(message: string): never {
  console.error(`boxpdf: ${message}`);
  process.exit(1);
}

function isTemplateName(value: string): value is TemplateName {
  return (templates as readonly string[]).includes(value);
}

function parseInitArgs(args: string[]): { name: TemplateName; options: InitOptions } {
  const [name, ...rest] = args;
  if (!name) fail("missing template name. Run `boxpdf list` to see available templates.");
  if (!isTemplateName(name)) fail(`unknown template "${name}". Run \`boxpdf list\` to see available templates.`);

  const options: InitOptions = { force: false };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--force" || arg === "-f") {
      options.force = true;
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      const out = rest[i + 1];
      if (!out) fail(`${arg} requires a file path`);
      options.out = out;
      i += 1;
      continue;
    }
    fail(`unknown option "${arg}"`);
  }

  return { name, options };
}

function readTemplate(name: TemplateName): string {
  const path = resolve(templateDir, `${name}.ts`);
  if (!existsSync(path)) fail(`template file is missing: ${path}`);
  return readFileSync(path, "utf8");
}

function prepareTemplate(source: string, name: TemplateName): string {
  return source
    .replaceAll('from "../src/index.js"', 'from "boxpdf"')
    .replaceAll(`new URL("../fixtures/${name}.pdf", import.meta.url)`, `new URL("./${name}.pdf", import.meta.url)`)
    .replaceAll(`wrote fixtures/${name}.pdf`, `wrote ${name}.pdf`);
}

function mcpGuide(): string {
  return `# boxpdf guide for agents

boxpdf is a tiny TypeScript box-layout DSL over pdf-lib for generating PDFs in Node, Cloudflare Workers, Deno, and browsers. Use it when you need app-generated PDFs without headless Chrome, native dependencies, or coordinate-heavy pdf-lib drawing code.

Install:

\`\`\`sh
npm install boxpdf pdf-lib
\`\`\`

Core workflow:

1. Create a pdf-lib PDFDocument.
2. Embed one or more fonts.
3. Pick a theme such as cleanTheme(font, bold).
4. Build plain object nodes with vstack, hstack, text, image, hline, spacer, flex, link, and keepTogether.
5. Render with renderFlow(pdf, nodes, options) for paginated documents or renderToPdf(node, options) for simple one-page output.
6. Save the PDF bytes with pdf.save().

Important APIs:

- vstack(style, ...children): vertical box layout.
- hstack(style, ...children): horizontal box layout.
- text(content, style): text with wrapping when width is set, alignment, maxLines, underline, and strikethrough.
- image(pdfImage, style): embedded PNG/JPEG image node.
- hline(style), vline(style): rules.
- spacer(size), flex(weight): fixed or growing space.
- link({ href }, child): PDF link annotation over a child node.
- keepTogether(style, ...children): paginate a group atomically.
- renderFlow(pdf, nodes, options): paginated rendering with margins, headers, footers, metadata, and debug overlays.
- renderToPdf(node, options): convenience helper that returns Uint8Array.
- measure(node, parentWidth): measure without drawing.
- cleanTheme, stripeTheme, editorialTheme, brutalistTheme: shared tokenized themes.
- formatCurrency, defineStyles, hex, rgb255: helpers.

Use explicit widths for wrapping text and table columns. boxpdf does not implement flex-shrink yet, so oversized children overflow instead of shrinking.

Known limits:

- No flex-shrink yet.
- No CSS or browser layout engine.
- No absolute positioning helper; use render() for precise placement.
- Complex text shaping is limited by pdf-lib/fontkit.
- Output is Uint8Array, not streaming PDF generation.

The template resources exposed by this MCP server are meant to be copied and adapted. They import from "boxpdf" and write their PDF next to the generated source file.`;
}

function resources(): Resource[] {
  return [
    {
      uri: "boxpdf://guide",
      name: "Agent guide",
      description: "Concise usage guide for generating PDFs with boxpdf.",
      mimeType: "text/markdown"
    },
    {
      uri: "boxpdf://readme",
      name: "README",
      description: "Full boxpdf README with API overview, examples, themes, and known limits.",
      mimeType: "text/markdown"
    },
    ...templates.map((name) => ({
      uri: `boxpdf://templates/${name}`,
      name: `${name}.ts`,
      description: `Copy-paste ${name} PDF template source.`,
      mimeType: "text/typescript"
    }))
  ];
}

function readResource(uri: string): { uri: string; mimeType: string; text: string } | undefined {
  if (uri === "boxpdf://guide") {
    return { uri, mimeType: "text/markdown", text: mcpGuide() };
  }
  if (uri === "boxpdf://readme") {
    return { uri, mimeType: "text/markdown", text: readFileSync(readmePath, "utf8") };
  }

  const prefix = "boxpdf://templates/";
  if (uri.startsWith(prefix)) {
    const name = uri.slice(prefix.length);
    if (!isTemplateName(name)) return undefined;
    return { uri, mimeType: "text/typescript", text: prepareTemplate(readTemplate(name), name) };
  }

  return undefined;
}

function send(message: unknown): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id: string | number, value: unknown): void {
  send({ jsonrpc: "2.0", id, result: value });
}

function error(id: string | number | undefined, code: number, message: string, data?: unknown): void {
  send({ jsonrpc: "2.0", id, error: { code, message, ...(data === undefined ? {} : { data }) } });
}

function requestUri(params: unknown): string | undefined {
  if (!params || typeof params !== "object" || !("uri" in params)) return undefined;
  const uri = (params as { uri?: unknown }).uri;
  return typeof uri === "string" ? uri : undefined;
}

function handleMcpMessage(message: JsonRpcRequest): void {
  if (!message.method) return;
  if (message.id === undefined) return;

  switch (message.method) {
    case "initialize":
      result(message.id, {
        protocolVersion,
        capabilities: { resources: {} },
        serverInfo: {
          name: "boxpdf",
          title: "boxpdf",
          version: "1.0.0",
          description: "Docs and templates for the boxpdf TypeScript PDF layout library."
        },
        instructions:
          "Use resources/list and resources/read to load boxpdf documentation and copy-paste templates before generating PDF code."
      });
      return;
    case "ping":
      result(message.id, {});
      return;
    case "resources/list":
      result(message.id, { resources: resources() });
      return;
    case "resources/read": {
      const uri = requestUri(message.params);
      if (!uri) {
        error(message.id, -32602, "Missing resource URI");
        return;
      }
      const resource = readResource(uri);
      if (!resource) {
        error(message.id, -32002, "Resource not found", { uri });
        return;
      }
      result(message.id, { contents: [resource] });
      return;
    }
    case "resources/templates/list":
      result(message.id, { resourceTemplates: [] });
      return;
    case "tools/list":
      result(message.id, { tools: [] });
      return;
    case "prompts/list":
      result(message.id, { prompts: [] });
      return;
    default:
      error(message.id, -32601, `Method not found: ${message.method}`);
  }
}

function startMcpServer(): void {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    try {
      handleMcpMessage(JSON.parse(line) as JsonRpcRequest);
    } catch (err) {
      error(undefined, -32700, "Parse error", err instanceof Error ? err.message : String(err));
    }
  });
}

interface FontAddOptions {
  out?: string;
  force: boolean;
  pairs: Array<{ path: string; key: string }>;
}

function parseFontAddArgs(args: string[]): FontAddOptions {
  const options: FontAddOptions = { force: false, pairs: [] };
  const identRe = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (arg === "--force" || arg === "-f") {
      options.force = true;
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      const out = args[i + 1];
      if (!out) fail(`${arg} requires a file path`);
      options.out = out;
      i += 1;
      continue;
    }
    if (arg.startsWith("--")) fail(`unknown option "${arg}"`);

    const eq = arg.indexOf("=");
    if (eq === -1) {
      fail(
        `font add expects positional pairs in the form <path>=<key> (got "${arg}"). ` +
          'Example: `Acme-Regular.ttf=regular`.'
      );
    }
    const path = arg.slice(0, eq);
    const key = arg.slice(eq + 1);
    if (!path) fail(`empty path in pair "${arg}"`);
    if (!identRe.test(key)) {
      fail(`key "${key}" is not a valid JavaScript identifier (use camelCase like "regular" or "boldItalic")`);
    }
    options.pairs.push({ path, key });
  }

  if (options.pairs.length === 0) fail("font add: at least one <path>=<key> pair is required");
  if (!options.out) fail("font add: --out <file> is required");
  return options;
}

function base64Encode(bytes: Uint8Array): string {
  if (typeof globalThis.Buffer !== "undefined") {
    return globalThis.Buffer.from(bytes).toString("base64");
  }
  // Fallback for non-Node runtimes (unlikely for a CLI, but cheap).
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function chunkBase64(s: string, lineLength = 76): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += lineLength) out.push(s.slice(i, i + lineLength));
  return out;
}

function addFonts(args: string[]): void {
  const options = parseFontAddArgs(args);
  const out = resolve(process.cwd(), options.out!);

  if (existsSync(out) && !options.force) {
    fail(`${out} already exists. Pass --force to overwrite it.`);
  }

  const lines: string[] = [
    "// Auto-generated by `boxpdf font add`. Each export is a base64 string of",
    "// the corresponding TTF/OTF font. Pass directly to `loadFont(pdf, key)`",
    "// from the `boxpdf` package.",
    ""
  ];

  let totalBytes = 0;
  for (const { path, key } of options.pairs) {
    const absolute = resolve(process.cwd(), path);
    if (!existsSync(absolute)) fail(`font file not found: ${absolute}`);
    const bytes = readFileSync(absolute);
    totalBytes += bytes.byteLength;
    const b64 = base64Encode(new Uint8Array(bytes));
    const chunks = chunkBase64(b64);
    lines.push(`/** ${path} — ${(bytes.byteLength / 1024).toFixed(1)} KB */`);
    lines.push(`export const ${key} =`);
    chunks.forEach((chunk, i) => {
      const suffix = i < chunks.length - 1 ? " +" : ";";
      lines.push(`  "${chunk}"${suffix}`);
    });
    lines.push("");
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n"));
  const kb = (totalBytes / 1024).toFixed(1);
  console.log(`wrote ${out} (${options.pairs.length} font${options.pairs.length === 1 ? "" : "s"}, ${kb} KB raw)`);
  console.log("");
  console.log("Use it:");
  console.log("");
  console.log('  import { loadFont } from "boxpdf";');
  const relPath = options.out!.replace(/\.ts$/, ".js");
  const firstKey = options.pairs[0]!.key;
  const moreKeys = options.pairs.slice(1).map((p) => p.key);
  const importList = [firstKey, ...moreKeys].join(", ");
  console.log(`  import { ${importList} } from "./${relPath}";`);
  console.log("");
  console.log(`  const font = await loadFont(pdf, ${firstKey});`);
  if (moreKeys[0]) console.log(`  const ${moreKeys[0]} = await loadFont(pdf, ${moreKeys[0]});`);
}

function initTemplate(args: string[]): void {
  const { name, options } = parseInitArgs(args);
  const out = resolve(process.cwd(), options.out ?? `${name}.ts`);

  if (existsSync(out) && !options.force) {
    fail(`${out} already exists. Pass --force to overwrite it.`);
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, prepareTemplate(readTemplate(name), name));
  console.log(`wrote ${out}`);
}

function main(argv: string[]): void {
  const [command, ...args] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "list" || command === "templates") {
    printList();
    return;
  }

  if (command === "init" || command === "new") {
    initTemplate(args);
    return;
  }

  if (command === "font") {
    const [sub, ...rest] = args;
    if (sub !== "add") {
      fail(`unknown font subcommand "${sub ?? ""}". Try \`boxpdf font add <path>=<key> --out <file>\`.`);
    }
    addFonts(rest);
    return;
  }

  if (command === "mcp") {
    startMcpServer();
    return;
  }

  fail(`unknown command "${command}". Run \`boxpdf help\`.`);
}

main(process.argv.slice(2));
