/** Normalize a stored color value. Returns null when the value is missing or invalid. */
export function normalizeHex(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  const withHash = value.startsWith("#") ? value : `#${value}`;
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(withHash)) {
    return null;
  }
  let hex = withHash.toLowerCase();
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.slice(0, 7);
}

/** Expand 3-digit hex. Ignore the old unknown-color sentinel (#111/#111111). */
export function resolvedSwatchHex(
  hex: string | null | undefined
): string | null {
  const value = normalizeHex(hex);
  if (!value || value === "#111111") return null;
  return value;
}

export function isLightHex(hex: string | null | undefined): boolean {
  const value = normalizeHex(hex);
  if (!value) return false;
  const r = Number.parseInt(value.slice(1, 3), 16);
  const g = Number.parseInt(value.slice(3, 5), 16);
  const b = Number.parseInt(value.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.78;
}

export function swatchClassName(
  hex: string | null | undefined,
  extra = ""
): string {
  const resolved = resolvedSwatchHex(hex);
  const classes = ["sw-admin-color-dot"];
  if (!resolved) classes.push("is-missing");
  else if (isLightHex(resolved)) classes.push("is-light");
  if (extra) classes.push(extra);
  return classes.join(" ");
}

export function swatchStyle(
  hex: string | null | undefined
): { backgroundColor: string } | undefined {
  const resolved = resolvedSwatchHex(hex);
  return resolved ? { backgroundColor: resolved } : undefined;
}
