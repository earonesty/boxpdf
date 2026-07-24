import {
  PDFArray,
  PDFCrossRefSection,
  PDFCrossRefStream,
  PDFDict,
  type PDFDocument,
  PDFHexString,
  PDFInvalidObject,
  PDFName,
  PDFNumber,
  type PDFObject,
  PDFObjectStream,
  PDFRef,
  PDFStream,
  type SaveOptions
} from "pdf-lib";
import { createR6Material } from "./r6.js";
import {
  frameEncryptedObject,
  type EncryptionContext
} from "./serialize.js";
import {
  PdfEncryptionError,
  type PdfEncryptionOptions,
  type RandomSource
} from "./types.js";
import { webCryptoRandomSource } from "./web-crypto.js";

const ascii = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++) bytes[index] = value.charCodeAt(index);
  return bytes;
};

const concat = (parts: Uint8Array[]): Uint8Array => {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};

const header = (): Uint8Array =>
  concat([ascii("%PDF-2.0\n"), new Uint8Array([0x25, 0xff, 0xff, 0xff, 0xff, 0x0a])]);

interface XrefEntry {
  kind: "uncompressed" | "compressed";
  ref: PDFRef;
  offset?: number;
  objectStreamRef?: PDFRef;
  index?: number;
}

function containsSignature(object: PDFObject, seen = new Set<PDFObject>()): boolean {
  if (seen.has(object)) return false;
  seen.add(object);
  if (object instanceof PDFStream) return containsSignature(object.dict, seen);
  if (object instanceof PDFArray) {
    return object.asArray().some((value) => containsSignature(value, seen));
  }
  if (object instanceof PDFDict) {
    const type = object.get(PDFName.of("Type"));
    if (type instanceof PDFName && type.toString() === "/Sig") return true;
    if (object.has(PDFName.of("ByteRange"))) return true;
    return object.values().some((value) =>
      value instanceof PDFRef ? false : containsSignature(value, seen)
    );
  }
  return false;
}

function preflight(pdf: PDFDocument): void {
  const context = pdf.context;
  if (context.trailerInfo.Encrypt !== undefined) {
    throw new PdfEncryptionError(
      "ENCRYPTED_INPUT_UNSUPPORTED",
      "Saving an already-encrypted PDF context is not supported"
    );
  }
  for (const [, object] of context.enumerateIndirectObjects()) {
    if (containsSignature(object)) {
      throw new PdfEncryptionError(
        "SIGNED_PDF_UNSUPPORTED",
        "Saving a signed PDF with encryption is not supported"
      );
    }
    if (object instanceof PDFInvalidObject) {
      throw new PdfEncryptionError(
        "UNSUPPORTED_PDF_OBJECT",
        "Cannot safely encrypt a PDFInvalidObject"
      );
    }
  }
}

