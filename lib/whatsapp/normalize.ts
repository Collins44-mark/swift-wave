/**
 * Normalize a company WhatsApp number for wa.me links.
 * Digits-only international format — no +, spaces, or local-prefix guessing.
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

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return digits;
}

export function validateWhatsAppNumber(raw: string): {
  ok: true;
  normalized: string;
} | {
  ok: false;
  error: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "WhatsApp number is required." };
  }

  const normalized = normalizeWhatsAppNumber(trimmed);
  if (!normalized) {
    return {
      ok: false,
      error:
        "Enter a valid international WhatsApp number, including the country code.",
    };
  }

  return { ok: true, normalized };
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
