-- Product colors, reusable sizes, product size links, and order item snapshots.

CREATE TABLE IF NOT EXISTS public.sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT sizes_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS sizes_sort_order_idx ON public.sizes (sort_order);

DROP TRIGGER IF EXISTS sizes_set_updated_at ON public.sizes;
CREATE TRIGGER sizes_set_updated_at
  BEFORE UPDATE ON public.sizes
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_code TEXT,
  image_url TEXT,
  image_public_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS product_colors_product_id_idx ON public.product_colors (product_id);

DROP TRIGGER IF EXISTS product_colors_set_updated_at ON public.product_colors;
CREATE TRIGGER product_colors_set_updated_at
  BEFORE UPDATE ON public.product_colors
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.sizes (id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT product_sizes_product_size_unique UNIQUE (product_id, size_id)
);

CREATE INDEX IF NOT EXISTS product_sizes_product_id_idx ON public.product_sizes (product_id);

DROP TRIGGER IF EXISTS product_sizes_set_updated_at ON public.product_sizes;
CREATE TRIGGER product_sizes_set_updated_at
  BEFORE UPDATE ON public.product_sizes
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_color_id UUID REFERENCES public.product_colors (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS selected_color TEXT,
  ADD COLUMN IF NOT EXISTS selected_size TEXT;

CREATE INDEX IF NOT EXISTS order_items_product_color_id_idx ON public.order_items (product_color_id);

INSERT INTO public.sizes (name, sort_order)
SELECT v.name, v.sort_order
FROM (
  VALUES
    ('XS', 10),
    ('S', 20),
    ('M', 30),
    ('L', 40),
    ('XL', 50),
    ('XXL', 60),
    ('36', 110),
    ('37', 120),
    ('38', 130),
    ('39', 140),
    ('40', 150),
    ('41', 160),
    ('42', 170),
    ('43', 180),
    ('44', 190),
    ('45', 200)
) AS v(name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sizes s WHERE lower(s.name) = lower(v.name)
);

ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sizes_public_select_active ON public.sizes;
CREATE POLICY sizes_public_select_active
  ON public.sizes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_super_admin());

DROP POLICY IF EXISTS sizes_manage_super_or_company_admin ON public.sizes;
CREATE POLICY sizes_manage_super_or_company_admin
  ON public.sizes
  FOR ALL
  TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'company_admin')
        AND p.is_active = true
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'company_admin')
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS product_colors_public_select_published ON public.product_colors;
CREATE POLICY product_colors_public_select_published
  ON public.product_colors
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_colors.product_id
        AND (
          p.status = 'published'
          OR public.belongs_to_company(p.company_id)
        )
    )
  );

DROP POLICY IF EXISTS product_colors_manage_company_admin_or_super ON public.product_colors;
CREATE POLICY product_colors_manage_company_admin_or_super
  ON public.product_colors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_colors.product_id
        AND public.can_manage_company(p.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_colors.product_id
        AND public.can_manage_company(p.company_id)
    )
  );

DROP POLICY IF EXISTS product_sizes_public_select_published ON public.product_sizes;
CREATE POLICY product_sizes_public_select_published
  ON public.product_sizes
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_sizes.product_id
        AND (
          p.status = 'published'
          OR public.belongs_to_company(p.company_id)
        )
    )
  );

DROP POLICY IF EXISTS product_sizes_manage_company_admin_or_super ON public.product_sizes;
CREATE POLICY product_sizes_manage_company_admin_or_super
  ON public.product_sizes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_sizes.product_id
        AND public.can_manage_company(p.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_sizes.product_id
        AND public.can_manage_company(p.company_id)
    )
  );

GRANT SELECT ON TABLE public.sizes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sizes TO authenticated;
GRANT SELECT ON TABLE public.product_colors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_colors TO authenticated;
GRANT SELECT ON TABLE public.product_sizes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_sizes TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_website_order(
  p_company_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb,
  p_customer_location text DEFAULT NULL,
  p_customer_email text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_currency text DEFAULT 'TZS'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_qty integer;
  v_unit numeric(12,2);
  v_sub numeric(12,2);
BEGIN
  IF p_company_slug IS NULL OR length(trim(p_company_slug)) = 0 THEN
    RAISE EXCEPTION 'company_slug required';
  END IF;
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'customer_name required';
  END IF;
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'customer_phone required';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items required';
  END IF;

  SELECT c.id INTO v_company_id
  FROM public.companies c
  WHERE c.slug = p_company_slug AND c.is_active = true
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company not found';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::integer, 1));
    v_unit := COALESCE((v_item->>'unit_price')::numeric, 0);
    v_total := v_total + (v_qty * v_unit);
  END LOOP;

  INSERT INTO public.orders (
    company_id, customer_name, customer_phone, customer_location, customer_email,
    notes, currency, total, status
  ) VALUES (
    v_company_id, trim(p_customer_name), trim(p_customer_phone),
    NULLIF(trim(COALESCE(p_customer_location, '')), ''),
    NULLIF(trim(COALESCE(p_customer_email, '')), ''),
    NULLIF(trim(COALESCE(p_notes, '')), ''),
    COALESCE(NULLIF(trim(p_currency), ''), 'TZS'),
    v_total,
    'new'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::integer, 1));
    v_unit := COALESCE((v_item->>'unit_price')::numeric, 0);
    v_sub := v_qty * v_unit;
    INSERT INTO public.order_items (
      order_id, product_id, product_name, quantity, unit_price, subtotal,
      product_color_id, selected_color, selected_size
    ) VALUES (
      v_order_id,
      NULLIF(v_item->>'product_id', '')::uuid,
      COALESCE(NULLIF(trim(v_item->>'product_name'), ''), 'Item'),
      v_qty,
      v_unit,
      v_sub,
      NULLIF(v_item->>'product_color_id', '')::uuid,
      NULLIF(trim(COALESCE(v_item->>'selected_color', '')), ''),
      NULLIF(trim(COALESCE(v_item->>'selected_size', '')), '')
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;
