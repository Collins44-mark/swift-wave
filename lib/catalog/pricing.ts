export type DiscountType = "none" | "percent" | "fixed";

export function parseDiscountType(raw: string | null | undefined): DiscountType {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "percent" || value === "percentage") return "percent";
  if (value === "fixed") return "fixed";
  return "none";
}

export type DiscountBreakdown = {
  type: DiscountType;
  value: number;
  original: number;
  discountAmount: number;
  sale: number;
  label: string | null;
};

export function applyProductDiscount(
  price: number,
  typeInput: string | null | undefined,
  valueInput: number | string | null | undefined
): DiscountBreakdown {
  const original = Number.isFinite(price) && price > 0 ? price : 0;
  const type = parseDiscountType(typeInput);
  const rawValue = Number(valueInput);
  const value = Number.isFinite(rawValue) ? rawValue : 0;

  let discountAmount = 0;
  if (type === "percent") {
    const percent = Math.min(100, Math.max(0, value));
    discountAmount = (original * percent) / 100;
  } else if (type === "fixed") {
    discountAmount = Math.min(original, Math.max(0, value));
  }

  const sale = Math.max(0, original - discountAmount);
  const hasDiscount = type !== "none" && discountAmount > 0 && sale < original;

  return {
    type: hasDiscount ? type : "none",
    value: hasDiscount ? value : 0,
    original,
    discountAmount: hasDiscount ? discountAmount : 0,
    sale: hasDiscount ? sale : original,
    label: null,
  };
}

export function validateProductDiscount(
  price: number,
  typeInput: string | null | undefined,
  valueInput: number | string | null | undefined
): { ok: true; discount: DiscountBreakdown } | { ok: false; error: string } {
  const type = parseDiscountType(typeInput);
  if (type === "none") {
    return { ok: true, discount: applyProductDiscount(price, "none", 0) };
  }

  const rawValue = Number(valueInput);
  if (!Number.isFinite(rawValue)) {
    return { ok: false, error: "Enter a valid discount value." };
  }
  if (rawValue < 0) {
    return { ok: false, error: "Discount cannot be negative." };
  }
  if (type === "percent" && rawValue > 100) {
    return { ok: false, error: "Percentage discount cannot be more than 100." };
  }
  if (type === "fixed" && rawValue > price) {
    return { ok: false, error: "Fixed discount cannot be greater than the price." };
  }

  return { ok: true, discount: applyProductDiscount(price, type, rawValue) };
}

export function discountLabel(
  breakdown: DiscountBreakdown,
  currency: string
): string | null {
  if (breakdown.type === "none" || breakdown.discountAmount <= 0) return null;
  if (breakdown.type === "percent") {
    const percent = Number(breakdown.value);
    const shown = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
    return `${shown}% OFF`;
  }
  return `${currency} ${Math.round(breakdown.discountAmount).toLocaleString("en-US")} OFF`;
}

export function formatMoneyAmount(currency: string, amount: number): string {
  return `${currency} ${Number(amount).toLocaleString("en-US")}`;
}
