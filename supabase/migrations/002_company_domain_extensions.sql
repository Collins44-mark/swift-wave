-- =============================================================================
-- Swift Wave — Phase 6 domain extensions (audit-driven)
-- Migration: 002_company_domain_extensions.sql
-- =============================================================================

-- Nested categories (Outfit Men > Shirts, Medical Skin Care > Lotion, …)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);

-- Storefront fields used by Outfit/Medical public JS
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rating TEXT,
  ADD COLUMN IF NOT EXISTS price_label TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS products_sort_order_idx ON public.products (company_id, sort_order);

-- Inquiries: Scholarship applications + Freight bookings (and future lead forms)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  inquiry_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT inquiries_type_check
    CHECK (inquiry_type IN (
      'scholarship_application',
      'freight_booking',
      'general'
    )),
  CONSTRAINT inquiries_status_check
    CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS inquiries_company_id_idx ON public.inquiries (company_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS inquiries_type_idx ON public.inquiries (inquiry_type);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);

DROP TRIGGER IF EXISTS inquiries_set_updated_at ON public.inquiries;
CREATE TRIGGER inquiries_set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inquiries_select_company_members_or_super ON public.inquiries;
CREATE POLICY inquiries_select_company_members_or_super
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (public.belongs_to_company(company_id));

DROP POLICY IF EXISTS inquiries_manage_company_admin_or_super ON public.inquiries;
CREATE POLICY inquiries_manage_company_admin_or_super
  ON public.inquiries
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- Public website may create inquiries (anon) — only INSERT, no read of others
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.is_active = true
    )
  );

-- Public website may create orders (WhatsApp checkout capture)
DROP POLICY IF EXISTS orders_public_insert ON public.orders;
CREATE POLICY orders_public_insert
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.is_active = true
    )
  );

DROP POLICY IF EXISTS order_items_public_insert ON public.order_items;
CREATE POLICY order_items_public_insert
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      JOIN public.companies c ON c.id = o.company_id
      WHERE o.id = order_id AND c.is_active = true
    )
  );

-- Seed default company_settings payloads for form/hub config (merge-friendly)
UPDATE public.company_settings cs
SET settings = COALESCE(cs.settings, '{}'::jsonb) || jsonb_build_object(
  'scholarship_form', jsonb_build_object(
    'nationalities', jsonb_build_array('Tanzanian','Kenyan','Ugandan','Rwandan','Burundian','Other'),
    'destinations', jsonb_build_array('China','India','United Arab Emirates','United Kingdom','United States','Canada','Other'),
    'education_levels', jsonb_build_array('Diploma','Degree','Masters','PhD'),
    'fields_of_study', jsonb_build_array('Business','Music','Engineering','Medicine/Health','IT','Law','Education','Agriculture','Other')
  )
)
FROM public.companies c
WHERE cs.company_id = c.id AND c.slug = 'scholarship'
  AND NOT (cs.settings ? 'scholarship_form');

UPDATE public.company_settings cs
SET settings = COALESCE(cs.settings, '{}'::jsonb) || jsonb_build_object(
  'freight_hubs', jsonb_build_object(
    'China', jsonb_build_array(2,5),
    'Dubai (UAE)', jsonb_build_array(1,4),
    'India', jsonb_build_array(3,6),
    'Tanzania', jsonb_build_array(1,3,5),
    'Kenya', jsonb_build_array(2,4),
    'Other', jsonb_build_array(2,5)
  ),
  'freight_destinations', jsonb_build_array(
    'Tanzania (Dar es Salaam)','China','Dubai (UAE)','India','Kenya','Other'
  )
)
FROM public.companies c
WHERE cs.company_id = c.id AND c.slug = 'freight'
  AND NOT (cs.settings ? 'freight_hubs');

-- Coming-soon flags for Travels / Catering (keep company row manageable in admin)
UPDATE public.company_settings cs
SET settings = COALESCE(cs.settings, '{}'::jsonb) || jsonb_build_object(
  'coming_soon', true,
  'public_status', 'coming_soon'
)
FROM public.companies c
WHERE cs.company_id = c.id AND c.slug IN ('travels', 'catering')
  AND NOT (cs.settings ? 'coming_soon');
