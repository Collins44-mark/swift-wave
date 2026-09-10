import { createClient } from "@/lib/supabase/server";

export type CorporateCompanyCard = {
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  card_title_short: string | null;
  card_image_url: string | null;
  card_icon: string | null;
  card_route: string | null;
  card_coming_soon: boolean;
};

const CORPORATE_CARD_SELECT =
  "name, slug, description, website_url, card_title_short, card_image_url, card_icon, card_route, card_coming_soon, corporate_display_order, corporate_card_visible" as const;

const LEGACY_CARD_DEFAULTS: Record<
  string,
  Pick<
    CorporateCompanyCard,
    "card_title_short" | "card_image_url" | "card_icon" | "card_route" | "card_coming_soon"
  >
> = {
  scholarship: {
    card_title_short: "Scholarship",
    card_icon: "graduation-cap",
    card_image_url:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    card_route: "/companies/scholarship",
    card_coming_soon: false,
  },
  freight: {
    card_title_short: "Freight",
    card_icon: "truck",
    card_image_url:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    card_route: "/companies/freight",
    card_coming_soon: false,
  },
  outfit: {
    card_title_short: "Outfit",
    card_icon: "shirt",
    card_image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    card_route: "/companies/outfit",
    card_coming_soon: false,
  },
  medical: {
    card_title_short: "Medical",
    card_icon: "heart-pulse",
    card_image_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    card_route: "/companies/medical",
    card_coming_soon: false,
  },
  travels: {
    card_title_short: "Travels",
    card_icon: "plane",
    card_image_url:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    card_route: null,
    card_coming_soon: true,
  },
  catering: {
    card_title_short: "Catering",
    card_icon: "utensils",
    card_image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    card_route: null,
    card_coming_soon: true,
  },
};

const LEGACY_ORDER = [
  "scholarship",
  "freight",
  "outfit",
  "medical",
  "travels",
  "catering",
];

function withLegacyDefaults(
  row: Pick<CorporateCompanyCard, "name" | "slug" | "description"> &
    Partial<CorporateCompanyCard>
): CorporateCompanyCard {
  const defaults = LEGACY_CARD_DEFAULTS[row.slug] ?? {
    card_title_short: null,
    card_icon: "building-2",
    card_image_url: null,
    card_route: `/companies/${row.slug}`,
    card_coming_soon: false,
  };

  return {
    name: row.name,
    slug: row.slug,
    description: row.description,
    website_url: row.website_url ?? null,
    card_title_short: row.card_title_short ?? defaults.card_title_short,
    card_image_url: row.card_image_url ?? defaults.card_image_url,
    card_icon: row.card_icon ?? defaults.card_icon,
    card_route: row.card_route ?? defaults.card_route,
    card_coming_soon: row.card_coming_soon ?? defaults.card_coming_soon,
  };
}

/**
 * Active companies shown on the corporate /companies page, ordered for display.
 */
export async function getCorporateCompanyCards(): Promise<CorporateCompanyCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select(CORPORATE_CARD_SELECT)
    .eq("is_active", true)
    .eq("corporate_card_visible", true)
    .in("slug", LEGACY_ORDER)
    .order("corporate_display_order", { ascending: true })
    .order("name", { ascending: true });

  if (!error && data?.length) {
    return (data as CorporateCompanyCard[]).map((row) => withLegacyDefaults(row));
  }

  if (error) {
    console.error("[getCorporateCompanyCards]", error.message);
  }

  const { data: legacyRows, error: legacyError } = await supabase
    .from("companies")
    .select("name, slug, description")
    .eq("is_active", true)
    .in("slug", LEGACY_ORDER)
    .order("name", { ascending: true });

  if (legacyError || !legacyRows?.length) {
    if (legacyError) console.error("[getCorporateCompanyCards:fallback]", legacyError.message);
    return [];
  }

  return legacyRows
    .map((row) => withLegacyDefaults(row))
    .sort(
      (a, b) =>
        LEGACY_ORDER.indexOf(a.slug) - LEGACY_ORDER.indexOf(b.slug) ||
        a.name.localeCompare(b.name)
    );
}
