/**
 * Format a number as currency using `Intl.NumberFormat`. Defaults to
 * en-US / USD. `Intl` is available in Node 18+, Cloudflare Workers, Deno,
 * and browsers, so this helper runs everywhere `boxpdf` does.
 *
 * @example
 *   formatCurrency(22312.5);             // "$22,312.50"
 *   formatCurrency(99, { currency: "EUR", locale: "de-DE" }); // "99,00 €"
 */
export function formatCurrency(
  amount: number,
  options: { currency?: string; locale?: string } = {}
): string {
  const { currency = "USD", locale = "en-US" } = options;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
