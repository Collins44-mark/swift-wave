-- =============================================================================
-- Swift Wave Group — Initial schema, RLS, helpers, indexes, and company seeds
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  whatsapp_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS companies_slug_idx ON public.companies (slug);

DROP TRIGGER IF EXISTS companies_set_updated_at ON public.companies;
CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin', 'company_admin', 'staff')),
  CONSTRAINT profiles_company_required_for_non_super_admin
    CHECK (role = 'super_admin' OR company_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT categories_company_slug_unique UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS categories_company_id_idx ON public.categories (company_id);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories (slug);

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'TZS',
  image_url TEXT,
  image_public_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT products_status_check
    CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT products_company_slug_unique UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS products_company_id_idx ON public.products (company_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products (status);

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT,
  customer_email TEXT,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TZS',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT orders_status_check
    CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS orders_company_id_idx ON public.orders (company_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items (price/name snapshots)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- website_content (JSONB CMS sections)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT website_content_status_check
    CHECK (status IN ('draft', 'published')),
  CONSTRAINT website_content_company_page_section_unique
    UNIQUE (company_id, page_key, section_key)
);

CREATE INDEX IF NOT EXISTS website_content_company_id_idx
  ON public.website_content (company_id);
CREATE INDEX IF NOT EXISTS website_content_page_key_idx
  ON public.website_content (page_key);

DROP TRIGGER IF EXISTS website_content_set_updated_at ON public.website_content;
CREATE TRIGGER website_content_set_updated_at
  BEFORE UPDATE ON public.website_content
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- company_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies (id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS company_settings_company_id_idx
  ON public.company_settings (company_id);

DROP TRIGGER IF EXISTS company_settings_set_updated_at ON public.company_settings;
CREATE TRIGGER company_settings_set_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth / role helper functions (SECURITY DEFINER — bypass RLS safely)
-- search_path pinned to public to avoid privilege escalation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_profile_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.company_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
      AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'company_admin'
      AND p.is_active = true
      AND p.company_id IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'staff'
      AND p.is_active = true
      AND p.company_id IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.belongs_to_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR public.current_profile_company_id() = target_company_id
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR (
        public.is_company_admin()
        AND public.current_profile_company_id() = target_company_id
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- Grants for helper functions used by RLS policies
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_profile_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_profile_company_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_company_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.belongs_to_company(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_company(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_profile_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_profile_company_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.belongs_to_company(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_company(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS on all application tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS: companies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS companies_public_select_active ON public.companies;
CREATE POLICY companies_public_select_active
  ON public.companies
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_super_admin() OR public.belongs_to_company(id));

DROP POLICY IF EXISTS companies_super_admin_insert ON public.companies;
CREATE POLICY companies_super_admin_insert
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS companies_super_admin_update ON public.companies;
CREATE POLICY companies_super_admin_update
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS companies_super_admin_delete ON public.companies;
CREATE POLICY companies_super_admin_delete
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- RLS: profiles (no public access; avoid recursive policies)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_own_or_super_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_super_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS profiles_super_admin_insert ON public.profiles;
CREATE POLICY profiles_super_admin_insert
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS profiles_super_admin_update ON public.profiles;
CREATE POLICY profiles_super_admin_update
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS profiles_super_admin_delete ON public.profiles;
CREATE POLICY profiles_super_admin_delete
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- RLS: categories
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS categories_select_company_members_or_super ON public.categories;
CREATE POLICY categories_select_company_members_or_super
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (public.belongs_to_company(company_id));

DROP POLICY IF EXISTS categories_manage_company_admin_or_super ON public.categories;
CREATE POLICY categories_manage_company_admin_or_super
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- ---------------------------------------------------------------------------
-- RLS: products
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS products_public_select_published ON public.products;
CREATE POLICY products_public_select_published
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    OR public.belongs_to_company(company_id)
  );

DROP POLICY IF EXISTS products_manage_company_admin_or_super ON public.products;
CREATE POLICY products_manage_company_admin_or_super
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- ---------------------------------------------------------------------------
-- RLS: orders (never public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS orders_select_company_members_or_super ON public.orders;
CREATE POLICY orders_select_company_members_or_super
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.belongs_to_company(company_id));

DROP POLICY IF EXISTS orders_manage_company_admin_or_super ON public.orders;
CREATE POLICY orders_manage_company_admin_or_super
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- ---------------------------------------------------------------------------
-- RLS: order_items (via parent order company)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS order_items_select_company_members_or_super ON public.order_items;
CREATE POLICY order_items_select_company_members_or_super
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.belongs_to_company(o.company_id)
    )
  );

DROP POLICY IF EXISTS order_items_manage_company_admin_or_super ON public.order_items;
CREATE POLICY order_items_manage_company_admin_or_super
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.can_manage_company(o.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.can_manage_company(o.company_id)
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: website_content
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS website_content_public_select_published ON public.website_content;
CREATE POLICY website_content_public_select_published
  ON public.website_content
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    OR public.belongs_to_company(company_id)
  );

DROP POLICY IF EXISTS website_content_manage_company_admin_or_super ON public.website_content;
CREATE POLICY website_content_manage_company_admin_or_super
  ON public.website_content
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- ---------------------------------------------------------------------------
-- RLS: company_settings (never public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS company_settings_select_company_members_or_super ON public.company_settings;
CREATE POLICY company_settings_select_company_members_or_super
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (public.belongs_to_company(company_id));

DROP POLICY IF EXISTS company_settings_manage_company_admin_or_super ON public.company_settings;
CREATE POLICY company_settings_manage_company_admin_or_super
  ON public.company_settings
  FOR ALL
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

-- ---------------------------------------------------------------------------
-- Seed: six Swift Wave companies only
-- ---------------------------------------------------------------------------
INSERT INTO public.companies (name, slug, description, is_active)
VALUES
  (
    'Swift Wave Scholarship',
    'scholarship',
    'Connecting aspiring students with international education opportunities, guidance, and funding pathways.',
    true
  ),
  (
    'Swift Wave Freight',
    'freight',
    'End-to-end freight forwarding, clearing, and logistics solutions linking East Africa to global markets.',
    true
  ),
  (
    'Swift Wave Outfit',
    'outfit',
    'Contemporary fashion and apparel solutions blending African creativity with international style.',
    true
  ),
  (
    'Swift Wave Medical Aid',
    'medical',
    'Healthcare services, medical supplies, and community wellness programs improving lives across the region.',
    true
  ),
  (
    'Swift Wave Travels & Tours',
    'travels',
    'Curated travel experiences, corporate bookings, and destination services for seamless journeys worldwide.',
    true
  ),
  (
    'Swift Wave Catering & Events',
    'catering',
    'Premium catering for corporate events, celebrations, and hospitality experiences that leave a lasting impression.',
    true
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());

-- Seed empty settings rows for each company (idempotent)
INSERT INTO public.company_settings (company_id, settings)
SELECT c.id, '{}'::jsonb
FROM public.companies c
WHERE c.slug IN (
  'scholarship',
  'freight',
  'outfit',
  'medical',
  'travels',
  'catering'
)
ON CONFLICT (company_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Table privileges (RLS still enforces row-level access)
-- ---------------------------------------------------------------------------
GRANT SELECT ON TABLE public.companies TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.companies TO authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

GRANT SELECT ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

GRANT SELECT ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;

GRANT SELECT ON TABLE public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;

GRANT SELECT ON TABLE public.website_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.website_content TO authenticated;

GRANT SELECT ON TABLE public.company_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.company_settings TO authenticated;

