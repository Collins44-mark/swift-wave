-- Primary color variant + repair library/product hex values that were
-- stored as NULL or the old unknown-color fallback (#111111).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS primary_color_id UUID REFERENCES public.product_colors (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_primary_color_id_idx
  ON public.products (primary_color_id);

-- Fill hex for existing named library colors that have no usable value.
-- Only updates rows that already exist; does not insert new colors.
UPDATE public.colors AS c
SET hex_code = v.hex
FROM (
  VALUES
    ('black', '#000000'),
    ('white', '#ffffff'),
    ('brown', '#8b5e3c'),
    ('beige', '#d8c3a5'),
    ('pink', '#e91e63'),
    ('red', '#c62828'),
    ('blue', '#1565c0'),
    ('green', '#2e7d32'),
    ('grey', '#9e9e9e'),
    ('gray', '#9e9e9e')
) AS v(name, hex)
WHERE lower(trim(c.name)) = v.name
  AND (
    c.hex_code IS NULL
    OR length(trim(c.hex_code)) = 0
    OR (
      v.name <> 'black'
      AND lower(trim(c.hex_code)) IN ('#111', '#111111', '#000', '#000000')
    )
  );

UPDATE public.product_colors AS pc
SET hex_code = c.hex_code
FROM public.colors AS c
WHERE pc.color_id = c.id
  AND c.hex_code IS NOT NULL
  AND (
    pc.hex_code IS NULL
    OR length(trim(pc.hex_code)) = 0
    OR (
      lower(trim(c.name)) <> 'black'
      AND lower(trim(pc.hex_code)) IN ('#111', '#111111', '#000', '#000000')
    )
  );

UPDATE public.products AS p
SET primary_color_id = picked.id
FROM (
  SELECT DISTINCT ON (product_id) id, product_id
  FROM public.product_colors
  WHERE is_active = true
  ORDER BY product_id, sort_order ASC, created_at ASC
) AS picked
WHERE p.id = picked.product_id
  AND p.primary_color_id IS NULL;

UPDATE public.products AS p
SET
  image_url = COALESCE(pc.image_url, p.image_url),
  image_public_id = COALESCE(pc.image_public_id, p.image_public_id)
FROM public.product_colors AS pc
WHERE p.primary_color_id = pc.id
  AND pc.image_url IS NOT NULL;
