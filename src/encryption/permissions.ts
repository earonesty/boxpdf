import type { PdfPermissions } from "./types.js";

const bit = (position: number): number => 1 << (position - 1);

export function permissionWord(options: PdfPermissions = {}): number {
  let value = 0xffffffff;
  value &= ~bit(1);
  value &= ~bit(2);

  const printing = options.printing ?? "highResolution";
  if (printing === "none") {
    value &= ~bit(3);
    value &= ~bit(12);
  } else if (printing === "lowResolution") {
    value &= ~bit(12);
  }
  if (options.modify === false) value &= ~bit(4);
  if (options.copying === false) value &= ~bit(5);
  if (options.annotate === false) value &= ~bit(6);
  if (options.fillForms === false) value &= ~bit(9);
  if (options.assemble === false) value &= ~bit(11);

  return value | 0;
}

export function clearPermissionsBlock(
  permissions: number,
  encryptMetadata: boolean,
  randomTail: Uint8Array
): Uint8Array {
  if (randomTail.length !== 4) {
    throw new RangeError("permissions random tail must contain 4 bytes");
  }
  const result = new Uint8Array(16);
  new DataView(result.buffer).setInt32(0, permissions, true);
  result.fill(0xff, 4, 8);
  result[8] = encryptMetadata ? 0x54 : 0x46;
  result.set([0x61, 0x64, 0x62], 9);
  result.set(randomTail, 12);
  return result;
}
