/** Public pages with a hero/banner image — used by admin hero hub and hydration. */

export type HeroPageType = "static" | "slideshow" | "shop";

export type HeroPageDef = {
  label: string;
  pageKey: string;
  companySlug: string;
  route: string;
  isCorporate: boolean;
  heroType: HeroPageType;
};

export const CORPORATE_HERO_PAGES: HeroPageDef[] = [
  {
    label: "Homepage Hero",
    pageKey: "home",
    companySlug: "corporate",
    route: "/",
    isCorporate: true,
    heroType: "static",
  },
  {
    label: "About Hero",
    pageKey: "about",
    companySlug: "corporate",
    route: "/about",
    isCorporate: true,
    heroType: "slideshow",
  },
  {
    label: "Companies Hero",
    pageKey: "companies",
    companySlug: "corporate",
    route: "/companies",
    isCorporate: true,
    heroType: "slideshow",
  },
  {
    label: "Global Hero",
    pageKey: "global",
    companySlug: "corporate",
    route: "/global",
    isCorporate: true,
    heroType: "slideshow",
  },
  {
    label: "Contact Hero",
    pageKey: "contact",
    companySlug: "corporate",
    route: "/contact",
    isCorporate: true,
    heroType: "slideshow",
  },
];

export const COMPANY_HERO_PAGES: HeroPageDef[] = [
  {
    label: "Scholarship Hero",
    pageKey: "scholarship",
    companySlug: "scholarship",
    route: "/companies/scholarship",
    isCorporate: false,
    heroType: "shop",
  },
  {
    label: "Freight Hero",
    pageKey: "freight",
    companySlug: "freight",
    route: "/companies/freight",
    isCorporate: false,
    heroType: "shop",
  },
  {
    label: "Outfit Hero",
    pageKey: "outfit",
    companySlug: "outfit",
    route: "/companies/outfit",
    isCorporate: false,
    heroType: "shop",
  },
  {
    label: "Medical Aid Hero",
    pageKey: "medical",
    companySlug: "medical",
    route: "/companies/medical",
    isCorporate: false,
    heroType: "shop",
  },
];

export function getHeroPage(
  companySlug: string,
  pageKey: string
): HeroPageDef | null {
  return (
    [...CORPORATE_HERO_PAGES, ...COMPANY_HERO_PAGES].find(
      (p) => p.companySlug === companySlug && p.pageKey === pageKey
    ) ?? null
  );
}

export function heroPagesForCompany(companySlug: string): HeroPageDef[] {
  if (companySlug === "corporate") return CORPORATE_HERO_PAGES;
  return COMPANY_HERO_PAGES.filter((p) => p.companySlug === companySlug);
}

/** Default slideshow URLs preserved from legacy HTML (fallback when CMS record missing). */
export const DEFAULT_HERO_SLIDES: Record<string, string[]> = {
  about: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80",
  ],
  companies: [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
  ],
  global: [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80",
  ],
  contact: [
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b136?auto=format&fit=crop&w=2000&q=80",
  ],
};
