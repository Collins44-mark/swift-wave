-- Primary color without a circular products ↔ product_colors foreign key.
-- Also ensure discount columns exist if 020 has not been applied yet.

ALTER TABLE public.product_colors
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS primary_color_id UUID,
  ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_discount_type_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_discount_type_check
  CHECK (discount_type IN ('none', 'percent', 'fixed'));

-- If 019 pointed primary_color_id at product_colors.id, remap to the library color.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_primary_color_id_fkey;

UPDATE public.products AS p
SET primary_color_id = pc.color_id
FROM public.product_colors AS pc
WHERE p.primary_color_id = pc.id
  AND pc.color_id IS NOT NULL;

UPDATE public.products AS p
SET primary_color_id = NULL
WHERE p.primary_color_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.colors c WHERE c.id = p.primary_color_id
  );

DO $$
BEGIN
  ALTER TABLE public.products
    ADD CONSTRAINT products_primary_color_id_fkey
    FOREIGN KEY (primary_color_id) REFERENCES public.colors (id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.product_colors AS pc
SET is_primary = true
FROM public.products AS p
WHERE pc.product_id = p.id
  AND pc.color_id IS NOT NULL
  AND p.primary_color_id = pc.color_id;

UPDATE public.product_colors AS pc
SET is_primary = true
WHERE pc.is_primary = false
  AND pc.id IN (
    SELECT DISTINCT ON (product_id) id
    FROM public.product_colors
    WHERE is_active = true
    ORDER BY product_id, sort_order ASC, created_at ASC
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.product_colors other
    WHERE other.product_id = pc.product_id
      AND other.is_primary = true
  );

UPDATE public.products AS p
SET primary_color_id = pc.color_id
FROM public.product_colors AS pc
WHERE pc.product_id = p.id
  AND pc.is_primary = true
  AND pc.color_id IS NOT NULL
  AND p.primary_color_id IS NULL;

UPDATE public.products AS p
SET
  image_url = COALESCE(pc.image_url, p.image_url),
  image_public_id = COALESCE(pc.image_public_id, p.image_public_id)
FROM public.product_colors AS pc
WHERE pc.product_id = p.id
  AND pc.is_primary = true
  AND pc.image_url IS NOT NULL;
