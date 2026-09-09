-- =============================================================================
-- Swift Wave — Seed Outfit + Medical catalogs from public JS
-- Migration: 003_seed_outfit_medical_catalog.sql
-- Idempotent: inserts only when slug does not already exist for the company
-- Also adds public category SELECT + company_admin company UPDATE for Phase 6 APIs
-- =============================================================================

-- Public can read active categories for storefront catalog API
DROP POLICY IF EXISTS categories_public_select_active ON public.categories;
CREATE POLICY categories_public_select_active
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.is_active = true
    )
  );

-- Company admins may update their company (whatsapp, description, website_url)
DROP POLICY IF EXISTS companies_update_company_admin_or_super ON public.companies;
CREATE POLICY companies_update_company_admin_or_super
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_company(id))
  WITH CHECK (public.can_manage_company(id));

-- outfit categories & products
DO $$
DECLARE
  v_company_id UUID;
  v_cat_id UUID;
  v_parent_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies WHERE slug = 'outfit';
  IF v_company_id IS NULL THEN
    RAISE NOTICE 'Company outfit not found, skipping seed';
    RETURN;
  END IF;

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Men', 'men', NULL, true, 0, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'men');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Women', 'women', NULL, true, 1, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'women');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Footwear', 'footwear', NULL, true, 2, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Accessories', 'accessories', NULL, true, 3, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Shirts', 'men-shirts', NULL, true, 0, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'men-shirts');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Trousers', 'men-trousers', NULL, true, 1, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'men-trousers');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Outerwear', 'men-outerwear', NULL, true, 2, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'men-outerwear');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Knitwear', 'men-knitwear', NULL, true, 3, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'men-knitwear');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Dresses', 'women-dresses', NULL, true, 0, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'women-dresses');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Tops', 'women-tops', NULL, true, 1, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'women-tops');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Bottoms', 'women-bottoms', NULL, true, 2, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'women-bottoms');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Sets', 'women-sets', NULL, true, 3, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'women-sets');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Sneakers', 'footwear-sneakers', NULL, true, 0, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear-sneakers');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Formal', 'footwear-formal', NULL, true, 1, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear-formal');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Sandals', 'footwear-sandals', NULL, true, 2, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear-sandals');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Boots', 'footwear-boots', NULL, true, 3, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear-boots');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Bags', 'accessories-bags', NULL, true, 0, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories-bags');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Belts', 'accessories-belts', NULL, true, 1, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories-belts');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Hats', 'accessories-hats', NULL, true, 2, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories-hats');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Scarves', 'accessories-scarves', NULL, true, 3, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories-scarves');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Classic Linen Shirt', 'linen-shirt', 'Breathable linen shirt with a clean collar and relaxed fit. Ideal for warm climates and smart-casual wear.',
    85000, 'TZS',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Shirts', '["100% linen blend","Sizes S–XXL","Machine wash cold","Colour: Sand"]'::jsonb, '4.6 · 94 ratings',
    NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'linen-shirt');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Oxford Button-Down', 'oxford-shirt', 'Crisp oxford cotton shirt for office and evening wear. Structured yet comfortable through the day.',
    72000, 'TZS',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Shirts', '["Oxford cotton","Slim & regular fits","Easy-iron finish","Colour: Sky blue"]'::jsonb, '4.4 · 61 ratings',
    NULL, 1
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'oxford-shirt');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Slim Chino Trousers', 'chino-trousers', 'Tapered chinos with stretch for all-day comfort. Pair with sneakers or formal shoes.',
    95000, 'TZS',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Trousers', '["Stretch twill","Sizes 28–40","Side & back pockets","Colour: Olive"]'::jsonb, '4.5 · 77 ratings',
    NULL, 2
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'chino-trousers');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Tailored Blazer', 'tailored-blazer', 'Lightweight structured blazer for meetings and events. Soft shoulder with a modern cut.',
    220000, 'TZS',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Outerwear', '["Half-canvas construction","Sizes 46–56 EU","Unlined summer option","Colour: Navy"]'::jsonb, '4.7 · 42 ratings',
    NULL, 3
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'tailored-blazer');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'men';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Merino Crew Knit', 'merino-crew', 'Fine-gauge merino crewneck that layers cleanly under jackets or stands alone.',
    110000, 'TZS',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Knitwear', '["Merino wool","Sizes S–XL","Anti-itch finish","Colour: Charcoal"]'::jsonb, '4.3 · 38 ratings',
    NULL, 4
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'merino-crew');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Ankara Wrap Dress', 'ankara-dress', 'Statement wrap dress in bold print. Flattering silhouette for day events and evenings.',
    145000, 'TZS',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Dresses', '["Ankara print cotton","Sizes XS–XL","Adjustable wrap","Lined bodice"]'::jsonb, '4.8 · 112 ratings',
    NULL, 5
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'ankara-dress');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Satin Midi Dress', 'midi-dress', 'Fluid satin midi with a soft drape. Elevated piece for dinners and celebrations.',
    168000, 'TZS',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Dresses', '["Satin finish","Sizes XS–L","Side zip","Colour: Emerald"]'::jsonb, '4.5 · 56 ratings',
    NULL, 6
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'midi-dress');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Silk Blouse', 'silk-blouse', 'Soft silk-feel blouse with a refined neckline. Works from desk to dinner.',
    95000, 'TZS',
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Tops', '["Silk-feel fabric","Sizes XS–XL","Hidden buttons","Colour: Ivory"]'::jsonb, '4.6 · 89 ratings',
    NULL, 7
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'silk-blouse');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Wide-Leg Trousers', 'wide-trousers', 'High-rise wide-leg trousers with clean lines. Pair with fitted tops or blouses.',
    98000, 'TZS',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Bottoms', '["Crepe fabric","Sizes 24–34","Side pockets","Colour: Black"]'::jsonb, '4.4 · 47 ratings',
    NULL, 8
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'wide-trousers');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'women';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Linen Co-ord Set', 'coord-set', 'Matching linen top and trousers set. Wear together or style as separates.',
    175000, 'TZS',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Sets', '["2-piece set","Sizes XS–L","Breathable linen","Colour: Clay"]'::jsonb, '4.7 · 63 ratings',
    NULL, 9
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'coord-set');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Court Sneakers', 'court-sneakers', 'Everyday court sneakers with cushioned sole and durable upper. Built for city miles.',
    125000, 'TZS',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Sneakers', '["Rubber outsole","Sizes 36–45","Breathable lining","Colour: White / Red"]'::jsonb, '4.5 · 201 ratings',
    NULL, 10
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'court-sneakers');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Urban Runner', 'runner-sneakers', 'Lightweight runners with mesh panels for airflow. Casual and travel-ready.',
    140000, 'TZS',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Sneakers', '["Mesh upper","Sizes 36–45","Cushion midsole","Colour: Grey"]'::jsonb, '4.3 · 88 ratings',
    NULL, 11
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'runner-sneakers');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Leather Oxfords', 'oxford-shoes', 'Polished leather oxfords for formal occasions and office wear.',
    210000, 'TZS',
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Formal', '["Genuine leather","Sizes 39–46","Leather sole option","Colour: Brown"]'::jsonb, '4.6 · 54 ratings',
    NULL, 12
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'oxford-shoes');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Penny Loafers', 'loafer', 'Classic penny loafers with a soft footbed. Smart without a lace-up.',
    185000, 'TZS',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Formal', '["Leather upper","Sizes 39–45","Cushion insole","Colour: Black"]'::jsonb, '4.4 · 39 ratings',
    NULL, 13
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'loafer');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Leather Slide Sandals', 'slide-sandals', 'Minimal leather slides for warm days. Easy on, easy off.',
    78000, 'TZS',
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Sandals', '["Leather strap","Sizes 36–44","Rubber sole","Colour: Tan"]'::jsonb, '4.2 · 71 ratings',
    NULL, 14
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'slide-sandals');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'footwear';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Chelsea Boots', 'chelsea-boots', 'Sleek chelsea boots with elastic side panels. Versatile with jeans or trousers.',
    245000, 'TZS',
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Boots', '["Leather finish","Sizes 39–46","Pull tab","Colour: Black"]'::jsonb, '4.7 · 48 ratings',
    NULL, 15
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'chelsea-boots');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Canvas Tote', 'canvas-tote', 'Sturdy canvas tote for daily carry. Spacious enough for laptop and essentials.',
    38000, 'TZS',
    'https://images.unsplash.com/photo-1590874103328-eac38a67437a?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Bags', '["Heavy canvas","Inner pocket","Reinforced handles","Colour: Natural"]'::jsonb, '4.5 · 133 ratings',
    NULL, 16
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'canvas-tote');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Crossbody Bag', 'crossbody', 'Compact crossbody with adjustable strap. Hands-free for city days.',
    92000, 'TZS',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128ac?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Bags', '["Vegan leather","Zip close","Adjustable strap","Colour: Cognac"]'::jsonb, '4.4 · 67 ratings',
    NULL, 17
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'crossbody');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Leather Belt', 'leather-belt', 'Full-grain leather belt with brushed buckle. Essential finishing piece.',
    45000, 'TZS',
    'https://images.unsplash.com/photo-1624222247344-550fb60583fd?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Belts', '["Full-grain leather","Sizes 80–110 cm","Reversible option","Colour: Black / Brown"]'::jsonb, '4.6 · 90 ratings',
    NULL, 18
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'leather-belt');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Structured Cap', 'cap', 'Clean structured cap with adjustable strap. Everyday sun cover.',
    32000, 'TZS',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Hats', '["Cotton twill","One size","Adjustable","Colour: Navy"]'::jsonb, '4.3 · 55 ratings',
    NULL, 19
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'cap');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'accessories';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Lightweight Scarf', 'scarf', 'Soft lightweight scarf for layering and travel. Packs flat in any bag.',
    42000, 'TZS',
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Scarves', '["Viscose blend","180 × 70 cm","Fringe edge","Print assortment"]'::jsonb, '4.5 · 41 ratings',
    NULL, 20
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'scarf');

