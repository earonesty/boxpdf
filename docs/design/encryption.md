# AES-256 encrypted output — approved design

Status: approved design; implementation has not started.

This document is the implementation contract for password-encrypted BoxPDF
output. Decisions labelled **Decision** are settled for v1. Items labelled
**VERIFY (ISO)** must be checked against the licensed copy of ISO 32000-2:2020,
including published errata, before their implementation test is accepted.
QPDF is an interoperability oracle and a useful independent implementation,
not a substitute for the specification.

## Decisions at a glance

- **Decision:** v1 writes only the PDF 2.0 Standard Security Handler,
  `/V 5`, `/R 6`, AES-256 (`/AESV3`). There is no RC4, MD5, AES-128, `/R 5`,
  public-key handler, or compatibility switch.
- **Decision:** the implementation is TypeScript and pure JavaScript at
  runtime. WebAssembly, native binaries/addons, subprocesses, services,
  rasterization, and a C++ backend are forbidden.
- **Decision:** encryption happens while indirect objects are serialized. A
  traversal over bytes or objects after `pdf.save()` is not acceptable.
- **Decision:** BoxPDF owns an encryption-aware writer. pdf-lib remains the
  document/object model, font/image embedder, and peer dependency.
- **Decision:** encrypted `flowToPdf`, `renderToPdf`, `savePdf`, and
  `streamFlow` output use the same security-handler and object-serialization
  code.
- **Decision:** no new runtime dependency is planned. Cryptographic primitives
  and RFC 4013 preparation are self-contained, security-reviewed internal
  modules with specification and known-answer tests. Their audit surface,
  browser bundle cost, and CPU/memory performance are explicit release costs,
  not reasons to abbreviate the implementations.
- **Decision:** output uses a `%PDF-2.0` header. The encryption dictionary is a
  standalone indirect object and the catalog is not put in an object stream.

## Goals

- Produce PDFs that require the configured user password to open and that can
  independently be opened by current QPDF, Poppler, Acrobat, and browser PDF
  viewers.
- Support a distinct owner password and standards-defined viewer permissions.
- Encrypt all strings and stream data required by the selected crypt filters,
  including content, fonts, images, object streams, and embedded-file streams.
- Work in browsers, the verified minimum supported Node runtime, Cloudflare
  Workers, and Deno with identical wire semantics.
- Keep secrets out of errors, logs, fixtures, filenames, and long-lived public
  objects.
- Preserve `streamFlow`'s bounded-document-memory property.
- Make the algorithms testable with deterministic entropy without making
  deterministic or weak randomness reachable from the production API.

## Non-goals

- Reading, opening, decrypting, changing, or preserving encryption on an input
  PDF.
- RC4/MD5 compatibility, `/R 2` through `/R 5`, AES-128, certificate/public-key
  security handlers, attachment-only encryption, custom crypt filters, or
  password recovery.
- Enforcing permissions after a file is opened. PDF permissions are advisory
  to conforming readers; they are not a DRM or authorization boundary.
- Form creation/filling/import, importing existing PDFs, signatures,
  incremental updates, linearization, PDF/A, PDF/X, or PDF/UA support.
  Permission bits whose names mention forms, annotations, or document assembly
  do not imply those BoxPDF features. Forms and annotations already present in
  a caller-created `PDFDocument` retain their structure and are encrypted as
  ordinary eligible objects; this feature adds no form creation, form import,
  PDF import, or decryption support.
- A browser password dialog, password-strength UI, download button, Blob URL,
  iframe, `Content-Disposition` header, password storage, or password delivery.
  Those are application responsibilities.
- Hiding structural facts such as object count, offsets, PDF version, or the
  encryption dictionary. The Standard Security Handler does not conceal them.

## Threat model

The protected artifact may be copied from storage, an email, a download, or an
untrusted transport. A party without either password should not recover
encrypted strings or stream contents except by guessing a password or breaking
the standardized primitives. Random file keys, salts, and IVs prevent equal
inputs from producing equal ciphertext.

The following are outside the boundary:

- an attacker who knows a password, can read it from application state, or
  controls the runtime before serialization;
- weak or reused human passwords and offline dictionary attacks;
- content already disclosed in logs, DOM, caches, temporary files, source
  nodes, or an unencrypted earlier save;
- viewers that deliberately ignore `P` permissions;
- malicious active modifications to the encrypted PDF. AES-CBC is not
  authenticated encryption and the PDF Standard Security Handler does not
  provide general integrity or authenticity. Digital signatures are separate.

Callers should send the password through a separate channel from the PDF. The
BoxPDF browser package must not retain, prompt for, transmit, or persist it.

## Public API

### Types

Add these exact public types:

```ts
import type { SaveOptions } from "pdf-lib";

export interface PdfPermissions {
  /**
   * Default: "highResolution".
   * "none" clears P bits 3 and 12; "lowResolution" sets bit 3 only;
   * "highResolution" sets bits 3 and 12.
   */
  printing?: "none" | "lowResolution" | "highResolution";

  /** Allow general document modification (P bit 4). Default: true. */
  modify?: boolean;

  /** Allow copying/extraction (P bit 5). Default: true. */
  copying?: boolean;

  /** Allow adding or changing annotations (P bit 6). Default: true. */
  annotate?: boolean;

  /** Allow filling existing form fields (P bit 9). Default: true. */
  fillForms?: boolean;

  /** Allow document assembly (P bit 11). Default: true. */
  assemble?: boolean;
}

export interface PdfEncryptionOptions {
  /**
   * Required, non-empty password used for ordinary opening.
   */
  password: string;

  /**
   * Optional administrative password. When supplied it must be non-empty and
   * must not prepare to the same byte sequence as password.
   */
  ownerPassword?: string;

  /** Default: all permissions granted. */
  permissions?: PdfPermissions;

  /**
   * Encrypt metadata covered by the Standard Security Handler's verified
   * metadata exemption. Default: true.
   * The Info dictionary remains encrypted either way.
   */
  encryptMetadata?: boolean;
}

export interface SavePdfOptions extends SaveOptions {
  /** Omit for an ordinary unencrypted save. */
  encryption?: PdfEncryptionOptions;
}

export interface FlowToPdfOptions extends FlowOptions {
  encryption?: PdfEncryptionOptions;
  /** Forwarded to the writer. Encryption is not a pdf-lib save option. */
  save?: Omit<SaveOptions, "useObjectStreams"> & {
    /** Default: true. */
    useObjectStreams?: boolean;
  };
}

export interface RenderToPdfOptions extends PageOptions {
  encryption?: PdfEncryptionOptions;
  save?: Omit<SaveOptions, "useObjectStreams"> & {
    /** Default: true. */
    useObjectStreams?: boolean;
  };
}
```

