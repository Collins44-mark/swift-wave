-- Reusable color library. product_colors become product-specific
-- selections that reference colors and store per-product images.

CREATE TABLE IF NOT EXISTS public.colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS colors_name_lower_unique
  ON public.colors (lower(trim(name)));

CREATE INDEX IF NOT EXISTS colors_sort_order_idx ON public.colors (sort_order);

DROP TRIGGER IF EXISTS colors_set_updated_at ON public.colors;
CREATE TRIGGER colors_set_updated_at
  BEFORE UPDATE ON public.colors
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

INSERT INTO public.colors (name, hex_code, sort_order, is_active)
SELECT s.name, s.hex_code, s.sort_order, true
FROM (
  SELECT
    trim(pc.name) AS name,
    (ARRAY_AGG(pc.hex_code ORDER BY pc.created_at NULLS LAST, pc.id))[1] AS hex_code,
    MIN(pc.sort_order) AS sort_order
  FROM public.product_colors pc
  WHERE pc.name IS NOT NULL
    AND length(trim(pc.name)) > 0
  GROUP BY lower(trim(pc.name)), trim(pc.name)
) s
WHERE NOT EXISTS (
  SELECT 1
  FROM public.colors c
  WHERE lower(trim(c.name)) = lower(s.name)
);

-- One product_colors row per product + color name before linking.
DELETE FROM public.product_colors a
USING public.product_colors b
WHERE a.product_id = b.product_id
  AND lower(trim(a.name)) = lower(trim(b.name))
  AND a.id > b.id;

ALTER TABLE public.product_colors
  ADD COLUMN IF NOT EXISTS color_id UUID REFERENCES public.colors (id) ON DELETE RESTRICT;

UPDATE public.product_colors pc
SET color_id = c.id
FROM public.colors c
WHERE pc.color_id IS NULL
  AND lower(trim(pc.name)) = lower(c.name);

CREATE UNIQUE INDEX IF NOT EXISTS product_colors_product_color_unique
  ON public.product_colors (product_id, color_id)
  WHERE color_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_colors_color_id_idx
  ON public.product_colors (color_id);

ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS colors_public_select_active ON public.colors;
CREATE POLICY colors_public_select_active
  ON public.colors
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_super_admin());

DROP POLICY IF EXISTS colors_manage_super_or_company_admin ON public.colors;
CREATE POLICY colors_manage_super_or_company_admin
  ON public.colors
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

GRANT SELECT ON TABLE public.colors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.colors TO authenticated;
