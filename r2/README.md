# Public reader fixtures

The live reader demo stores its PDF inputs in the `boxpdf-public-docs` R2 bucket and serves them
from `https://docs.boxpdf.dev`. R2 preserves HTTP range behavior, while the CORS policy exposes the
range and validator headers used by `@boxpdf/reader`.

Apply the policy:

```sh
pnpm dlx wrangler@latest r2 bucket cors set boxpdf-public-docs --file r2/cors.json
```

Upload a fixture with an explicit content type and public cache policy:

```sh
pnpm dlx wrangler@latest r2 object put boxpdf-public-docs/reader/example.pdf \
  --file path/to/example.pdf \
  --content-type application/pdf \
  --cache-control 'public, max-age=3600' \
  --remote
```

Cloudflare credentials belong in the ignored root `.env` as `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`.