`PdfEncryptionOptions` intentionally has no `algorithm`, `revision`,
`keyLength`, raw-key, entropy, or normalization escape hatch.

When `ownerPassword` is omitted, BoxPDF generates an unexposed internal owner
credential from secure random material, encoded as a standards-valid
printable-ASCII password within the R6 byte limit. A concrete implementation is
32 random bytes encoded as unpadded base64url (43 ASCII bytes). It is prepared
like any other owner password, used only to derive `O` and `OE`, then discarded
with the other ephemeral secret material; it is never retained, returned, or
made recoverable. This lets callers configure restrictions without forcing
them to create, transport, or manage an owner credential. Distinct prepared
owner/user bytes are required only when the caller supplied `ownerPassword`;
the generated credential is independently random.

`SaveOptions.updateFieldAppearances` is forwarded for API parity only; this
design does not add form support. `addDefaultPage` and `objectsPerTick` retain
pdf-lib defaults. `useObjectStreams` defaults to `true`.

### Functions and lifecycle

```ts
export async function flowToPdf(
  build: (pdf: PDFDocument) => Node[] | Promise<Node[]>,
  options: FlowToPdfOptions = {}
): Promise<Uint8Array>;

export async function renderToPdf(
  node: Node,
  options: RenderToPdfOptions = {}
): Promise<Uint8Array>;

export async function renderFlow(
  pdf: PDFDocument,
  nodes: Node[],
  options: FlowOptions = {}
): Promise<{ pages: PDFPage[] }>;

export async function savePdf(
  pdf: PDFDocument,
  options: SavePdfOptions = {}
): Promise<Uint8Array>;
```

These preserve the current `src/document.ts` call shapes:
`flowToPdf(build, options)` and `renderToPdf(node, options)` own document
creation and saving; `renderFlow(pdf, nodes, options)` mutates the
caller-owned `PDFDocument` and does not save; `savePdf(pdf, options)` is the
new explicit save path.

- `savePdf(pdf)` is the BoxPDF-owned save entry point and produces the same
  semantic output as `pdf.save()` using the local writer.
- `savePdf(pdf, { encryption })` flushes lazy pdf-lib embedders, constructs the
  R6 material, and writes encrypted bytes.
- A caller-owned `PDFDocument` is encrypted only when saved through `savePdf`.
  Calling `pdf.save()` remains pdf-lib behavior and is unencrypted. BoxPDF will
  not monkey-patch a document instance or mutate pdf-lib globals.
- Saving does not consume the document. A later save is allowed and gets fresh
  file-key material and IVs. Applications must not publish an earlier
  unencrypted save if confidentiality was intended.

`flowToPdf(build, options)` and `renderToPdf(node, options)` continue to own
document creation and saving. If `options.encryption` is present they call
`savePdf`; otherwise they may call the same local writer or preserve the
current `pdf.save()` path, provided unencrypted behavior remains compatible.
The encryption and `save` keys are removed before passing layout options to
`renderFlow` or rendering.

`renderFlow(pdf, nodes, options)` still only lays out and mutates the
caller-owned document. It does not accept or remember encryption configuration
and does not save. The explicit sequence is:

```ts
const pdf = await PDFDocument.create();
await renderFlow(pdf, nodes, flowOptions);
const bytes = await savePdf(pdf, {
  encryption: { password: "open me" }
});
```

`StreamFlowOptions` keeps the current `src/stream.ts` shape and adds only
`encryption`:

```ts
export interface StreamFlowOptions extends DocumentMetadata {
  size?: PageSize;
  margin?: EdgesInput;
  reserveBottom?: number;
  header?: (ctx: StreamPageContext) => Node;
  footer?: (ctx: StreamPageContext) => Node;
  debug?: boolean;
  objectsPerStream?: number;
  warnings?: boolean;
  encryption?: PdfEncryptionOptions;
}
```

Before generating security material, and before emitting the PDF header or any
other byte, both buffered and streaming paths run the signed/encrypted-input
preflight defined below. When encryption is present and preflight succeeds,
security material is created before the PDF header and every eligible object is
encrypted as it is written. The writable is still closed on success and
aborted on failure. A preflight/password/entropy/crypto error before the first
write rejects without writing; an error after the first write aborts and leaves
an invalid partial artifact, matching the current contract.

Encryption is incompatible with splicing an encryption pass after
`streamFlow`: ownership of indirect-object context, exemptions, xref offsets,
and `/Encrypt` must remain inside the writer. It is compatible with
`streamFlow` itself, but has tradeoffs:

- each encrypted string or stream gains a 16-byte IV plus 1–16 bytes of
  PKCS#7 padding;
- each stream must be available through its existing `getContents()` buffer for
  one object-level AES operation; this does not add whole-document buffering,
  but a single very large image/font stream still sets the peak;
- R6 password hashing runs before output and adds CPU latency;
- ciphertext is incompressible, so compression must happen before encryption.

### Browser UX ownership

BoxPDF accepts strings and returns/emits bytes. The host application owns all
password inputs, confirmation, visibility toggles, strength guidance,
accessibility, localization, secret transport, download behavior, and error
presentation. BoxPDF errors use stable codes and never echo passwords.

Do not set a PDF user password from a URL query, write it into document
content/metadata, log the options object, or include it in telemetry. A browser
may display its own password prompt when the resulting Blob is opened; BoxPDF
does not control that viewer UI.

## Fail-closed document preflight

Every BoxPDF output path that receives `encryption` performs a conservative
read-only preflight of the caller-created `PDFDocument` context. Unencrypted
paths retain their current pdf-lib-compatible behavior. Encryption preflight
runs before generating the file key, salts, internal owner credential, or any
other security material and, for `streamFlow`, before writing the PDF header or
any stream byte.

