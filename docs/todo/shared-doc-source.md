# Shared README / CLI Help Source

README and CLI help should pull shared API summary text from one canonical source.

Current drift example: the README documents flex-shrink, but the CLI guide still said flex-shrink was unsupported. A small generation step would be enough:

- keep shared "Important APIs" and "Known limits" copy in one source file
- have CLI help import/render that source
- have README generation splice the same content into marked sections
- add a check that generated README sections are current

Avoid a full docs framework unless the docs grow enough to need it.

README length is still acceptable while it is the primary API overview. Split when:

- examples or option tables start hiding the install/quickstart path
- the website, README, and CLI need the same long API sections
- release-specific docs need more than a short current-surface summary
