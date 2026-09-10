export type CompanySiteLinkInput = {
  slug: string;
  card_route?: string | null;
  website_url?: string | null;
  card_coming_soon?: boolean;
};

/**
 * Future subdomain mode is opt-in only.
 * DNS/Vercel subdomains are not configured yet, so production and preview
 * must keep using internal Next.js routes unless this flag is set.
 */
export function subdomainCompanyLinksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COMPANY_LINKS === "subdomains";
}

function internalCompanyPath(company: CompanySiteLinkInput): string {
  const route = company.card_route?.trim();
  if (route?.startsWith("/") && !route.startsWith("//")) {
    return route;
  }
  return `/companies/${company.slug}`;
}

/**
 * Public destination for a company card.
 * Default: internal /companies/{slug} (or card_route if it is a path).
 * Opt-in NEXT_PUBLIC_COMPANY_LINKS=subdomains: website_url, then slug host.
 */
export function companySiteHref(company: CompanySiteLinkInput): string {
  if (!subdomainCompanyLinksEnabled()) {
    return internalCompanyPath(company);
  }

  if (company.card_coming_soon) return "#";

  const configured = company.website_url?.trim();
  if (configured) return configured;

  const route = company.card_route?.trim();
  if (route?.startsWith("http://") || route?.startsWith("https://")) {
    return route;
  }

  return `https://${company.slug}.swiftwavegroup.com`;
}