- If the context already carries an encryption dictionary/reference, encrypted
  input marker, security-handler state, or another indication that it came
  from an encrypted source, reject with `ENCRYPTED_INPUT_UNSUPPORTED`.
  BoxPDF does not decrypt, re-encrypt, preserve, or import encrypted input.
- If any existing object is a signature dictionary, contains a `/ByteRange`,
  or otherwise conservatively indicates an existing PDF signature, reject with
  `SIGNED_PDF_UNSUPPORTED`. Do not special-case signature `/Contents`, attempt
  to preserve a signed byte range, or promise a safe full rewrite. Existing
  signatures are not preserved.

The scan follows all registered indirect objects and fails closed when an
unknown object representation prevents a reliable decision. It must not rely
only on the catalog or AcroForm field tree: a detached signature dictionary or
`/ByteRange` is sufficient for rejection. Buffered saves reject before
returning bytes; streaming saves reject before touching the sink. Signature
creation and encrypted-input loading remain outside this feature.

## Wire format: Standard Security Handler `/V 5`, `/R 6`

### Encryption dictionary

The trailer or cross-reference stream dictionary references a standalone
indirect encryption dictionary:

```pdf
<<
  /Filter /Standard
  /V 5
  /Length 256
  /R 6
  /O <48 bytes>
  /U <48 bytes>
  /OE <32 bytes>
  /UE <32 bytes>
  /P -4
  /Perms <16 bytes>
  /EncryptMetadata true
  /CF <<
    /StdCF <<
      /AuthEvent /DocOpen
      /CFM /AESV3
      /Length 32
    >>
  >>
  /StmF /StdCF
  /StrF /StdCF
  /EFF /StdCF
>>
```

Values above show lengths and all-permissions `P`; actual byte strings and
permissions vary. Binary values are emitted as hexadecimal strings.

**VERIFY (ISO):** confirm `/Length 256` in the encryption dictionary and
`/Length 32` in the Standard crypt-filter dictionary against ISO 32000-2:2020
Table 20/Table 25 plus current errata. The published errata explicitly clarify
that Standard-handler `/AESV3` crypt-filter length is 32 bytes. `/EFF /StdCF`
is explicit even though an absent EFF inherits the stream filter.

The file header is `%PDF-2.0`. `/ID` contains two 16-byte random values and is
present in the xref/trailer dictionary. R6 key derivation does not use `/ID`,
but identifiers remain required writer metadata and prevent accidental
deterministic identity. **VERIFY (ISO):** exact PDF 2.0 requirements for both
ID values on newly created encrypted files and whether the two initial values
may or should be identical. The implementation decision is to generate each
independently unless ISO requires equality for first write.

### Password preparation

For the required user-opening `password` and the effective owner credential
(caller-supplied or internally generated):

1. Treat the JavaScript string as Unicode scalar input. An unpaired UTF-16
   surrogate is rejected.
2. Apply RFC 4013 SASLprep with the Normalize and BiDi options, using
   RFC 3454's Unicode 3.2 tables: map non-ASCII spaces to ASCII space, map
   "commonly mapped to nothing" characters away, normalize with NFKC, reject
   prohibited output, enforce bidirectional rules, and reject Unicode-3.2
   unassigned code points as a stored string.
3. Encode the prepared result as UTF-8.
4. **VERIFY (ISO):** ISO's R6 algorithm is understood to use at most the first
   127 bytes. BoxPDF's public API adopts a deliberately stricter policy: if a
   caller-supplied prepared encoding exceeds 127 bytes, throw
   `PASSWORD_TOO_LONG` rather than silently create password aliases. This is a
   BoxPDF rejection policy, not a claim that conforming readers reject such
   passwords; internal normative algorithm-vector tests still exercise the
   verified reader/algorithm truncation behavior.

**VERIFY (ISO):** confirm that revision 6 calls for SASLprep as a stored string
(unassigned code points prohibited), the exact failure behavior, and byte-level
truncation rather than code-point-boundary truncation. Do not replace SASLprep
with only `String.prototype.normalize("NFKC")`; ECMAScript's current Unicode
tables and missing mappings/prohibitions/BiDi checks are not equivalent.

An empty prepared `password` is rejected with `INVALID_PASSWORD`. If
`ownerPassword` was supplied, an empty prepared value is also rejected and
equal prepared owner/user byte strings are rejected with
`OWNER_PASSWORD_NOT_DISTINCT`; comparison is on the actual bytes used by the
algorithms, not the original JS strings. No distinctness error is exposed for
the independently generated internal owner credential.

### Random inputs

Generate independently with `globalThis.crypto.getRandomValues`:

- 32-byte file encryption key;
- when `ownerPassword` is omitted, 32 bytes for the internal owner credential
  before printable-ASCII encoding;
- 8-byte user validation salt;
- 8-byte user key salt;
- 8-byte owner validation salt;
- 8-byte owner key salt;
- 4 random bytes in the clear `Perms` block;
- two 16-byte file identifiers;
- a fresh 16-byte IV for every encrypted string and stream.

**VERIFY (runtime):** establish the exact minimum Node version for
`globalThis.crypto.getRandomValues` in both the shipped ESM and CJS builds,
without flags or polyfills, and verify the same global API in supported
browsers, Workers, and Deno. Node 18 is a candidate minimum, not an approved
fact. If either Node 18 module format lacks the required global Web Crypto
surface, raise BoxPDF's minimum Node version; do not add a Node-specific
`crypto` import or conditional fallback. Absence or failure of
`crypto.getRandomValues` is fatal (`SECURE_RANDOM_UNAVAILABLE`); there is no
`Math.random`, timestamp, counter, process API, or Node-only fallback.

### Algorithm 2.B hash

Define `r6Hash(password, salt, userKey?)` over bytes:

1. `K = SHA-256(password || salt || userKey?)`.
2. Set `round = 0`. Run this body:
   - `K1` is 64 repetitions of
     `password || K || (userKey ?? empty)`.
   - `E = AES-128-CBC-NoPadding(K[0..15], IV=K[16..31], K1)`.
   - Interpret `E[0..15]` as an unsigned big-endian integer modulo 3. Select
     SHA-256, SHA-384, or SHA-512 for remainders 0, 1, or 2.
   - `K = selectedHash(E)`.
   - Increment `round`.
