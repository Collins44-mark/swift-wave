import type { CmsScopeDef } from "@/lib/cms/types";

const FOOTER_FIELDS = [
  { key: "description", label: "Footer description", type: "textarea" as const },
  { key: "copyright", label: "Copyright", type: "text" as const },
];

const HERO_IMAGE_FIELDS = [
  { key: "image_url", label: "Hero image", type: "image" as const },
  { key: "image_public_id", label: "Image public ID", type: "text" as const },
  { key: "alt_text", label: "Alt text", type: "text" as const },
];

const HERO_CORPORATE_FIELDS = [
  { key: "badge", label: "Eyebrow / badge", type: "text" as const },
  { key: "title", label: "Heading", type: "html" as const },
  { key: "subtitle", label: "Subheading", type: "textarea" as const },
  { key: "primary_cta_label", label: "Primary CTA label", type: "text" as const },
  { key: "primary_cta_url", label: "Primary CTA URL", type: "url" as const },
  { key: "secondary_cta_label", label: "Secondary CTA label", type: "text" as const },
  { key: "secondary_cta_url", label: "Secondary CTA URL", type: "url" as const },
  ...HERO_IMAGE_FIELDS,
];

const HERO_SLIDESHOW_FIELDS = [
  { key: "badge", label: "Eyebrow", type: "text" as const },
  { key: "title", label: "Heading", type: "text" as const },
  { key: "subtitle", label: "Subheading", type: "textarea" as const },
  ...HERO_IMAGE_FIELDS,
];

const HERO_COMPANY_FIELDS = [
  { key: "badge", label: "Badge", type: "text" as const },
  { key: "title", label: "Title", type: "text" as const },
  { key: "hint", label: "Hint / subtitle", type: "textarea" as const },
  { key: "cta_label", label: "CTA label", type: "text" as const },
  ...HERO_IMAGE_FIELDS,
];

