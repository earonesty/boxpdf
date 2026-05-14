import { describe, expect, it } from "vitest";
import { formatCurrency } from "../src/format.js";

describe("formatCurrency", () => {
  it("formats USD with thousand separators by default", () => {
    expect(formatCurrency(22312.5)).toBe("$22,312.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("respects currency option", () => {
    expect(formatCurrency(99.95, { currency: "GBP", locale: "en-GB" })).toBe("£99.95");
  });

  it("respects locale option (decimal separator)", () => {
    const out = formatCurrency(1234.56, { currency: "EUR", locale: "de-DE" });
    expect(out).toContain("1.234,56");
  });
});