3. Repeat the body while
   `round < 64 || unsigned(E[E.length - 1]) > round - 32`. Thus the first
   termination test is after 64 completed bodies, with a threshold of 32.
4. Return the first 32 bytes of final `K`.

The modulo operation must be implemented without JavaScript `number` conversion
of the 128-bit integer (iterative remainder or `bigint` is safe). The round
number convention and termination condition get fixed-vector tests; QPDF notes
that off-by-one interpretations have historically produced incompatible files.

### `U`, `UE`, `O`, and `OE`

Let `fileKey` be the random 32-byte file encryption key.

```text
U  = r6Hash(password, userValidationSalt)
     || userValidationSalt || userKeySalt

UE = AES-256-CBC-NoPadding(
       key = r6Hash(password, userKeySalt),
       iv = 16 zero bytes,
       plaintext = fileKey
     )

O  = r6Hash(effectiveOwnerPassword, ownerValidationSalt, U)
     || ownerValidationSalt || ownerKeySalt

OE = AES-256-CBC-NoPadding(
       key = r6Hash(effectiveOwnerPassword, ownerKeySalt, U),
       iv = 16 zero bytes,
       plaintext = fileKey
     )
```

`U` is the complete 48-byte value when supplied to the owner calculations.
`UE` and `OE` have no IV prefix and no padding; their mandated IV is all zero.
Salts are independent even when passwords are related.

### Permission word and `Perms`

Build `P` as an unsigned 32-bit bitset, then serialize it as a signed PDF
integer:

- bits 1 and 2 are zero;
- bits 3 and 12 use `printing`; bits 4, 5, 6, 9, and 11 use the independent
  `modify`, `copying`, `annotate`, `fillForms`, and `assemble` booleans;
- bit 10 is always one, allowing accessibility extraction. V1 does not expose
  an accessibility restriction unless ISO verification establishes that
  clearing it is meaningful and conforming for R6/PDF 2.0;
- bits 7, 8, and 13–32 are one.

Only the all-granted configuration produces `0xfffffffc`, serialized as `-4`.
Restricted configurations clear their applicable permission bits and therefore
produce different signed values. Use explicit unsigned operations (`>>> 0`)
and a dedicated `toSignedInt32`; never rely on an accidental JS bitwise sign
conversion.

Construct the 16-byte clear permissions block:

```text
bytes 0..3   P, little-endian two's-complement bytes
bytes 4..7   0xff 0xff 0xff 0xff
byte 8       ASCII "T" when EncryptMetadata is true, otherwise "F"
bytes 9..11  ASCII "a" "d" "b"
bytes 12..15 cryptographically random
```

`Perms = AES-256-ECB-NoPadding(fileKey, clearBlock)`.

**VERIFY (ISO):** recheck reserved permission bits (including the required
PDF 2.0/R6 treatment of accessibility bit 10), the `T`/`F` byte position,
`"adb"` casing, `Perms` byte layout, AES-ECB direction, and the requirement
that bytes 12–15 be random. ISO does not define a hierarchy among modification
bits 4/6/9/11; BoxPDF treats them as independent permissions. Add a
decrypt-and-validate unit test before any fixture is trusted.

## Object encryption

### AESV3 operation

For each eligible string value and stream payload:

1. obtain 16 fresh random IV bytes;
2. PKCS#7-pad plaintext to an AES block boundary (always append padding, so an
   already aligned or empty value receives a full 16-byte block);
3. AES-256-CBC encrypt using the 32-byte `fileKey`;
4. serialize `IV || ciphertext`.

For `/V 5`, `/R 6`, the object key is the file key itself. Object number and
generation are **not** mixed into it. The MD5-based
`fileKey || low24(obj) || low16(gen) || "sAlT"` derivation belongs to older
revisions and must not appear in v1. Object number/generation still determines
which indirect object owns nested strings and which xref entry is written, but
not its AES key.

Encryption occurs after stream filters/compression. `/Length` is updated to the
encrypted payload length, including the IV and padding.

### Ownership and recursion

An indirect object is serialized with `(PDFRef, PDFObject, EncryptionContext)`.
All literal and hexadecimal strings recursively contained in its direct arrays
and dictionaries use that indirect object's context. Indirect references are
written as references; their targets are encrypted when those targets are
serialized under their own refs. Names, numbers, booleans, nulls, keywords,
dictionary keys, and references are never encrypted.

Encrypted strings are emitted as hex strings regardless of their original
literal/hex syntax. Encryption consumes the decoded string bytes:
`PDFString.asBytes()` or `PDFHexString.asBytes()`, not the escaped source
spelling.

### Explicit exemptions

Do not encrypt:

- the encryption dictionary, including its string values;
- either `/ID` string in the trailer/xref dictionary;
- the cross-reference table, trailer syntax, `startxref`, or EOF marker;
- a cross-reference stream's dictionary strings or stream bytes;
- the metadata payload or payloads within the verified Standard Security
  Handler exemption when `encryptMetadata` is false.

**VERIFY (ISO):** enumerate the complete ISO 32000-2:2020 §7.6.2 exception
list, including any signature-related strings and unencrypted wrapper
provisions, before finalizing `shouldEncryptString` and
`shouldEncryptStream`. This remains necessary for a complete conforming writer,
but v1 rejects every document with an existing signature before serialization;
it does not use a signature exemption to rewrite signed input.

The encryption dictionary and catalog are never placed in an object stream.
The PDF 2.0 errata explicitly requires the catalog to remain outside object
streams for encrypted documents.

### Object streams

A `PDFObjectStream` contains the plaintext serialization of its member objects.
Do **not** encrypt member strings individually. Compress the complete object
stream first, then encrypt the object stream payload once under the object
stream's indirect ref. On decryption, a reader decrypts/decompresses the stream
before parsing member objects.

Streams and the encryption dictionary cannot be members of an object stream;
member generation numbers must be zero. The local writer also keeps the catalog
uncompressed. QPDF documents these restrictions and the encrypted-catalog
interoperability issue.

### Cross-reference streams and trailers

