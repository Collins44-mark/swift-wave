export type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
};

export const COMPANY_SELECT =
  "id, name, slug, description, logo_url, website_url, whatsapp_number, is_active" as const;
