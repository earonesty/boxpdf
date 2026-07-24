import { describe, expect, it } from "vitest";
import {
  aesCbcEncrypt,
  aesCbcEncryptNoPadding,
  digest,
  importAesCbcKey
} from "../../src/encryption/web-crypto.js";
import { preparePassword } from "../../src/encryption/saslprep.js";
import {
  clearPermissionsBlock,
  permissionWord
} from "../../src/encryption/permissions.js";
import { createR6Material, r6Hash } from "../../src/encryption/r6.js";
import type { RandomSource } from "../../src/encryption/types.js";

function hex(value: string): Uint8Array {
  return Uint8Array.from(value.match(/../g) ?? [], (byte) => Number.parseInt(byte, 16));
}

function hexString(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

class CounterRandom implements RandomSource {
  private next = 0;

  fill(target: Uint8Array): void {
    for (let index = 0; index < target.length; index++) {
      target[index] = this.next++ & 0xff;
    }
  }
}

class FailingAfterFileKeyRandom implements RandomSource {
  fileKey: Uint8Array | undefined;
  private calls = 0;

  fill(target: Uint8Array): void {
    this.calls += 1;
    if (this.calls === 1) {
      target.fill(0xa5);
      this.fileKey = target;
      return;
    }
    throw new Error("injected random failure");
  }
}

describe("Web Crypto PDF adapters", () => {
  it("dispatches SHA-256, SHA-384, and SHA-512", async () => {
    const abc = new TextEncoder().encode("abc");
    expect(hexString(await digest("SHA-256", abc))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(hexString(await digest("SHA-384", abc))).toBe(
      "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed" +
      "8086072ba1e7cc2358baeca134c825a7"
    );
    expect(hexString(await digest("SHA-512", abc))).toBe(
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
      "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    );
  });

  it("matches the NIST AES-128-CBC vector without padding", async () => {
    const key = await importAesCbcKey(hex("2b7e151628aed2a6abf7158809cf4f3c"));
    const encrypted = await aesCbcEncryptNoPadding(
      key,
      hex("000102030405060708090a0b0c0d0e0f"),
      hex("6bc1bee22e409f96e93d7e117393172a")
    );
    expect(hexString(encrypted)).toBe("7649abac8119b246cee98e9b12e9197d");
  });

  it("uses zero-IV single-block CBC as AES-256-ECB", async () => {
    const key = await importAesCbcKey(
      hex("603deb1015ca71be2b73aef0857d7781" + "1f352c073b6108d72d9810a30914dff4")
    );
    const encrypted = await aesCbcEncryptNoPadding(
      key,
      new Uint8Array(16),
      hex("6bc1bee22e409f96e93d7e117393172a")
    );
    expect(hexString(encrypted)).toBe("f3eed1bdb5d2a03c064b5a7e3db181f8");
  });

  it("leaves Web Crypto PKCS#7 padding intact for PDF objects", async () => {
    const key = await importAesCbcKey(new Uint8Array(32));
    expect(await aesCbcEncrypt(key, new Uint8Array(16), new Uint8Array())).toHaveLength(16);
    expect(await aesCbcEncrypt(key, new Uint8Array(16), new Uint8Array(16))).toHaveLength(32);
    expect(await aesCbcEncrypt(key, new Uint8Array(16), new Uint8Array(17))).toHaveLength(32);
  });

  it("rejects invalid no-padding input", async () => {
    const key = await importAesCbcKey(new Uint8Array(16));
    await expect(
      aesCbcEncryptNoPadding(key, new Uint8Array(16), new Uint8Array(15))
    ).rejects.toThrow(/block-aligned/);
  });
});

describe("SASLprep password preparation", () => {
  const text = (value: string): string => new TextDecoder().decode(preparePassword(value));

  it("matches RFC 4013 mapping and normalization examples", () => {
    expect(text("I\u00ADX")).toBe("IX");
    expect(text("a\u00A0b")).toBe("a b");
    expect(text("\u00AA")).toBe("a");
    expect(text("\u2168")).toBe("IX");
  });

  it("rejects prohibited, unassigned, surrogate, and invalid bidi input", () => {
    expect(() => preparePassword("a\u0007b")).toThrow(/prohibited/);
    expect(() => preparePassword("\u0221")).toThrow(/unassigned/);
    expect(() => preparePassword("\ud800")).toThrow(/surrogate/);
    expect(() => preparePassword("\u0627a\u0628")).toThrow(/bidirectional/);
    expect(() => preparePassword("\u06271")).toThrow(/bidirectional/);
  });

  it("enforces the prepared UTF-8 byte limit", () => {
    expect(preparePassword("a".repeat(127))).toHaveLength(127);
    expect(() => preparePassword("a".repeat(128))).toThrow(/127 UTF-8 bytes/);
    expect(() => preparePassword("\u00AD")).toThrow(/must not be empty/);
  });
});

describe("R6 permissions and material", () => {
  it("encodes permission bits and the clear Perms block", () => {
    expect(permissionWord()).toBe(-4);
    expect(permissionWord({ printing: "lowResolution" })).toBe(-2052);
    expect(permissionWord({ printing: "none" })).toBe(-2056);
    expect(permissionWord({ copying: false }) >>> 0).toBe(0xffffffec);

    const clear = clearPermissionsBlock(-4, true, hex("01020304"));
    expect(hexString(clear)).toBe("fcffffffffffffff5461646201020304");
  });

  it("builds correctly sized deterministic R6 fields", async () => {
    const material = await createR6Material(
      {
        password: "test-user",
        ownerPassword: "test-owner",
        permissions: { copying: false },
        encryptMetadata: false
      },
      new CounterRandom()
    );
    expect(material.fileKey).toHaveLength(32);
    expect(material.U).toHaveLength(48);
    expect(material.UE).toHaveLength(32);
    expect(material.O).toHaveLength(48);
    expect(material.OE).toHaveLength(32);
    expect(material.Perms).toHaveLength(16);
    expect(material.firstFileId).toHaveLength(16);
    expect(material.secondFileId).toHaveLength(16);
    expect(material.P).toBe(permissionWord({ copying: false }));
    expect(material.encryptMetadata).toBe(false);
  });

  it("is deterministic for fixed inputs and rejects equal prepared owners", async () => {
    const password = new TextEncoder().encode("password");
    const salt = hex("0102030405060708");
    const first = await r6Hash(password, salt);
    const second = await r6Hash(password, salt);
    expect(first).toEqual(second);
    expect(first).toHaveLength(32);

    await expect(
      createR6Material(
        { password: "\u2168", ownerPassword: "IX" },
        new CounterRandom()
      )
    ).rejects.toMatchObject({ code: "OWNER_PASSWORD_NOT_DISTINCT" });
  });

  it("clears the file key when material derivation fails", async () => {
    const random = new FailingAfterFileKeyRandom();
    await expect(
      createR6Material(
        { password: "test-user", ownerPassword: "test-owner" },
        random
      )
    ).rejects.toThrow(/injected random failure/);
    expect(random.fileKey).toEqual(new Uint8Array(32));
  });
});