Cross-reference streams are always unencrypted even though they are stream
objects. Their dictionaries carry trailer keys including `/Root`, `/Encrypt`,
`/Info`, `/ID`, and `/Size`; strings in that dictionary remain clear. Offsets
are calculated from final encrypted byte lengths.

The encryption dictionary is referenced by `/Encrypt` but is not itself
encrypted or compressed. A classic xref/trailer path follows the same
exemptions. V1 defaults to object streams plus a cross-reference stream; tests
also exercise `useObjectStreams: false`.

### Metadata and embedded files

`encryptMetadata: true` encrypts metadata normally. `false` leaves clear the
metadata payload or payloads covered by the Standard Security Handler's
verified exemption while keeping all other eligible streams and ordinary
strings, including the Info dictionary, encrypted.

**VERIFY (ISO):** determine the complete scope and identification rule for the
metadata exemption, including whether it applies only to the catalog-referenced
document-level metadata stream, how other metadata streams are treated, and
whether strings in an exempt stream dictionary remain governed by `/StrF`.
Do not settle implementation on catalog-reference-only detection (or on
`/Type /Metadata` shape alone) until this is resolved.

Embedded-file stream payloads use `/StdCF` through `/EFF /StdCF` and are
encrypted like all other eligible streams. This is wire-format handling only;
it does not add an attachment API or promise imported-file support.

## Architecture

### Why writer-time encryption is mandatory

Encryption depends on the owning indirect reference, decoded string value,
post-filter stream bytes, object-stream membership, and semantic exemptions.
AES changes every encrypted value's length, which changes subsequent xref
offsets and stream `/Length` values. The `/Encrypt` reference and IDs must also
be present when the final trailer/xref stream is built.

A post-save object traversal has already lost reliable ownership and
object-stream boundaries; a byte search cannot distinguish syntax from stream
data or safely rewrite offsets. It would also materialize an extra
whole-document buffer and break `streamFlow`. Post-save encryption is therefore
forbidden by design.

### pdf-lib integration

pdf-lib 1.17's writers expose no encryption hook. `PDFWriter` and
`PDFStreamWriter` call `object.copyBytesInto()` without passing the owning
`PDFRef`, and compute buffer sizes before serialization. `PDFObject` methods
also recursively serialize child strings with no encryption context. Subclassing
one writer is insufficient.

The local writer will:

- call the public `PDFDocument.flush()` and read `pdf.context`;
- use public pdf-lib object classes and `asBytes()`/`getContents()` accessors;
- reproduce the small amount of writer orchestration needed for headers,
  indirect-object framing, optional object streams, xref, trailer, and offsets;
- route every object through BoxPDF's recursive serializer;
- share framing/encryption/exemption code with `streamFlow`;
- not patch `PDFObject.prototype`, access Node-only crypto, or fork pdf-lib.

Reliance on `PDFDocument.context` and some writer-adjacent pdf-lib structures is
an acknowledged version-coupling risk already present in `src/stream.ts`.
Keep the `pdf-lib` peer range at `^1.17.0` for v1 and add a compatibility test
against the minimum and current 1.17.x versions.

### Anticipated file plan

```text
src/
  encryption/
    aes.ts                 AES-128/256 block, CBC, ECB, PKCS#7
    sha2.ts                SHA-256/384/512
    saslprep.ts            RFC 3454/4013 Unicode-3.2 preparation
    saslprep-tables.ts     generated, reviewed range tables
    r6.ts                  Algorithm 2.B, U/O/UE/OE/Perms
    permissions.ts         public options -> P
    random.ts              production entropy + internal interface
    serialize.ts           recursive strings/streams and exemptions
    writer.ts              buffered writer/xref/object-stream orchestration
    types.ts               public and internal types/errors
  save.ts                  savePdf lifecycle
  document.ts              helper option plumbing only
  stream.ts                shared writer primitives + encryption option
  index.ts                 value/type exports
test/
  encryption/
    aes.test.ts
    sha2.test.ts
    saslprep.test.ts
    r6.test.ts
    permissions.test.ts
    serialize.test.ts
    writer.test.ts
    interoperability.test.ts
    adversarial.test.ts
  runtime/
    encryption.browser.test.ts
fixtures/
  encryption/
    README.md
    vectors.json
    qpdf/
scripts/
  smoke-encryption-deno.ts
  smoke-encryption-worker.ts
  verify-encryption.mjs
```

Generation of `saslprep-tables.ts` is a development-time script or documented
one-off process; generated tables are committed. It must record the RFC source,
Unicode version, generation command, and checksum. It is not a runtime
dependency.

`src/index.ts` exports the `savePdf` value; the `PdfEncryptionError` value; and
the `PdfPermissions`, `PdfEncryptionOptions`, `SavePdfOptions`,
`FlowToPdfOptions`, `RenderToPdfOptions`, and `PdfEncryptionErrorCode` types.
The existing `StreamFlowOptions` export incorporates its new encryption field.
Runtime and declaration export inventories must agree in ESM and CJS. No new
package subpath or `tsup` entry is needed. `tsup.config.ts` remains ES2022
ESM/CJS with pdf-lib external. Bundle-size impact is measured because SHA-2,
AES, and Unicode tables are shipped to browsers; their self-contained
implementations require explicit security review, audit maintenance,
performance benchmarking, and bundle accounting. Tree-shaking must keep the
encryption implementation out of applications that never import an
encryption-capable save helper where feasible. If the main entry's static
exports prevent that, accept the measured v1 cost rather than adding a hidden
runtime dependency; a future `boxpdf/encryption` subpath requires a separate
API decision.

### Internal interfaces

Production code receives entropy only through:

```ts
interface RandomSource {
  fill(target: Uint8Array): void;
}

interface EncryptionContext {
  readonly fileKey: Uint8Array;
  readonly dictionaryRef: PDFRef;
  readonly encryptMetadata: boolean;
  readonly metadataRef?: PDFRef;
  readonly random: RandomSource;
}
```

`webCryptoRandomSource` is the only production instance. A deterministic
`RandomSource` is exported only from a test-support file excluded from package
exports and production bundles. Public options cannot provide entropy, salts,
keys, or IVs. Tests assert that package declarations and built exports contain
no random override.

## Error handling and secret hygiene

