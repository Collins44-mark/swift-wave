/**
 * Company capability / module map — derived from docs/company-admin-audit.md
 * Navigation and routes are driven from this config (not scattered if/else).
 */

export type CompanyModuleKey =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "inquiries"
  | "form_options"
  | "route_hubs"
  | "website_content"
  | "corporate_profile"
  | "media"
  | "whatsapp"
  | "settings";

export type CompanyModuleDef = {
  key: CompanyModuleKey;
  label: string;
  /** Path segment under /admin/companies/[slug]/… ; empty = overview */
  path: string;
  /** When false, show Coming Soon (never pretend to work) */
  ready: boolean;
};

export type CompanyCapabilityProfile = {
  slug: string;
  label: string;
  model:
    | "ecommerce"
    | "lead_form"
    | "booking_form"
    | "corporate"
    | "coming_soon";
  modules: CompanyModuleDef[];
};

const SHARED_TAIL: CompanyModuleDef[] = [
  { key: "website_content", label: "Website Content", path: "website-content", ready: true },
  { key: "corporate_profile", label: "Corporate Profile", path: "corporate-profile", ready: true },
  { key: "whatsapp", label: "WhatsApp", path: "whatsapp", ready: true },
  { key: "settings", label: "Settings", path: "settings", ready: true },
];

const ECOMMERCE_MODULES: CompanyModuleDef[] = [
  { key: "overview", label: "Overview", path: "", ready: true },
  { key: "products", label: "Products", path: "products", ready: true },
  { key: "categories", label: "Categories", path: "categories", ready: true },
  { key: "orders", label: "Orders", path: "orders", ready: true },
  ...SHARED_TAIL,
];

const SCHOLARSHIP_MODULES: CompanyModuleDef[] = [
  { key: "overview", label: "Overview", path: "", ready: true },
  { key: "inquiries", label: "Applications", path: "inquiries", ready: true },
  { key: "form_options", label: "Form Options", path: "form-options", ready: true },
  ...SHARED_TAIL,
];

const FREIGHT_MODULES: CompanyModuleDef[] = [
  { key: "overview", label: "Overview", path: "", ready: true },
  { key: "inquiries", label: "Bookings", path: "inquiries", ready: true },
  { key: "route_hubs", label: "Route Hubs", path: "route-hubs", ready: true },
  ...SHARED_TAIL,
];

const COMING_SOON_MODULES: CompanyModuleDef[] = [
  { key: "overview", label: "Overview", path: "", ready: true },
  ...SHARED_TAIL,
];

const CORPORATE_MODULES: CompanyModuleDef[] = [
  { key: "overview", label: "Overview", path: "", ready: true },
  { key: "inquiries", label: "Contact Messages", path: "inquiries", ready: true },
  { key: "website_content", label: "Website Content", path: "website-content", ready: true },
  { key: "corporate_profile", label: "Corporate Profile", path: "corporate-profile", ready: true },
  { key: "settings", label: "Settings", path: "settings", ready: true },
];

export const COMPANY_CAPABILITIES: Record<string, CompanyCapabilityProfile> = {
  corporate: {
    slug: "corporate",
    label: "Corporate",
    model: "corporate",
    modules: CORPORATE_MODULES,
  },
  outfit: {
    slug: "outfit",
    label: "Outfit",
    model: "ecommerce",
    modules: ECOMMERCE_MODULES,
  },
  medical: {
    slug: "medical",
    label: "Medical",
    model: "ecommerce",
    modules: ECOMMERCE_MODULES,
  },
  scholarship: {
    slug: "scholarship",
    label: "Scholarship",
    model: "lead_form",
    modules: SCHOLARSHIP_MODULES,
  },
  freight: {
    slug: "freight",
    label: "Freight",
    model: "booking_form",
    modules: FREIGHT_MODULES,
  },
  travels: {
    slug: "travels",
    label: "Travels",
    model: "coming_soon",
    modules: COMING_SOON_MODULES,
  },
  catering: {
    slug: "catering",
    label: "Catering",
    model: "coming_soon",
    modules: COMING_SOON_MODULES,
  },
};

export function getCompanyCapabilities(
  slug: string
): CompanyCapabilityProfile {
  return (
    COMPANY_CAPABILITIES[slug] ?? {
      slug,
      label: slug,
      model: "coming_soon",
      modules: COMING_SOON_MODULES,
    }
  );
}

export function companyHasModule(
  slug: string,
  key: CompanyModuleKey
): boolean {
  const profile = getCompanyCapabilities(slug);
  return profile.modules.some((m) => m.key === key && m.ready);
}

export function companyModuleHref(slug: string, path: string): string {
  const base = `/admin/companies/${slug}`;
  return path ? `${base}/${path}` : base;
}