function encryptionDictionary(
  pdf: PDFDocument,
  material: Awaited<ReturnType<typeof createR6Material>>
): PDFDict {
  const context = pdf.context;
  return context.obj({
    Filter: "Standard",
    V: 5,
    Length: 256,
    CF: {
      StdCF: {
        CFM: "AESV3",
        AuthEvent: "DocOpen",
        Length: 32
      }
    },
    StmF: "StdCF",
    StrF: "StdCF",
    EFF: "StdCF",
    R: 6,
    O: PDFHexString.of(toHex(material.O)),
    U: PDFHexString.of(toHex(material.U)),
    OE: PDFHexString.of(toHex(material.OE)),
    UE: PDFHexString.of(toHex(material.UE)),
    P: material.P,
    Perms: PDFHexString.of(toHex(material.Perms)),
    EncryptMetadata: material.encryptMetadata
  });
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function metadataRef(pdf: PDFDocument): PDFRef | undefined {
  const value = pdf.catalog.get(PDFName.of("Metadata"));
  return value instanceof PDFRef ? value : undefined;
}

function shouldCompress(
  ref: PDFRef,
  object: PDFObject,
  encryptionRef: PDFRef,
  catalogRef: PDFRef
): boolean {
  return (
    ref !== encryptionRef &&
    ref !== catalogRef &&
    !(object instanceof PDFStream) &&
    !(object instanceof PDFInvalidObject) &&
    ref.generationNumber === 0
  );
}

export interface EncryptedSaveOptions extends SaveOptions {
  encryption: PdfEncryptionOptions;
}

export interface PreparedEncryption {
  encryption: EncryptionContext;
  cleanup(): void;
}

export async function prepareEncryption(
  pdf: PDFDocument,
  encryptionOptions: PdfEncryptionOptions,
  random: RandomSource = webCryptoRandomSource
): Promise<PreparedEncryption> {
  preflight(pdf);
  const context = pdf.context;
  const previousId = context.trailerInfo.ID;
  const material = await createR6Material(encryptionOptions, random);
  const encryptDict = encryptionDictionary(pdf, material);
  const encryptionRef = context.register(encryptDict);
  const id = context.obj([
    PDFHexString.of(toHex(material.firstFileId)),
    PDFHexString.of(toHex(material.secondFileId))
  ]);
  context.trailerInfo.Encrypt = encryptionRef;
  context.trailerInfo.ID = id;

  let cleaned = false;
  return {
    encryption: {
      fileKeyCryptoKey: material.fileKeyCryptoKey,
      dictionaryRef: encryptionRef,
      encryptMetadata: material.encryptMetadata,
      metadataRef: metadataRef(pdf),
      random
    },
    cleanup(): void {
      if (cleaned) return;
      cleaned = true;
      context.delete(encryptionRef);
      delete context.trailerInfo.Encrypt;
      if (previousId === undefined) delete context.trailerInfo.ID;
      else context.trailerInfo.ID = previousId;
      material.fileKey.fill(0);
    }
  };
}

export async function saveEncryptedPdf(
  pdf: PDFDocument,
  options: EncryptedSaveOptions,
  random: RandomSource = webCryptoRandomSource
): Promise<Uint8Array> {
  const {
    encryption: encryptionOptions,
    useObjectStreams = true,
    addDefaultPage = true,
    objectsPerTick: _objectsPerTick = 50,
    updateFieldAppearances: _updateFieldAppearances = true
  } = options;

  if (addDefaultPage && pdf.getPageCount() === 0) pdf.addPage();
  await pdf.flush();
  const prepared = await prepareEncryption(pdf, encryptionOptions, random);

  try {
    return useObjectStreams
      ? await writeWithObjectStreams(pdf, prepared.encryption)
      : await writeWithClassicXref(pdf, prepared.encryption);
  } finally {
    prepared.cleanup();
  }
}

async function writeWithObjectStreams(
  pdf: PDFDocument,
  encryption: EncryptionContext
): Promise<Uint8Array> {
  const context = pdf.context;
  const catalogRef = context.trailerInfo.Root as PDFRef;
  const entries = context.enumerateIndirectObjects() as [PDFRef, PDFObject][];
  const standalone: [PDFRef, PDFObject][] = [];
  const compressedChunks: [PDFRef, PDFObject][][] = [];
  const objectStreamRefs: PDFRef[] = [];

  for (const entry of entries) {
    const [ref, object] = entry;
    if (shouldCompress(ref, object, encryption.dictionaryRef, catalogRef)) {
      let chunk = compressedChunks[compressedChunks.length - 1];
      if (!chunk || chunk.length >= 50) {
        chunk = [];
        compressedChunks.push(chunk);
        objectStreamRefs.push(context.nextRef());
      }
      chunk.push(entry);
    } else {
      standalone.push(entry);
    }
  }

  const chunks: Uint8Array[] = [header()];
  let offset = chunks[0]!.length;
  const xrefs: XrefEntry[] = [];
  for (const [ref, object] of standalone) {
    xrefs.push({ kind: "uncompressed", ref, offset });
    const bytes = await frameEncryptedObject(
      ref,
      object,
      encryption,
      ref !== encryption.dictionaryRef
    );
    chunks.push(bytes);
    offset += bytes.length;
  }

  for (let chunkIndex = 0; chunkIndex < compressedChunks.length; chunkIndex++) {
    const members = compressedChunks[chunkIndex]!;
    const objectStreamRef = objectStreamRefs[chunkIndex]!;
    members.forEach(([ref], index) => {
      xrefs.push({ kind: "compressed", ref, objectStreamRef, index });
    });
    const stream = PDFObjectStream.withContextAndObjects(context, members, true);
    xrefs.push({ kind: "uncompressed", ref: objectStreamRef, offset });
    const bytes = await frameEncryptedObject(objectStreamRef, stream, encryption);
    chunks.push(bytes);
    offset += bytes.length;
  }

  const xrefRef = context.nextRef();
  const xrefOffset = offset;
  xrefs.push({ kind: "uncompressed", ref: xrefRef, offset });
  xrefs.sort((left, right) => left.ref.objectNumber - right.ref.objectNumber);
  const trailerDict = context.obj({
    Root: context.trailerInfo.Root,
    Encrypt: context.trailerInfo.Encrypt,
    Info: context.trailerInfo.Info,
    ID: context.trailerInfo.ID
  });
  const xrefStream = PDFCrossRefStream.create(trailerDict, true);
  for (const entry of xrefs) {
    if (entry.kind === "uncompressed") {
      xrefStream.addUncompressedEntry(entry.ref, entry.offset!);
    } else {
      xrefStream.addCompressedEntry(entry.ref, entry.objectStreamRef!, entry.index!);
    }
  }
  xrefStream.dict.set(PDFName.of("Size"), PDFNumber.of(context.largestObjectNumber + 1));
  chunks.push(await frameEncryptedObject(xrefRef, xrefStream, encryption, false));
  chunks.push(ascii(`startxref\n${xrefOffset}\n%%EOF\n`));
  return concat(chunks);
}

async function writeWithClassicXref(
  pdf: PDFDocument,
  encryption: EncryptionContext
): Promise<Uint8Array> {
  const context = pdf.context;
  const entries = context.enumerateIndirectObjects() as [PDFRef, PDFObject][];
  const chunks: Uint8Array[] = [header()];
  const xref = PDFCrossRefSection.create();
  let offset = chunks[0]!.length;
  for (const [ref, object] of entries) {
    xref.addEntry(ref, offset);
    const bytes = await frameEncryptedObject(
      ref,
      object,
      encryption,
      ref !== encryption.dictionaryRef
    );
    chunks.push(bytes);
    offset += bytes.length;
  }
  const xrefOffset = offset;
  const xrefBytes = new Uint8Array(xref.sizeInBytes());
  xref.copyBytesInto(xrefBytes, 0);
  chunks.push(xrefBytes);

  const trailer = context.obj({
    Size: context.largestObjectNumber + 1,
    Root: context.trailerInfo.Root,
    Encrypt: context.trailerInfo.Encrypt,
    Info: context.trailerInfo.Info,
    ID: context.trailerInfo.ID
  });
  const trailerBytes = new Uint8Array(trailer.sizeInBytes());
  trailer.copyBytesInto(trailerBytes, 0);
  chunks.push(ascii("trailer\n"), trailerBytes, ascii(`\nstartxref\n${xrefOffset}\n%%EOF\n`));
  return concat(chunks);
}
