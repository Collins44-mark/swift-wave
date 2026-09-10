-- Outfit already has parent_id; this only repairs rows that drifted to a flat list
-- and points products at the child category while keeping existing names.

DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id
  FROM public.companies
  WHERE lower(slug) = 'outfit'
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.categories AS child
  SET parent_id = parent.id
  FROM public.categories AS parent
  WHERE child.company_id = v_company_id
    AND parent.company_id = v_company_id
    AND parent.parent_id IS NULL
    AND child.parent_id IS NULL
    AND child.id <> parent.id
    AND parent.slug IN ('men', 'women', 'footwear', 'accessories')
    AND child.slug LIKE parent.slug || '-%';

  UPDATE public.products AS p
  SET
    category_id = child.id,
    subcategory = child.name
  FROM public.categories AS child
  INNER JOIN public.categories AS parent
    ON parent.id = child.parent_id
   AND parent.company_id = child.company_id
  WHERE p.company_id = v_company_id
    AND p.category_id = parent.id
    AND child.company_id = v_company_id
    AND lower(trim(both FROM coalesce(p.subcategory, ''))) = lower(child.name);

  UPDATE public.products AS p
  SET subcategory = child.name
  FROM public.categories AS child
  WHERE p.company_id = v_company_id
    AND p.category_id = child.id
    AND child.company_id = v_company_id
    AND child.parent_id IS NOT NULL
    AND (p.subcategory IS NULL OR trim(both FROM p.subcategory) = '');
END $$;