Export `PdfEncryptionError` as a runtime value and
`PdfEncryptionErrorCode` as a type:

```ts
export type PdfEncryptionErrorCode =
  | "INVALID_PASSWORD"
  | "PASSWORD_TOO_LONG"
  | "OWNER_PASSWORD_NOT_DISTINCT"
  | "SECURE_RANDOM_UNAVAILABLE"
  | "SIGNED_PDF_UNSUPPORTED"
  | "ENCRYPTED_INPUT_UNSUPPORTED"
  | "UNSUPPORTED_PDF_OBJECT"
  | "ENCRYPTION_SERIALIZATION_FAILED";

export class PdfEncryptionError extends Error {
  readonly code: PdfEncryptionErrorCode;
}
```

Messages identify the field and remedy but never its value, normalized form,
length in code points, derived bytes, key, salt, IV, or ciphertext. The
original low-level error may be attached as `cause` only if it contains no
secret material. No debug logging is added to crypto code.

Keep passwords as local variables, convert once to fresh `Uint8Array`s, and do
not attach options to the PDF context. In `finally`, overwrite mutable password
byte arrays, intermediate hashes, AES schedules, file keys, and clear
permission blocks where practical. JavaScript strings, engine copies, and GC
mean zeroization is best effort and must not be advertised as guaranteed.
Fixtures use conspicuously non-production test passwords.

Run the signed/encrypted-input preflight, validate all options, and finish
password preparation before `streamFlow` writes its header. Preflight must
precede security-material generation. Buffered saves reject atomically without
returning partial bytes.

## Performance and memory

R6 hashing is deliberately CPU-heavy and SHA-384/512 plus AES must be benchmarked
on the slowest supported Worker. Implementations avoid allocations inside AES
rounds and reuse a growable Algorithm 2.B workspace, but clarity and testability
win over clever micro-optimization.

The buffered writer computes encrypted objects once and records their final
bytes/lengths; it must not encrypt once for sizing and again for output because
that would consume different IVs. Peak memory target is no more than current
`pdf.save()` output plus one largest encrypted object and bounded writer
metadata.

`streamFlow` encrypts each object once immediately before its write and updates
the running byte offset from ciphertext length. It retains current
`O(shared resources + one page + object-stream batch + largest stream)` memory.
Run the existing streaming heap benchmark with and without encryption. The
release gate is no whole-document ciphertext buffer and no growth proportional
to page count beyond existing xref/page bookkeeping.

## Test and validation matrix

### Primitive and algorithm unit tests

| Area | Required coverage |
| --- | --- |
| AES | NIST AES-128 and AES-256 block/CBC vectors; ECB single block; zero IV; PKCS#7 empty, aligned, and unaligned inputs; invalid key/block rejection |
| SHA-2 | NIST SHA-256/384/512 empty, short, multi-block, and million-byte vectors; SHA-256 boundary lengths 55/56/63/64 bytes; SHA-384/512 boundary lengths 111/112/127/128 bytes |
| SASLprep | RFC 4013 examples; mapped spaces; soft hyphen/map-to-nothing; NFKC; prohibited controls/private-use/noncharacters/surrogates; Unicode-3.2 unassigned; RandALCat/LCat BiDi failures; unpaired JS surrogates |
| Password bounds | Caller password lengths 0, 1, 126, 127, and 128 prepared UTF-8 bytes; multibyte boundary; two source strings preparing equal; empty required password; supplied empty/equal owner rejection; omitted owner consumes and discards independently generated ASCII credential |
| Algorithm 2.B | fixed inputs for all three hash branches; exactly 64 and extended rounds; unsigned last byte; big-endian modulo; QPDF-matched known answers |
| R6 field sizing | Separately from hash padding boundaries: exact U/O 48-byte, UE/OE 32-byte, salts 8-byte, file-key 32-byte, `Perms` 16-byte, and internal 127-byte password-input boundary tests |
| Entries | U/O/UE/OE known answers; zero-IV/no-padding unwrap; all salts independently consumed |
| Permissions | every printing value and independent modify/copying/annotate/fillForms/assemble toggle; accessibility bit always allowed; signed `P`; all-granted `-4`; restricted values; decrypted 16-byte `Perms`; metadata byte |

Use a deterministic counter/HMAC-like fixture source only to supply recorded
bytes; do not use it as a model for production entropy.

### Writer/fixture tests

- one literal string, one hex string, nested strings in arrays/dictionaries,
  empty strings, binary strings, and Unicode text;
- uncompressed content/image/font/metadata/embedded-file streams;
- compression-before-encryption and correct encrypted `/Length`;
- 0-page (respecting `addDefaultPage`), 1-page, multipage, shared resources;
- `useObjectStreams` true and false; assert member strings are not
  double-encrypted;
- unencrypted encryption dictionary, xref stream, and trailer IDs; encrypted
  catalog strings while catalog remains uncompressed;
- metadata true/false with plaintext searches for unique XMP and Info markers;
- fresh IV per value: equal plaintext strings/streams have unequal ciphertext;
- generation number 0 and nonzero: same file key semantics, correct refs/xref;
- save the same document twice: both open, bytes/file keys/IVs differ;
- caller-owned `renderFlow` + `savePdf`, helper flows, and `streamFlow`;
- assert direct `pdf.save()` after `renderFlow` remains unencrypted;
- stream sink backpressure, abort, iterable failure, and failure before first
  byte;
- parse structural output without a password far enough to assert exemptions,
  but never treat BoxPDF's own parser assertions as interoperability proof.

No fixture containing only BoxPDF-produced output is sufficient. Commit:

1. an unencrypted minimal source and QPDF-encrypted R6 outputs created with
   recorded QPDF version/command;
2. deterministic BoxPDF fixtures verified by independent tools;
3. expected `qpdf --show-encryption` and `pdfinfo` summaries, not secrets.

### Adversarial tests

- tamper `/P`, `/Perms`, `/O`, `/U`, `/OE`, `/UE`, `/CFM`, `/StrF`, `/StmF`,
  `/EncryptMetadata`, IV, padding, xref offset, and encrypted stream length;
