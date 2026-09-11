/** Simple slugify for product/category names. */
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
