-- Corporate "Our Companies" card fields on existing companies table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS card_title_short TEXT,
  ADD COLUMN IF NOT EXISTS card_image_url TEXT,
  ADD COLUMN IF NOT EXISTS card_image_public_id TEXT,
  ADD COLUMN IF NOT EXISTS card_icon TEXT,
  ADD COLUMN IF NOT EXISTS corporate_display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS corporate_card_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_coming_soon BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS card_route TEXT;

-- Seed card defaults from the legacy corporate companies page (preserve order)
UPDATE public.companies SET
  card_title_short = 'Scholarship',
  card_icon = 'graduation-cap',
  corporate_display_order = 1,
  card_image_url = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  card_route = '/companies/scholarship',
  card_coming_soon = false,
  corporate_card_visible = true
WHERE slug = 'scholarship';

UPDATE public.companies SET
  card_title_short = 'Freight',
  card_icon = 'truck',
  corporate_display_order = 2,
  card_image_url = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  card_route = '/companies/freight',
  card_coming_soon = false,
  corporate_card_visible = true
WHERE slug = 'freight';

UPDATE public.companies SET
  card_title_short = 'Outfit',
  card_icon = 'shirt',
  corporate_display_order = 3,
  card_image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  card_route = '/companies/outfit',
  card_coming_soon = false,
  corporate_card_visible = true
WHERE slug = 'outfit';

UPDATE public.companies SET
  card_title_short = 'Medical',
  card_icon = 'heart-pulse',
  corporate_display_order = 4,
  card_image_url = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  card_route = '/companies/medical',
  card_coming_soon = false,
  corporate_card_visible = true
WHERE slug = 'medical';

UPDATE public.companies SET
  card_title_short = 'Travels',
  card_icon = 'plane',
  corporate_display_order = 5,
  card_image_url = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
  card_route = NULL,
  card_coming_soon = true,
  corporate_card_visible = true
WHERE slug = 'travels';

UPDATE public.companies SET
  card_title_short = 'Catering',
  card_icon = 'utensils',
  corporate_display_order = 6,
  card_image_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  card_route = NULL,
  card_coming_soon = true,
  corporate_card_visible = true
WHERE slug = 'catering';
