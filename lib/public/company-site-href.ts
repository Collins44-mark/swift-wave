export type CompanySiteLinkInput = {
  slug: string;
  card_route?: string | null;
  website_url?: string | null;
  card_coming_soon?: boolean;
};

function preferLocalPaths(): boolean {
  if (process.env.NEXT_PUBLIC_COMPANY_LINKS === "subdomains") return false;
  if (process.env.NEXT_PUBLIC_COMPANY_LINKS === "paths") return true;
  return process.env.NODE_ENV !== "production";
}

/**
 * Public destination for a company card.
 * Local/dev keeps path routes (/companies/{slug}).
 * Production uses website_url, then slug.swiftwavegroup.com.
 */
export function companySiteHref(company: CompanySiteLinkInput): string {
  if (company.card_coming_soon) return "#";

  if (preferLocalPaths()) {
    const route = company.card_route?.trim();
    if (route) return route;
    return `/companies/${company.slug}`;
  }

  const configured = company.website_url?.trim();
  if (configured) return configured;

  const route = company.card_route?.trim();
  if (route?.startsWith("http://") || route?.startsWith("https://")) {
    return route;
  }

  return `https://${company.slug}.swiftwavegroup.com`;
}