END $$;
-- medical categories & products
DO $$
DECLARE
  v_company_id UUID;
  v_cat_id UUID;
  v_parent_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies WHERE slug = 'medical';
  IF v_company_id IS NULL THEN
    RAISE NOTICE 'Company medical not found, skipping seed';
    RETURN;
  END IF;

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Supplies', 'supplies', NULL, true, 0, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'supplies');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Equipment', 'equipment', NULL, true, 1, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'equipment');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Skin Care', 'skin-care', NULL, true, 2, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Wellness', 'wellness', NULL, true, 3, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'wellness');

  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Contracts', 'contracts', NULL, true, 4, NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'contracts');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Lotion', 'skin-care-lotion', NULL, true, 0, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care-lotion');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Shampoo', 'skin-care-shampoo', NULL, true, 1, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care-shampoo');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Oil', 'skin-care-oil', NULL, true, 2, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care-oil');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Cleanser', 'skin-care-cleanser', NULL, true, 3, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care-cleanser');

  SELECT id INTO v_parent_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.categories (company_id, name, slug, description, is_active, sort_order, parent_id)
  SELECT v_company_id, 'Gel', 'skin-care-gel', NULL, true, 4, v_parent_id
  WHERE v_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care-gel');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'supplies';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'PPE Kit (Box of 50)', 'ppe-kit', 'Complete PPE set for clinics and facilities. Includes masks, gloves, and gowns.',
    95000, 'TZS',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Box of 50 kits","Clinic grade","Bulk pricing available"]'::jsonb, '4.5 · 64 ratings',
    NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'ppe-kit');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'supplies';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'First Aid Station Pack', 'first-aid', 'Wall-ready first aid station pack with essential emergency supplies.',
    180000, 'TZS',
    'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Clinic ready","Refill options","Wall mountable"]'::jsonb, '4.6 · 41 ratings',
    NULL, 1
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'first-aid');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'supplies';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Hospital Consumables', 'consumables', 'Bulk hospital consumables for ongoing facility supply.',
    NULL, 'TZS',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Bulk order","Custom list","Scheduled delivery"]'::jsonb, '4.4 · 28 ratings',
    'Get Quote', 2
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'consumables');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'equipment';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Digital BP Monitor', 'bp-monitor', 'Accurate digital blood pressure monitor for home and clinic use.',
    210000, 'TZS',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Large display","Memory recall","Arm cuff included"]'::jsonb, '4.7 · 89 ratings',
    NULL, 3
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'bp-monitor');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'equipment';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Pulse Oximeter', 'oximeter', 'Finger pulse oximeter with SpO2 and pulse readout.',
    65000, 'TZS',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Portable","OLED display","Auto power-off"]'::jsonb, '4.5 · 112 ratings',
    NULL, 4
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'oximeter');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'wellness';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Community Wellness Day', 'wellness-day', 'Organised wellness outreach day for communities and workplaces.',
    NULL, 'TZS',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["On-site team","Screening options","Custom package"]'::jsonb, '4.8 · 22 ratings',
    'Enquire', 5
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'wellness-day');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'contracts';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Clinic Supply Contract', 'clinic-contract', 'Monthly replenishment contract for clinics and pharmacies.',
    NULL, 'TZS',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Monthly delivery","Priority support","Flexible SKUs"]'::jsonb, '4.6 · 18 ratings',
    'Enquire', 6
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'clinic-contract');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'contracts';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Emergency Restock', 'emergency-restock', 'Urgent restock pathway for critical medical items.',
    NULL, 'TZS',
    'https://images.unsplash.com/photo-1631815589968-fdb8192b2a47?auto=format&fit=crop&w=1000&q=80', 'published', false,
    NULL, '["Rapid response","Critical items","24/7 desk"]'::jsonb, '4.7 · 35 ratings',
    '24/7 Order', 7
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'emergency-restock');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Hydrating Body Lotion', 'body-lotion', 'Light daily body lotion for soft, hydrated skin.',
    28000, 'TZS',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Lotion', '["400ml","Non-greasy","For all skin types"]'::jsonb, '4.6 · 140 ratings',
    NULL, 8
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'body-lotion');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Daily Face Cream', 'face-cream', 'Day and night face cream for everyday moisture.',
    35000, 'TZS',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Lotion', '["Day & night","Lightweight","Fragrance balanced"]'::jsonb, '4.5 · 96 ratings',
    NULL, 9
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'face-cream');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Shea Butter Moisturizer', 'shea-moisturizer', 'Rich shea butter cream for dry skin and elbows.',
    32000, 'TZS',
    'https://images.unsplash.com/photo-1620916565916-b6b8a5f3a0d0?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Lotion', '["Rich cream","Shea butter","Deep moisture"]'::jsonb, '4.7 · 78 ratings',
    NULL, 10
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'shea-moisturizer');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Hand & Body Cream', 'hand-body', 'Family-size hand and body cream for daily use.',
    25000, 'TZS',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Lotion', '["Family pack","Soft finish","Everyday care"]'::jsonb, '4.4 · 61 ratings',
    NULL, 11
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'hand-body');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Nourishing Hair Shampoo', 'hair-shampoo', 'Gentle nourishing shampoo for clean, soft hair.',
    22000, 'TZS',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Shampoo', '["500ml","Daily use","Suitable for most hair"]'::jsonb, '4.5 · 120 ratings',
    NULL, 12
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'hair-shampoo');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Repair Conditioner', 'conditioner', 'Repair conditioner to soften and detangle.',
    24000, 'TZS',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Shampoo', '["400ml","Pairs with shampoo","Smooth finish"]'::jsonb, '4.4 · 88 ratings',
    NULL, 13
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'conditioner');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Anti-Dandruff Shampoo', 'anti-dandruff', 'Medicated anti-dandruff shampoo for scalp comfort.',
    27000, 'TZS',
    'https://images.unsplash.com/photo-1571781926291-c77df8098c1f?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Shampoo', '["Medicated","Scalp care","Regular use"]'::jsonb, '4.3 · 74 ratings',
    NULL, 14
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'anti-dandruff');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Coconut Hair Oil', 'coconut-oil', 'Pure-feel coconut oil for hair shine and softness.',
    18000, 'TZS',
    'https://images.unsplash.com/photo-1608248543800-ba5401bb9cb0?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Oil', '["200ml","Hair oil","Easy absorb"]'::jsonb, '4.6 · 155 ratings',
    NULL, 15
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'coconut-oil');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Vitamin E Skin Oil', 'vitamin-e-oil', 'Vitamin E oil for body and face nourishment.',
    26000, 'TZS',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Oil', '["Body & face","Vitamin E","Night care"]'::jsonb, '4.5 · 101 ratings',
    NULL, 16
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'vitamin-e-oil');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Argan Beauty Oil', 'argan-oil', 'Argan beauty oil for hair and skin finishing.',
    40000, 'TZS',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fccb0?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Oil', '["Hair & skin","Premium finish","Small drop use"]'::jsonb, '4.8 · 67 ratings',
    NULL, 17
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'argan-oil');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Gentle Facial Cleanser', 'cleanser', 'Gentle facial cleanser for daily clean skin.',
    30000, 'TZS',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Cleanser', '["200ml","Gentle formula","Morning & night"]'::jsonb, '4.5 · 93 ratings',
    NULL, 18
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'cleanser');

  SELECT id INTO v_cat_id FROM public.categories WHERE company_id = v_company_id AND slug = 'skin-care';
  INSERT INTO public.products (
    company_id, category_id, name, slug, description, price, currency,
    image_url, status, featured, subcategory, bullets, rating, price_label, sort_order
  )
  SELECT
    v_company_id, v_cat_id, 'Aloe Vera Gel', 'aloe-gel', 'Soothing aloe vera gel for skin comfort after sun or dryness.',
    20000, 'TZS',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80', 'published', false,
    'Gel', '["Soothing","Fast absorb","Multi-use"]'::jsonb, '4.7 · 130 ratings',
    NULL, 19
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = v_company_id AND slug = 'aloe-gel');

END $$;
