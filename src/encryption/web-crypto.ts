import { PdfEncryptionError, type RandomSource } from "./types.js";

export type Sha2Name = "SHA-256" | "SHA-384" | "SHA-512";

function webCrypto(): Crypto {
  const crypto = globalThis.crypto;
  if (
    !crypto?.subtle ||
    typeof crypto.subtle.importKey !== "function" ||
    typeof crypto.subtle.digest !== "function" ||
    typeof crypto.subtle.encrypt !== "function"
  ) {
    throw new PdfEncryptionError(
      "WEB_CRYPTO_UNAVAILABLE",
      "PDF encryption requires globalThis.crypto.subtle with AES-CBC and SHA-2 support"
    );
  }
  return crypto;
}

function buffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

export const webCryptoRandomSource: RandomSource = {
  fill(target): void {
    const crypto = globalThis.crypto;
    if (!crypto || typeof crypto.getRandomValues !== "function") {
      throw new PdfEncryptionError(
        "SECURE_RANDOM_UNAVAILABLE",
        "PDF encryption requires globalThis.crypto.getRandomValues"
      );
    }
    crypto.getRandomValues(target);
  }
};

export async function digest(name: Sha2Name, bytes: Uint8Array): Promise<Uint8Array> {
  try {
    return new Uint8Array(await webCrypto().subtle.digest(name, buffer(bytes)));
  } catch (cause) {
    if (cause instanceof PdfEncryptionError) throw cause;
    throw new PdfEncryptionError(
      "WEB_CRYPTO_UNAVAILABLE",
      `Web Crypto ${name} digest failed`,
      { cause }
    );
  }
}

export async function importAesCbcKey(rawKey: Uint8Array): Promise<CryptoKey> {
  if (rawKey.length !== 16 && rawKey.length !== 32) {
    throw new RangeError("AES-CBC key must contain 16 or 32 bytes");
  }
  try {
    return await webCrypto().subtle.importKey(
      "raw",
      buffer(rawKey),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
  } catch (cause) {
    if (cause instanceof PdfEncryptionError) throw cause;
    throw new PdfEncryptionError(
      "WEB_CRYPTO_UNAVAILABLE",
      "Web Crypto AES-CBC key import failed",
      { cause }
    );
  }
}

export async function aesCbcEncrypt(
  key: CryptoKey,
  iv: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  if (iv.length !== 16) throw new RangeError("AES-CBC IV must contain 16 bytes");
  try {
    return new Uint8Array(
      await webCrypto().subtle.encrypt(
        { name: "AES-CBC", iv: buffer(iv) },
        key,
        buffer(plaintext)
      )
    );
  } catch (cause) {
    if (cause instanceof PdfEncryptionError) throw cause;
    throw new PdfEncryptionError(
      "WEB_CRYPTO_UNAVAILABLE",
      "Web Crypto AES-CBC encryption failed",
      { cause }
    );
  }
}

export async function aesCbcEncryptNoPadding(
  key: CryptoKey,
  iv: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  if (plaintext.length % 16 !== 0) {
    throw new RangeError("AES-CBC no-padding input must be block-aligned");
  }
  const paddedCiphertext = await aesCbcEncrypt(key, iv, plaintext);
  return paddedCiphertext.slice(0, plaintext.length);
}

