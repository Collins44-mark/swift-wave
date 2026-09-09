/**
 * Current public website content — migrated from content/*.html
 * Used by migration 009 and seed script.
 */

export type SeedRow = {
  companySlug: string;
  pageKey: string;
  sectionKey: string;
  sortOrder: number;
  content: Record<string, unknown>;
};

const FOOTER = {
  description:
    "International multi-division organization delivering world-class solutions across industries.",
  copyright: "© Swift Wave Group. All rights reserved.",
};

export const CMS_SEED_ROWS: SeedRow[] = [
  // ── HOME ──
  {
    companySlug: "corporate",
    pageKey: "home",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "International Multi-Division Organization",
      title: "Building Tomorrow<br class=\"hidden sm:block\"> Across Borders",
      subtitle:
        "Swift Wave Group delivers world-class solutions across education, logistics, fashion, healthcare, travel, and hospitality — connecting Africa to global opportunity.",
      primary_cta_label: "Explore Our Companies",
      primary_cta_url: "/companies",
      secondary_cta_label: "Partner With Us",
      secondary_cta_url: "/contact",
      image_url:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
      slides: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "home",
    sectionKey: "values",
    sortOrder: 2,
    content: {
      eyebrow: "Our Values",
      heading: "Why Choose Swift Wave",
      items: [
        {
          id: "global-reach",
          title: "Global Reach",
          description: "Operations spanning Africa, Asia, and the Middle East",
          icon: "globe",
          sort_order: 1,
          visible: true,
        },
        {
          id: "innovation",
          title: "Innovation Driven",
          description: "Modern systems that keep every division ahead",
          icon: "lightbulb",
          sort_order: 2,
          visible: true,
        },
        {
          id: "integrity",
          title: "Trusted Integrity",
          description: "Transparent partnerships built on lasting trust",
          icon: "shield-check",
          sort_order: 3,
          visible: true,
        },
        {
          id: "growth",
          title: "Sustainable Growth",
          description: "Long-term value for communities and clients",
          icon: "trending-up",
          sort_order: 4,
          visible: true,
        },
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "home",
    sectionKey: "global_teaser",
    sortOrder: 3,
    content: {
      eyebrow: "Worldwide Reach",
      heading: "Our Global Presence",
      legend_hq: "Tanzania · Dubai",
      legend_hub: "India · China",
      link_label: "View all locations →",
      link_url: "/global",
    },
  },
  {
    companySlug: "corporate",
    pageKey: "home",
    sectionKey: "footer",
    sortOrder: 99,
    content: FOOTER,
  },

  // ── ABOUT ──
  {
    companySlug: "corporate",
    pageKey: "about",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "About Us",
      title: "Who We Are",
      subtitle:
        "An international multi-division organization rooted in Tanzania, building bridges across industries and continents.",
      image_url:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
      slides: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80",
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "about",
    sectionKey: "story",
    sortOrder: 2,
    content: {
      heading: "Empowering Progress Across Borders",
      paragraph_1:
        "Swift Wave Group of Companies is a diversified international organization headquartered in Dar es Salaam, Tanzania. We operate six specialized divisions spanning education, freight logistics, fashion, healthcare, travel, and catering — each built to deliver excellence with local insight and global standards.",
      paragraph_2:
        "From scholarship pathways that unlock student potential, to freight networks linking East Africa with Dubai, India, and China, our mission is simple: create lasting value for people, partners, and communities.",
    },
  },
  {
    companySlug: "corporate",
    pageKey: "about",
    sectionKey: "stats",
    sortOrder: 3,
    content: {
      items: [
        { id: "countries", value: "15", label: "Countries Reached", sort_order: 1, visible: true },
        { id: "divisions", value: "6", label: "Business Divisions", sort_order: 2, visible: true },
        { id: "clients", value: "500", label: "Happy Clients", sort_order: 3, visible: true },
        { id: "projects", value: "1200", label: "Projects Delivered", sort_order: 4, visible: true },
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "about",
    sectionKey: "leadership",
    sortOrder: 4,
    content: {
      eyebrow: "Executive Team",
      heading: "Leadership",
      intro:
        "Experienced leaders guiding Swift Wave Group with vision, integrity, and a commitment to excellence.",
      closing_heading: "Guided by Shared Principles",
      closing_body:
        "Our leadership team brings together decades of experience in logistics, education, hospitality, and healthcare. Together, they ensure every Swift Wave company operates with accountability, innovation, and a people-first mindset.",
      items: [
        {
          id: "ceo",
          name: "James Mwangi",
          role: "Chief Executive Officer",
          bio: "Leads group strategy and international expansion across all six divisions.",
          image_url:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
          sort_order: 1,
          visible: true,
        },
        {
          id: "coo",
          name: "Amina Hassan",
          role: "Chief Operating Officer",
          bio: "Oversees day-to-day operations, quality standards, and cross-division collaboration.",
          image_url:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
          sort_order: 2,
          visible: true,
        },
        {
          id: "cco",
          name: "David Okello",
          role: "Chief Commercial Officer",
          bio: "Drives partnerships, client relations, and growth across freight, travel, and education.",
          image_url:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
          sort_order: 3,
          visible: true,
        },
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "about",
    sectionKey: "footer",
    sortOrder: 99,
    content: FOOTER,
  },

  // ── COMPANIES HUB ──
  {
    companySlug: "corporate",
    pageKey: "companies",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Our Companies",
      title: "Six Divisions. One Vision.",
      subtitle:
        "Each Swift Wave company operates with independent expertise while sharing our group values of integrity, innovation, and impact.",
      image_url:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80",
      slides: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "companies",
    sectionKey: "footer",
    sortOrder: 99,
    content: FOOTER,
  },

  // ── GLOBAL ──
  {
    companySlug: "corporate",
    pageKey: "global",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Worldwide Reach",
      title: "Our Global Presence",
      subtitle:
        "From our headquarters in Dar es Salaam, we connect partners and clients across Africa, the Middle East, and Asia.",
      image_url:
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80",
      slides: [
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80",
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "global",
    sectionKey: "locations",
    sortOrder: 2,
    content: {
      items: [
        {
          id: "dar",
          city: "Dar es Salaam",
          role: "Headquarters",
          description: "Home base for group leadership and all six operating divisions.",
          image_url:
            "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=800&q=80",
          image_alt: "Dar es Salaam skyline",
          sort_order: 1,
          visible: true,
        },
        {
          id: "dubai",
          city: "Dubai, UAE",
          role: "Regional Hub",
          description: "Freight corridors, travel partnerships, and Middle East trade links.",
          image_url:
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
          image_alt: "Dubai cityscape",
          sort_order: 2,
          visible: true,
        },
        {
          id: "india",
          city: "India",
          role: "Education Hub",
          description:
            "Scholarship pathways and university partnerships for international students.",
          image_url:
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
          image_alt: "India landmarks",
          sort_order: 3,
          visible: true,
        },
        {
          id: "china",
          city: "China",
          role: "Trade Hub",
          description: "Sourcing, supply chain, and import partnerships for African markets.",
          image_url:
            "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=800&q=80",
          image_alt: "China skyline",
          sort_order: 4,
          visible: true,
        },
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "global",
    sectionKey: "footer",
    sortOrder: 99,
    content: FOOTER,
  },

  // ── CONTACT ──
  {
    companySlug: "corporate",
    pageKey: "contact",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Get In Touch",
      title: "Contact Us",
      subtitle:
        "Whether you are a partner, client, or future team member — we would love to hear from you.",
      image_url:
        "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80",
      slides: [
        "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1556761175-4b46a572b136?auto=format&fit=crop&w=2000&q=80",
      ],
    },
  },
  {
    companySlug: "corporate",
    pageKey: "contact",
    sectionKey: "contact_info",
    sortOrder: 2,
    content: {
      email: "info@swiftwavegroup.com",
      phone: "+255 700 000 000",
      address: "Dar es Salaam, Tanzania",
      hours: "Mon – Fri, 8:00 AM – 5:00 PM EAT",
    },
  },
  {
    companySlug: "corporate",
    pageKey: "contact",
    sectionKey: "footer",
    sortOrder: 99,
    content: FOOTER,
  },

  // ── COMPANY PAGES ──
  {
    companySlug: "scholarship",
    pageKey: "scholarship",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Apply",
      title: "Swift Wave Scholarship",
      hint: "Fill the form — we receive it on WhatsApp",
      image_url:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80",
    },
  },
  {
    companySlug: "scholarship",
    pageKey: "scholarship",
    sectionKey: "form_intro",
    sortOrder: 2,
    content: {
      heading: "Application form",
      description: "Complete your details, then submit via WhatsApp.",
    },
  },
  {
    companySlug: "freight",
    pageKey: "freight",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Book",
      title: "Swift Wave Freight",
      hint: "Pick route & collection slots — send on WhatsApp",
      image_url:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80",
    },
  },
  {
    companySlug: "freight",
    pageKey: "freight",
    sectionKey: "form_intro",
    sortOrder: 2,
    content: {
      heading: "Freight booking",
      description:
        "Select where goods are picked up, where they're going, then choose a collection slot.",
    },
  },
  {
    companySlug: "outfit",
    pageKey: "outfit",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Shop",
      title: "Swift Wave Outfit",
      hint: "Men · Women · Footwear · Accessories",
      cta_label: "View cart",
      image_url:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80",
    },
  },
  {
    companySlug: "medical",
    pageKey: "medical",
    sectionKey: "hero",
    sortOrder: 1,
    content: {
      badge: "Shop",
      title: "Swift Wave Medical",
      hint: "Medical supplies, equipment & skin care",
      cta_label: "View cart",
      image_url:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80",
    },
  },
  {
    companySlug: "travels",
    pageKey: "travels",
    sectionKey: "coming_soon",
    sortOrder: 1,
    content: {
      eyebrow: "Swift Wave Travels",
      title: "Coming soon",
      body: "This division is not available yet. Redirecting to Our Companies…",
      cta_label: "Back to Companies",
      cta_url: "/companies",
    },
  },
  {
    companySlug: "catering",
    pageKey: "catering",
    sectionKey: "coming_soon",
    sortOrder: 1,
    content: {
      eyebrow: "Swift Wave Catering & Events",
      title: "Coming soon",
      body: "This division is not available yet. Redirecting to Our Companies…",
      cta_label: "Back to Companies",
      cta_url: "/companies",
    },
  },
];

export function getSeedSectionContent(
  companySlug: string,
  pageKey: string,
  sectionKey: string
): Record<string, unknown> | null {
  const row = CMS_SEED_ROWS.find(
    (r) =>
      r.companySlug === companySlug &&
      r.pageKey === pageKey &&
      r.sectionKey === sectionKey
  );
  return row?.content ?? null;
}
