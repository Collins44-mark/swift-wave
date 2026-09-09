/**
 * Normalize a company WhatsApp number for wa.me links.
 * Accepts international numbers (e.g. 255754123456) or local mobile with
 * leading 0 (e.g. 0754123456 → 255754123456).
 */
export function normalizeWhatsAppNumber(
  input: string | null | undefined
): string | null {
  if (input == null) return null;

  let digits = String(input).replace(/\D/g, "");
  if (!digits) return null;

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (!digits) return null;

  // Local mobile without country code (e.g. 754123456 after removing 0).
  if (digits.length === 9) {
    digits = `255${digits}`;
  }

  if (digits.length < 10 || digits.length > 15 || digits.startsWith("0")) {
    return null;
  }

  return digits;
}

export function buildWhatsAppUrl(
  input: string | null | undefined,
  message?: string
): string | null {
  const normalized = normalizeWhatsAppNumber(input);
  if (!normalized) return null;

  const base = `https://wa.me/${normalized}`;
  if (message == null || message === "") return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_UNAVAILABLE_MESSAGE =
  "WhatsApp ordering is currently unavailable.";
