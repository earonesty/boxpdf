export interface PdfPermissions {
  printing?: "none" | "lowResolution" | "highResolution";
  modify?: boolean;
  copying?: boolean;
  annotate?: boolean;
  fillForms?: boolean;
  assemble?: boolean;
}

export interface PdfEncryptionOptions {
  password: string;
  ownerPassword?: string;
  permissions?: PdfPermissions;
  encryptMetadata?: boolean;
}

export type PdfEncryptionErrorCode =
  | "INVALID_PASSWORD"
  | "PASSWORD_TOO_LONG"
  | "OWNER_PASSWORD_NOT_DISTINCT"
  | "SECURE_RANDOM_UNAVAILABLE"
  | "WEB_CRYPTO_UNAVAILABLE"
  | "SIGNED_PDF_UNSUPPORTED"
  | "ENCRYPTED_INPUT_UNSUPPORTED"
  | "UNSUPPORTED_PDF_OBJECT"
  | "ENCRYPTION_SERIALIZATION_FAILED";

export class PdfEncryptionError extends Error {
  readonly code: PdfEncryptionErrorCode;

  constructor(code: PdfEncryptionErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PdfEncryptionError";
    this.code = code;
  }
}

export interface RandomSource {
  fill(target: Uint8Array): void;
}

