export type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  card_title_short: string | null;
  card_image_url: string | null;
  card_image_public_id: string | null;
  card_icon: string | null;
  corporate_display_order: number;
  corporate_card_visible: boolean;
  card_coming_soon: boolean;
  card_route: string | null;
};

export const COMPANY_SELECT_CORE =
  "id, name, slug, description, logo_url, website_url, whatsapp_number, is_active" as const;

export const COMPANY_SELECT =
  "id, name, slug, description, logo_url, website_url, whatsapp_number, is_active, card_title_short, card_image_url, card_image_public_id, card_icon, corporate_display_order, corporate_card_visible, card_coming_soon, card_route" as const;

export function hydrateCompanyRecord(
  row: Partial<CompanyRecord> & {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
  }
): CompanyRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    logo_url: row.logo_url ?? null,
    website_url: row.website_url ?? null,
    whatsapp_number: row.whatsapp_number ?? null,
    is_active: row.is_active,
    card_title_short: row.card_title_short ?? null,
    card_image_url: row.card_image_url ?? null,
    card_image_public_id: row.card_image_public_id ?? null,
    card_icon: row.card_icon ?? null,
    corporate_display_order: row.corporate_display_order ?? 0,
    corporate_card_visible: row.corporate_card_visible ?? true,
    card_coming_soon: row.card_coming_soon ?? false,
    card_route: row.card_route ?? null,
  };
}
