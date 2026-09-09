const CORPORATE_PAGE_SLUGS = new Set([
  "home",
  "about",
  "companies",
  "global",
  "contact",
]);

export type CmsContext = {
  companySlug: string;
  pageKey: string;
  isCorporate: boolean;
};

/** Map a legacy content slug to CMS company + page keys. */
export function resolveCmsContext(legacySlug: string): CmsContext {
  if (CORPORATE_PAGE_SLUGS.has(legacySlug)) {
    return {
      companySlug: "corporate",
      pageKey: legacySlug,
      isCorporate: true,
    };
  }
  return {
    companySlug: legacySlug,
    pageKey: legacySlug,
    isCorporate: false,
  };
}

export function publicPathForPage(pageKey: string, isCorporate: boolean): string {
  if (isCorporate) {
    if (pageKey === "home") return "/";
    return `/${pageKey}`;
  }
  return `/companies/${pageKey}`;
}
