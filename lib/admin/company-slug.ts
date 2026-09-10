/** Normalize a company workspace slug from a route param. */
export function normalizeCompanySlug(raw: unknown): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded.trim().toLowerCase();
}
