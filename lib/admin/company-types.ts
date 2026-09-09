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

export const COMPANY_SELECT =
  "id, name, slug, description, logo_url, website_url, whatsapp_number, is_active, card_title_short, card_image_url, card_image_public_id, card_icon, corporate_display_order, corporate_card_visible, card_coming_soon, card_route" as const;