export const CMS_SCOPES: Record<string, CmsScopeDef> = {
  corporate: {
    slug: "corporate",
    label: "Corporate / Group Website",
    isCorporate: true,
    pages: [
      {
        key: "home",
        label: "Home",
        route: "/",
        sections: [
          { key: "hero", label: "Hero", fields: HERO_CORPORATE_FIELDS },
          {
            key: "values",
            label: "Why Choose Us",
            fields: [
              { key: "eyebrow", label: "Eyebrow", type: "text" },
              { key: "heading", label: "Section heading", type: "text" },
            ],
            repeatable: true,
          },
          {
            key: "global_teaser",
            label: "Global Presence Teaser",
            fields: [
              { key: "eyebrow", label: "Eyebrow", type: "text" },
              { key: "heading", label: "Heading", type: "text" },
              { key: "legend_hq", label: "HQ legend", type: "text" },
              { key: "legend_hub", label: "Hub legend", type: "text" },
              { key: "link_label", label: "Link label", type: "text" },
              { key: "link_url", label: "Link URL", type: "url" },
            ],
          },
          { key: "footer", label: "Footer", fields: FOOTER_FIELDS },
        ],
      },
      {
        key: "about",
        label: "About",
        route: "/about",
        sections: [
          {
            key: "hero",
            label: "Hero",
            fields: HERO_SLIDESHOW_FIELDS,
          },
          {
            key: "story",
            label: "Story",
            fields: [
              { key: "heading", label: "Heading", type: "text" },
              { key: "paragraph_1", label: "Paragraph 1", type: "textarea" },
              { key: "paragraph_2", label: "Paragraph 2", type: "textarea" },
            ],
          },
          {
            key: "stats",
            label: "Stats",
            repeatable: true,
            fields: [
              { key: "value", label: "Value", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
          {
            key: "leadership",
            label: "Leadership",
            fields: [
              { key: "eyebrow", label: "Eyebrow", type: "text" },
              { key: "heading", label: "Heading", type: "text" },
              { key: "intro", label: "Intro", type: "textarea" },
            ],
            repeatable: true,
          },
          { key: "footer", label: "Footer", fields: FOOTER_FIELDS },
        ],
      },
      {
        key: "companies",
        label: "Companies Hub",
        route: "/companies",
        sections: [
          {
            key: "hero",
            label: "Hero",
            fields: HERO_SLIDESHOW_FIELDS,
          },
          { key: "footer", label: "Footer", fields: FOOTER_FIELDS },
        ],
      },
      {
        key: "global",
        label: "Global Presence",
        route: "/global",
        sections: [
          {
            key: "hero",
            label: "Hero",
            fields: HERO_SLIDESHOW_FIELDS,
          },
          {
            key: "locations",
            label: "Location Cards",
            repeatable: true,
            fields: [
              { key: "city", label: "City", type: "text" },
              { key: "role", label: "Role label", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image_url", label: "Image", type: "image" },
              { key: "image_alt", label: "Image alt", type: "text" },
            ],
          },
          { key: "footer", label: "Footer", fields: FOOTER_FIELDS },
        ],
      },
      {
        key: "contact",
        label: "Contact",
        route: "/contact",
        sections: [
          {
            key: "hero",
            label: "Hero",
            fields: HERO_SLIDESHOW_FIELDS,
          },
          {
            key: "contact_info",
            label: "Contact Information",
            fields: [
              { key: "email", label: "Email", type: "text" },
              { key: "phone", label: "Phone", type: "text" },
              { key: "address", label: "Address", type: "textarea" },
              { key: "hours", label: "Business hours", type: "text" },
            ],
          },
          { key: "footer", label: "Footer", fields: FOOTER_FIELDS },
        ],
      },
    ],
  },
  scholarship: {
    slug: "scholarship",
    label: "Scholarship",
    isCorporate: false,
    pages: [
      {
        key: "scholarship",
        label: "Scholarship Page",
        route: "/companies/scholarship",
        sections: [
          { key: "hero", label: "Hero", fields: HERO_COMPANY_FIELDS },
          {
            key: "form_intro",
            label: "Application Form Intro",
            fields: [
              { key: "heading", label: "Form heading", type: "text" },
              { key: "description", label: "Form description", type: "textarea" },
            ],
          },
        ],
      },
    ],
  },
  freight: {
    slug: "freight",
    label: "Freight",
    isCorporate: false,
    pages: [
      {
        key: "freight",
        label: "Freight Page",
        route: "/companies/freight",
        sections: [
          { key: "hero", label: "Hero", fields: HERO_COMPANY_FIELDS },
          {
            key: "form_intro",
            label: "Booking Form Intro",
            fields: [
              { key: "heading", label: "Form heading", type: "text" },
              { key: "description", label: "Form description", type: "textarea" },
            ],
          },
        ],
      },
    ],
  },
  outfit: {
    slug: "outfit",
    label: "Outfit",
    isCorporate: false,
    pages: [
      {
        key: "outfit",
        label: "Outfit Shop",
        route: "/companies/outfit",
        sections: [{ key: "hero", label: "Hero", fields: HERO_COMPANY_FIELDS }],
      },
    ],
  },
  medical: {
    slug: "medical",
    label: "Medical Aid",
    isCorporate: false,
    pages: [
      {
        key: "medical",
        label: "Medical Shop",
        route: "/companies/medical",
        sections: [{ key: "hero", label: "Hero", fields: HERO_COMPANY_FIELDS }],
      },
    ],
  },
  travels: {
    slug: "travels",
    label: "Travels & Tours",
    isCorporate: false,
    pages: [
      {
        key: "travels",
        label: "Travels",
        route: "/companies/travels",
        sections: [
          {
            key: "coming_soon",
            label: "Coming Soon",
            fields: [
              { key: "eyebrow", label: "Eyebrow", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
              { key: "cta_label", label: "Button label", type: "text" },
              { key: "cta_url", label: "Button URL", type: "url" },
            ],
          },
        ],
      },
    ],
  },
  catering: {
    slug: "catering",
    label: "Catering & Events",
    isCorporate: false,
    pages: [
      {
        key: "catering",
        label: "Catering",
        route: "/companies/catering",
        sections: [
          {
            key: "coming_soon",
            label: "Coming Soon",
            fields: [
              { key: "eyebrow", label: "Eyebrow", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
              { key: "cta_label", label: "Button label", type: "text" },
              { key: "cta_url", label: "Button URL", type: "url" },
            ],
          },
        ],
      },
    ],
  },
};

export function getCmsScope(slug: string): CmsScopeDef | null {
  return CMS_SCOPES[slug] ?? null;
}

export function getCmsPage(scopeSlug: string, pageKey: string) {
  const scope = getCmsScope(scopeSlug);
  return scope?.pages.find((p) => p.key === pageKey) ?? null;
}
