/**
 * Delivery-friendly hero image URLs for public pages.
 * Preserves aspect ratio via cover crop; avoids shipping full originals.
 */
export function optimizeHeroImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.includes("res.cloudinary.com")) {
    if (/\/upload\/[^/]*w_\d+/.test(trimmed)) return trimmed;
    return trimmed.replace(
      "/upload/",
      "/upload/w_2000,h_1200,c_fill,q_auto,f_auto/"
    );
  }

  if (trimmed.includes("images.unsplash.com")) {
    const hasParams = trimmed.includes("?");
    const params = "auto=format&fit=crop&w=2000&q=80";
    return hasParams ? `${trimmed}&${params}` : `${trimmed}?${params}`;
  }

  return trimmed;
}