- missing secure random API; random source throwing or short-writing;
- prohibited SASLprep input, very long input, lone surrogate, bidi violation;
- same/empty owner password after normalization;
- empty required password and an overlength caller password, distinguished from
  normative R6 reader truncation vectors;
- existing signature dictionaries, detached `/ByteRange` objects, and signed
  AcroForm fields all reject with `SIGNED_PDF_UNSUPPORTED` before entropy is
  requested or a stream sink is written;
- existing encryption dictionary/reference and other recognized encrypted
  context markers reject with `ENCRYPTED_INPUT_UNSUPPORTED` before entropy is
  requested or a stream sink is written;
- object graph with cycles through indirect refs, deeply nested direct
  containers, unknown `PDFObject` subclass, and indirect encryption dictionary;
- a fake `/Type /XRef` ordinary stream must not gain an exemption merely from
  attacker-controlled shape; exemption is by writer-owned xref ref;
- metadata exemption identification tests are added only after the
  **VERIFY (ISO)** scope is resolved; do not encode catalog-reference-only
  behavior as an adversarial invariant;
- plaintext scans for unique page text, metadata, Info values, font names that
  are strings, and embedded bytes (names and structural numbers may remain).

### Interoperability and runtime matrix

Every release candidate runs:

| Producer/path | Password | Validators |
| --- | --- | --- |
| `flowToPdf` buffered/object streams | password, generated owner, wrong | QPDF, Poppler, pdf-lib rejection/ignore-encryption structure check |
| `renderToPdf` classic xref | password, supplied owner | QPDF, Poppler, Acrobat manual gate |
| caller-owned `renderFlow` + `savePdf` | password, supplied owner | QPDF decrypt/check, `pdftotext`, `pdftoppm` |
| encrypted `streamFlow` | password, generated/supplied owner | QPDF `--check`, Poppler render/text, Chrome/Firefox manual gate |
| metadata true/false | password | QPDF show-encryption and raw marker assertions |
| restricted permissions | password vs supplied owner | QPDF show-encryption; Poppler/Acrobat reported permissions |
| signed/encrypted contexts | not applicable; rejected pre-write | error-code, zero-entropy-consumption, and untouched-sink assertions |

Runtime smoke tests execute the same minimal encrypted fixture generation in:

- the minimum Node candidate (initially Node 18) and current Node LTS, in both
  ESM and CJS, specifically verifying unflagged global Web Crypto;
- Chromium and Firefox current;
- Cloudflare Worker local compatibility runtime, with no Node compatibility
  flags;
- current stable Deno using the published ESM package path.

For each, decrypt with an independently installed current QPDF, then run
`qpdf --check`, `pdfinfo`, `pdftotext`, and `pdftoppm`. Compare extracted text,
page count, and a rendered-page hash/tolerance to the unencrypted control.
Also use QPDF to produce an equivalent R6 file, decrypt it with Poppler, and
compare dictionary shapes/permissions rather than ciphertext.

Acrobat and built-in browser viewer checks are documented manual release gates
because they are not reliable CI dependencies. Test non-ASCII SASLprep
passwords separately; ASCII-only success does not validate normalization.

The validation script may invoke QPDF/Poppler as developer/CI tools. They are
never runtime dependencies or application subprocesses. This distinction does
not relax the production prohibition.

## Known edge cases

- The required `password` cannot be empty. Permission restrictions do not force
  callers to manage an owner credential: omission generates an unexposed,
  high-entropy internal credential that is never returned or retained.
- Owner access bypasses viewer permissions. A caller-supplied empty or prepared-
  equal owner password makes restrictions ineffective, so v1 rejects it.
- SASLprep can remove or transform characters. Equality and length checks occur
  after preparation.
- The 127-byte rule is bytes, not JavaScript `.length`; v1 rejects overflow
  instead of silently truncating.
- Permission behavior varies among viewers. BoxPDF always allows accessibility
  extraction in v1; other permissions are tested as encoded and reported, not
  as universally enforced.
- AES-CBC adds a full block to already aligned values and does not authenticate
  content.
- Object streams move strings inside an encrypted stream; plaintext inspection
  and per-string ciphertext expectations must account for this.
- Cleartext metadata applies only to the payload or payloads established by the
  resolved ISO exemption-scope ledger; the Info dictionary is still encrypted.
- A single huge stream can dominate `streamFlow` memory even though total page
  count does not.
- Re-saving creates new encryption material and invalidates byte-for-byte
  reproducibility unless the internal test entropy source is used.
- Existing digital signatures are not preserved: any detected signature
  dictionary or `/ByteRange` causes pre-write `SIGNED_PDF_UNSUPPORTED`.
- Existing encrypted input/document contexts cause pre-write
  `ENCRYPTED_INPUT_UNSUPPORTED`; BoxPDF adds no decryption.

## Licensing and provenance

QPDF is Apache-2.0 licensed. Implementation work may study its architecture and
behavior, but the BoxPDF code is to be independently written from ISO
algorithms and public RFC/NIST descriptions. Do not transliterate QPDF C++ or
copy its tests/comments wholesale. Record the QPDF release/commit used as an
oracle in fixture metadata.

If any QPDF code is ultimately copied or adapted rather than independently
implemented, stop the implementation, identify the exact lines and license
obligations, preserve required notices/attribution, and obtain maintainer
approval before merge. The current plan requires no copied QPDF code.

Primary references for implementation:

- ISO 32000-2:2020 §§7.5–7.6 and its
  [published errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html)
