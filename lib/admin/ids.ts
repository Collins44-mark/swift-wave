const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_BULK_DELETE = 100;

export function uniqueValidIds(ids: string[]): string[] {
  const seen = new Set<string>();
  for (const raw of ids) {
    const id = String(raw ?? "").trim();
    if (!UUID_RE.test(id) || seen.has(id)) continue;
    seen.add(id);
  }
  return [...seen];
}
