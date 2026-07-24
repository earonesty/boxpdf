import { equalBytes, preparePassword } from "./saslprep.js";
import {
  aesCbcEncryptNoPadding,
  digest,
  importAesCbcKey,
  webCryptoRandomSource
} from "./web-crypto.js";
import { clearPermissionsBlock, permissionWord } from "./permissions.js";
import {
  PdfEncryptionError,
  type PdfEncryptionOptions,
  type RandomSource
} from "./types.js";

const ZERO_IV = new Uint8Array(16);

function concat(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function repeated(parts: Uint8Array[], count: number): Uint8Array {
  const unitLength = parts.reduce((length, part) => length + part.length, 0);
  const result = new Uint8Array(unitLength * count);
  let offset = 0;
  for (let index = 0; index < count; index++) {
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
  }
  return result;
}

function modulo3(bytes: Uint8Array): number {
  let remainder = 0;
  for (const byte of bytes) remainder = (remainder * 256 + byte) % 3;
  return remainder;
}

export async function r6Hash(
  password: Uint8Array,
  salt: Uint8Array,
  userKey?: Uint8Array
): Promise<Uint8Array> {
  let hash = await digest("SHA-256", concat(password, salt, ...(userKey ? [userKey] : [])));
  let encrypted: Uint8Array<ArrayBufferLike> = new Uint8Array();
  let round = 0;
  do {
    const input = repeated([password, hash, ...(userKey ? [userKey] : [])], 64);
    const key = await importAesCbcKey(hash.slice(0, 16));
    encrypted = await aesCbcEncryptNoPadding(key, hash.slice(16, 32), input);
    const algorithm = (["SHA-256", "SHA-384", "SHA-512"] as const)[
      modulo3(encrypted.slice(0, 16))
    ]!;
    hash = await digest(algorithm, encrypted);
    input.fill(0);
    round += 1;
  } while (round < 64 || encrypted[encrypted.length - 1]! > round - 32);
  return hash.slice(0, 32);
}

function randomBytes(random: RandomSource, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  random.fill(bytes);
  return bytes;
}

function generatedOwnerPassword(random: RandomSource): string {
  const bytes = randomBytes(random, 32);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let bits = 0;
  let bitCount = 0;
  let result = "";
  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    bitCount += 8;
    while (bitCount >= 6) {
      bitCount -= 6;
      result += alphabet[(bits >>> bitCount) & 63]!;
    }
  }
  if (bitCount > 0) result += alphabet[(bits << (6 - bitCount)) & 63]!;
  bytes.fill(0);
  return result;
}

export interface R6Material {
  fileKey: Uint8Array;
  fileKeyCryptoKey: CryptoKey;
  U: Uint8Array;
  UE: Uint8Array;
  O: Uint8Array;
  OE: Uint8Array;
  Perms: Uint8Array;
  P: number;
  encryptMetadata: boolean;
  firstFileId: Uint8Array;
  secondFileId: Uint8Array;
}

export async function createR6Material(
  options: PdfEncryptionOptions,
  random: RandomSource = webCryptoRandomSource
): Promise<R6Material> {
  const userPassword = preparePassword(options.password, "password");
  let ownerPassword: Uint8Array | undefined;
  let fileKey: Uint8Array | undefined;
  let permissionsTail: Uint8Array | undefined;

  try {
    ownerPassword = preparePassword(
      options.ownerPassword ?? generatedOwnerPassword(random),
      "ownerPassword"
    );
    if (options.ownerPassword !== undefined && equalBytes(userPassword, ownerPassword)) {
      throw new PdfEncryptionError(
        "OWNER_PASSWORD_NOT_DISTINCT",
        "ownerPassword must differ from password after SASLprep"
      );
    }

    fileKey = randomBytes(random, 32);
    const userValidationSalt = randomBytes(random, 8);
    const userKeySalt = randomBytes(random, 8);
    const ownerValidationSalt = randomBytes(random, 8);
    const ownerKeySalt = randomBytes(random, 8);
    permissionsTail = randomBytes(random, 4);
    const firstFileId = randomBytes(random, 16);
    const secondFileId = randomBytes(random, 16);

    const userValidationHash = await r6Hash(userPassword, userValidationSalt);
    const U = concat(userValidationHash, userValidationSalt, userKeySalt);
    const userKey = await importAesCbcKey(await r6Hash(userPassword, userKeySalt));
    const UE = await aesCbcEncryptNoPadding(userKey, ZERO_IV, fileKey);

    const ownerValidationHash = await r6Hash(ownerPassword, ownerValidationSalt, U);
    const O = concat(ownerValidationHash, ownerValidationSalt, ownerKeySalt);
    const ownerKey = await importAesCbcKey(await r6Hash(ownerPassword, ownerKeySalt, U));
    const OE = await aesCbcEncryptNoPadding(ownerKey, ZERO_IV, fileKey);

    const P = permissionWord(options.permissions);
    const encryptMetadata = options.encryptMetadata ?? true;
    const clearPerms = clearPermissionsBlock(P, encryptMetadata, permissionsTail);
    const fileKeyCryptoKey = await importAesCbcKey(fileKey);
    const Perms = await aesCbcEncryptNoPadding(fileKeyCryptoKey, ZERO_IV, clearPerms);
    clearPerms.fill(0);

    return {
      fileKey,
      fileKeyCryptoKey,
      U,
      UE,
      O,
      OE,
      Perms,
      P,
      encryptMetadata,
      firstFileId,
      secondFileId
    };
  } catch (cause) {
    fileKey?.fill(0);
    throw cause;
  } finally {
    userPassword.fill(0);
    ownerPassword?.fill(0);
    permissionsTail?.fill(0);
  }
}
