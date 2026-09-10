export const PRODUCT_CURRENCIES = ["INR", "TZS", "USD", "EUR", "KES"] as const;

export type ProductCurrency = (typeof PRODUCT_CURRENCIES)[number];

export function isProductCurrency(value: string): value is ProductCurrency {
  return (PRODUCT_CURRENCIES as readonly string[]).includes(value);
}

/** Outfit sells in INR; other catalog companies keep the existing TZS default. */
export function defaultProductCurrency(companySlug: string): ProductCurrency {
  return companySlug === "outfit" ? "INR" : "TZS";
}