- [RFC 3454 (stringprep)](https://www.rfc-editor.org/rfc/rfc3454) and
  [RFC 4013 (SASLprep)](https://www.rfc-editor.org/rfc/rfc4013)
- NIST FIPS 180-4 (SHA-2), FIPS 197 (AES), and SP 800-38A (CBC/ECB)
- [QPDF encryption documentation](https://qpdf.readthedocs.io/en/stable/encryption.html),
  [object-stream rules](https://qpdf.readthedocs.io/en/stable/object-streams.html),
  and the pinned QPDF source release
- pdf-lib 1.17.1 `PDFWriter`, `PDFStreamWriter`, object, and stream source in
  the installed dependency

An accessible ISO draft is useful for locating text but is not the normative
release source. Any disagreement is resolved in this order: ISO 32000-2:2020
plus approved errata, referenced RFC/NIST standard, then interoperability
behavior in QPDF and other readers.

## Phased TDD implementation

Each phase begins with failing tests and ends with typecheck plus its focused
suite. Do not start writer integration while any **VERIFY (ISO)** item relevant
to that phase is unresolved.

### Phase 0 — specification ledger and fixtures

1. Pin ISO clauses/errata, QPDF version/commit, and NIST/RFC vectors in
   `fixtures/encryption/README.md`.
2. Create minimal QPDF R6 fixtures and record exact commands and tool versions.
3. Turn every **VERIFY (ISO)** item in this document into a checked ledger row
   with clause/table text paraphrase and a test name. Add a separate
   **VERIFY (runtime)** row for the minimum Node ESM/CJS global Web Crypto
   result.

```sh
qpdf --version
qpdf --encrypt test-user test-owner 256 -- \
  fixtures/encryption/source.pdf fixtures/encryption/qpdf/r6.pdf
qpdf --show-encryption --password=test-user \
  fixtures/encryption/qpdf/r6.pdf
```

### Phase 1 — primitives and password preparation

Write tests, then implement `sha2.ts`, `aes.ts`, `saslprep.ts`, and generated
tables. Cross-check all primitives against Web Crypto in tests only.

```sh
pnpm vitest run test/encryption/sha2.test.ts \
  test/encryption/aes.test.ts test/encryption/saslprep.test.ts
pnpm run typecheck
```

### Phase 2 — R6 entries and permissions

Write deterministic known-answer tests, then implement permissions, entropy,
the generated internal owner credential, Algorithm 2.B, U/O/UE/OE, and
`Perms`. Independently decrypt every generated entry in the test.

```sh
pnpm vitest run test/encryption/r6.test.ts \
  test/encryption/permissions.test.ts
pnpm run typecheck
```

### Phase 3 — recursive serializer

After resolving the complete encryption-exemption and metadata-scope ISO
ledger rows, test decoded literal/hex strings, nested ownership, streams,
object streams, xref/encryption/ID/metadata exemptions, lengths, IV uniqueness,
and unknown objects before implementing `serialize.ts`. Signed objects are
preflight rejection fixtures, not serializer-exemption fixtures.

```sh
pnpm vitest run test/encryption/serialize.test.ts \
  test/encryption/adversarial.test.ts
pnpm run typecheck
```

### Phase 4 — buffered writer and API

Implement the fail-closed signed/encrypted-context preflight, local writer, and
`savePdf`, then wire `flowToPdf` and `renderToPdf`. Assert preflight precedes
entropy and output. Export the complete value/type inventory from
`src/index.ts`. Preserve existing unencrypted tests.

```sh
pnpm vitest run test/encryption/writer.test.ts test/dx.test.ts \
  test/render.test.ts test/page.test.ts
pnpm run typecheck
pnpm run build
```

Inspect `dist/index.js`, `dist/index.cjs`, and `dist/index.d.ts` for forbidden
Node built-ins, test hooks, accidental secrets, and correct exports. Measure
packed/bundled size against the prior release.

### Phase 5 — streaming integration

Refactor `src/stream.ts` to use the shared framing and recursive serializer;
add `StreamFlowOptions.encryption`. Encryption parameters and `/Encrypt` must be
known before the header, while xref offsets remain based on emitted ciphertext.

```sh
pnpm vitest run test/stream.test.ts test/encryption/writer.test.ts
node --import tsx scripts/bench-memory.ts
pnpm run typecheck
```

Add an encrypted mode to the memory benchmark rather than creating an
unreviewed one-off benchmark.

### Phase 6 — independent interoperability

Implement `scripts/verify-encryption.mjs` to generate every API/path variant
and invoke pinned CI QPDF/Poppler tools. The script is never imported by
production code.

```sh
pnpm run build
node scripts/verify-encryption.mjs
pnpm vitest run test/encryption/interoperability.test.ts
pnpm run test
pnpm run typecheck
pnpm run build
```

Run Worker, Deno, the candidate minimum Node, browser, and manual Acrobat checks
from the matrix. The initial Node 18 probe is diagnostic: if either shipped
module format lacks unflagged global Web Crypto, raise the supported minimum.
The anticipated direct runtime commands are:

```sh
npx -y node@18 scripts/verify-encryption.mjs --runtime-smoke-only
pnpm vitest run --browser test/runtime/encryption.browser.test.ts
pnpm exec wrangler dev scripts/smoke-encryption-worker.ts --local
deno run --allow-read --allow-write scripts/smoke-encryption-deno.ts
```

Pin the browser provider, Wrangler, Deno, QPDF, and Poppler versions in CI
rather than relying on the floating tools implied by these developer commands.

## Acceptance and release gates

Encryption ships only when all of the following are true:

- every **VERIFY (ISO)** item is resolved in the ledger and reflected by a
  named test;
- no forbidden technology or new runtime service/native/WASM dependency exists;
- primitive known-answer, R6, serialization, adversarial, and existing BoxPDF
  suites pass;
- user and owner passwords open all four output paths; wrong passwords fail;
- QPDF `--check`, Poppler text/render, Acrobat, Chromium, and Firefox accept
  representative files;
- permissions and metadata true/false are independently reported/observed as
  configured;
- the verified minimum Node version in both ESM and CJS, plus browser, Worker,
  and Deno smoke tests pass without Node polyfills or Node-specific crypto; if
  Node 18 fails this gate, the declared minimum has been raised;
- encrypted `streamFlow` preserves bounded memory and abort/backpressure
  behavior;
- production exports contain no deterministic entropy/key injection;
- errors/logs/fixtures contain no real secrets and messages never echo supplied
  passwords;
- output contains no unique plaintext string/stream markers except explicitly
  exempt metadata;
- signed and already-encrypted document contexts fail with their stable codes
  before entropy consumption and before any buffered/streamed output;
- package type declarations document that direct `pdf.save()` is unencrypted;
- license/provenance review confirms an independent implementation or includes
  all required notices for any identified adaptation;
- at least one reviewer familiar with PDF encryption checks the algorithms and
  a second reviewer checks writer exemptions and xref/object-stream behavior.

Failure of any gate keeps the API unreleased; there is no fallback to weak
encryption or post-processing.
