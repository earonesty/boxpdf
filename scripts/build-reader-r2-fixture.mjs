import { open } from "node:fs/promises";

const output = process.argv[2];
if (!output) throw new Error("usage: node scripts/build-reader-r2-fixture.mjs OUTPUT.pdf");

const pageCount = 1_000;
const groupSize = 100;
const groupCount = Math.ceil(pageCount / groupSize);
const firstGroup = 3;
const firstPage = firstGroup + groupCount;
const firstContent = firstPage + pageCount;
const payloadObject = firstContent + pageCount;
const payloadBytes = 100 * 1024 * 1024;
const objects = new Map();

objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
objects.set(
  2,
  `<< /Type /Pages /Count ${pageCount} /Kids [${Array.from({ length: groupCount }, (_, index) => `${firstGroup + index} 0 R`).join(" ")}] /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>`,
);

for (let group = 0; group < groupCount; group += 1) {
  const start = group * groupSize;
  const count = Math.min(groupSize, pageCount - start);
  const kids = Array.from({ length: count }, (_, index) => `${firstPage + start + index} 0 R`);
  objects.set(
    firstGroup + group,
    `<< /Type /Pages /Parent 2 0 R /Count ${count} /Kids [${kids.join(" ")}] >>`,
  );
}

for (let page = 0; page < pageCount; page += 1) {
  const parent = firstGroup + Math.floor(page / groupSize);
  objects.set(
    firstPage + page,
    `<< /Type /Page /Parent ${parent} 0 R /Contents ${firstContent + page} 0 R >>`,
  );
  const content = `BT /F1 24 Tf 54 700 Td (boxpdf streaming fixture) Tj 0 -42 Td /F1 16 Tf (Page ${page + 1} of 1,000) Tj ET`;
  objects.set(
    firstContent + page,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  );
}

const file = await open(output, "w");
const offsets = [0];
let position = 0;
const write = async (value) => {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  await file.write(bytes, 0, bytes.byteLength, position);
  position += bytes.byteLength;
};

try {
  await write("%PDF-1.7\n%boxpdf\n");
  for (let object = 1; object < payloadObject; object += 1) {
    offsets[object] = position;
    await write(`${object} 0 obj\n${objects.get(object)}\nendobj\n`);
  }

  offsets[payloadObject] = position;
  await write(`${payloadObject} 0 obj\n<< /Length ${payloadBytes} >>\nstream\n`);
  const zeros = new Uint8Array(1024 * 1024);
  for (let written = 0; written < payloadBytes; written += zeros.byteLength) await write(zeros);
  await write("\nendstream\nendobj\n");

  const xrefOffset = position;
  await write(`xref\n0 ${payloadObject + 1}\n0000000000 65535 f \n`);
  for (let object = 1; object <= payloadObject; object += 1) {
    await write(`${String(offsets[object]).padStart(10, "0")} 00000 n \n`);
  }
  await write(
    `trailer\n<< /Size ${payloadObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );
} finally {
  await file.close();
}

console.log(`wrote ${output}: ${pageCount} pages, ${position} bytes`);
