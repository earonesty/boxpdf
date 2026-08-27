# Repository context

BoxPDF and the sibling `streaming-pdf-reader` repository are complementary parts of the same document pipeline:

- `boxpdf` converts an HTML-like document model into PDF output.
- `streaming-pdf-reader` converts PDF input into a document model for HTML display and other rendering.

A local `streaming-pdf-reader` symlink may exist at the root of this repository as a navigation aid. It points to `../streaming-pdf-reader`, is intentionally excluded through `.git/info/exclude`, and must not be committed or treated as BoxPDF source.

When work crosses the writer/reader boundary, preserve the separation between repositories and make changes in the repository that owns that direction of the conversion.
