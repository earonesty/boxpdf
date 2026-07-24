#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import {
  PDFDocument,
  StandardFonts,
  flowToPdf,
  nodeAdapter,
  renderFlow,
  renderToPdf,
  savePdf,
  streamFlow,
  text
} from "../dist/index.js";

const run = promisify(execFile);
const qpdf = process.env.QPDF || "qpdf";
const pdftotext = process.env.PDFTOTEXT || "pdftotext";
const directory = await mkdtemp(join(tmpdir(), "boxpdf-encryption-"));

async function standardNode(marker) {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  return { pdf, font, node: text(marker, { font, size: 12 }) };
}

async function generateFixtures() {
  const fixtures = [];
  fixtures.push([
    "flow-object-streams.pdf",
    "flow marker 90241",
    await flowToPdf(
      async (pdf) => {
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        return [text("flow marker 90241", { font, size: 12 })];
      },
      {
        encryption: {
          password: "test-user",
          permissions: { copying: false }
        }
      }
    )
  ]);

  const rendered = await standardNode("render marker 90242");
  fixtures.push([
    "render.pdf",
    "render marker 90242",
    await renderToPdf(rendered.node, {
      encryption: {
        password: "test-user",
        ownerPassword: "test-owner"
      }
    })
  ]);

  const classic = await standardNode("classic marker 90243");
  await renderFlow(classic.pdf, [classic.node]);
  fixtures.push([
    "save-classic.pdf",
    "classic marker 90243",
    await savePdf(classic.pdf, {
      useObjectStreams: false,
      encryption: {
        password: "test-user",
        ownerPassword: "test-owner",
        encryptMetadata: false
      }
    })
  ]);

  const streamed = await standardNode("stream marker 90244");
  const streamPath = join(directory, "stream.pdf");
  await streamFlow(
    streamed.pdf,
    nodeAdapter(createWriteStream(streamPath)),
    [streamed.node],
    {
      encryption: {
        password: "test-user",
        ownerPassword: "test-owner"
      }
    }
  );
  fixtures.push(["stream.pdf", "stream marker 90244", await readFile(streamPath)]);

  for (const [name, , bytes] of fixtures) {
    await writeFile(join(directory, name), bytes);
  }
  return fixtures;
}

async function verify(name, marker) {
  const path = join(directory, name);
  const { stdout: check } = await run(qpdf, [
    "--check",
    "--password=test-user",
    path
  ]);
  if (!check.includes("R = 6") || !check.includes("AESv3")) {
    throw new Error(`${name}: QPDF did not report R6 AESv3 encryption`);
  }
  try {
    await run(qpdf, ["--check", "--password=wrong-password", path]);
    throw new Error(`${name}: QPDF accepted the wrong password`);
  } catch (error) {
    if (error.message.includes("accepted the wrong password")) throw error;
  }
  const { stdout: extracted } = await run(pdftotext, [
    "-upw",
    "test-user",
    path,
    "-"
  ]);
  if (!extracted.includes(marker)) {
    throw new Error(`${name}: Poppler did not recover the expected marker`);
  }
  process.stdout.write(`verified ${name}\n`);
}

try {
  const fixtures = await generateFixtures();
  for (const [name, marker] of fixtures) await verify(name, marker);
} finally {
  await rm(directory, { recursive: true, force: true });
}

