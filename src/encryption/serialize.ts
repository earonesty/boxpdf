import {
  PDFArray,
  PDFBool,
  PDFCrossRefStream,
  PDFDict,
  PDFHexString,
  PDFInvalidObject,
  PDFName,
  PDFNull,
  PDFNumber,
  type PDFObject,
  PDFRef,
  PDFStream,
  PDFString
} from "pdf-lib";
import { aesCbcEncrypt } from "./web-crypto.js";
import { PdfEncryptionError, type RandomSource } from "./types.js";

export interface EncryptionContext {
  readonly fileKeyCryptoKey: CryptoKey;
  readonly dictionaryRef: PDFRef;
  readonly encryptMetadata: boolean;
  readonly metadataRef?: PDFRef;
  readonly random: RandomSource;
}

const ascii = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++) bytes[index] = value.charCodeAt(index);
  return bytes;
};

const join = (parts: Uint8Array[]): Uint8Array => {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};

function plainBytes(object: PDFObject): Uint8Array {
  const result = new Uint8Array(object.sizeInBytes());
  const written = object.copyBytesInto(result, 0);
  if (written !== result.length) {
    throw new PdfEncryptionError(
      "ENCRYPTION_SERIALIZATION_FAILED",
      "pdf-lib object size changed during serialization"
    );
  }
  return result;
}

function hexBytes(bytes: Uint8Array): Uint8Array {
  const digits = "0123456789ABCDEF";
  const result = new Uint8Array(bytes.length * 2 + 2);
  result[0] = 0x3c;
  let offset = 1;
  for (const byte of bytes) {
    result[offset++] = digits.charCodeAt(byte >>> 4);
    result[offset++] = digits.charCodeAt(byte & 15);
  }
  result[offset] = 0x3e;
  return result;
}

async function encryptBytes(
  plaintext: Uint8Array,
  encryption: EncryptionContext
): Promise<Uint8Array> {
  const iv = new Uint8Array(16);
  encryption.random.fill(iv);
  const ciphertext = await aesCbcEncrypt(
    encryption.fileKeyCryptoKey,
    iv,
    plaintext
  );
  return join([iv, ciphertext]);
}

function isPrimitive(object: PDFObject): boolean {
  return (
    object instanceof PDFName ||
    object instanceof PDFNumber ||
    object instanceof PDFBool ||
    object instanceof PDFRef ||
    object === PDFNull
  );
}

export async function serializeObject(
  owner: PDFRef,
  object: PDFObject,
  encryption: EncryptionContext,
  encrypt = true
): Promise<Uint8Array> {
  if (!encrypt || owner === encryption.dictionaryRef || object instanceof PDFCrossRefStream) {
    return plainBytes(object);
  }
  if (object instanceof PDFInvalidObject) {
    throw new PdfEncryptionError(
      "UNSUPPORTED_PDF_OBJECT",
      "Cannot safely encrypt a PDFInvalidObject"
    );
  }
  if (object instanceof PDFString || object instanceof PDFHexString) {
    return hexBytes(await encryptBytes(object.asBytes(), encryption));
  }
  if (object instanceof PDFArray) {
    const parts = [ascii("[ ")];
    for (const value of object.asArray()) {
      parts.push(await serializeObject(owner, value, encryption), ascii(" "));
    }
    parts.push(ascii("]"));
    return join(parts);
  }
  if (object instanceof PDFDict) {
    const parts = [ascii("<<\n")];
    for (const [key, value] of object.entries()) {
      parts.push(
        plainBytes(key),
        ascii(" "),
        await serializeObject(owner, value, encryption),
        ascii("\n")
      );
    }
    parts.push(ascii(">>"));
    return join(parts);
  }
  if (object instanceof PDFStream) {
    const shouldEncryptContents =
      encryption.encryptMetadata ||
      encryption.metadataRef === undefined ||
      owner !== encryption.metadataRef;
    const contents = shouldEncryptContents
      ? await encryptBytes(object.getContents(), encryption)
      : object.getContents();
    const dict = object.dict.clone();
    dict.set(PDFName.of("Length"), PDFNumber.of(contents.length));
    return join([
      await serializeObject(owner, dict, encryption),
      ascii("\nstream\n"),
      contents,
      ascii("\nendstream")
    ]);
  }
  if (isPrimitive(object)) return plainBytes(object);

  throw new PdfEncryptionError(
    "UNSUPPORTED_PDF_OBJECT",
    `Cannot safely encrypt PDF object type ${object.constructor.name}`
  );
}

export async function frameEncryptedObject(
  ref: PDFRef,
  object: PDFObject,
  encryption: EncryptionContext,
  encrypt = true
): Promise<Uint8Array> {
  return join([
    ascii(`${ref.objectNumber} ${ref.generationNumber} obj\n`),
    await serializeObject(ref, object, encryption, encrypt),
    ascii("\nendobj\n")
  ]);
}

