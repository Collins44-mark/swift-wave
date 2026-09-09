-- Seed hero image_url + slides for corporate pages (preserves existing legacy URLs)
-- Uses website_content JSONB — no schema change required.

UPDATE public.website_content wc
SET content = wc.content || jsonb_build_object(
  'image_url', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
  'slides', jsonb_build_array(
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80'
  )
)
FROM public.companies c
WHERE wc.company_id = c.id
  AND c.slug = 'corporate'
  AND wc.page_key = 'about'
  AND wc.section_key = 'hero'
  AND NOT (wc.content ? 'slides');

UPDATE public.website_content wc
SET content = wc.content || jsonb_build_object(
  'image_url', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80',
  'slides', jsonb_build_array(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80'
  )
)
FROM public.companies c
WHERE wc.company_id = c.id
  AND c.slug = 'corporate'
  AND wc.page_key = 'companies'
  AND wc.section_key = 'hero'
  AND NOT (wc.content ? 'slides');

UPDATE public.website_content wc
SET content = wc.content || jsonb_build_object(
  'image_url', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80',
  'slides', jsonb_build_array(
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80'
  )
)
FROM public.companies c
WHERE wc.company_id = c.id
  AND c.slug = 'corporate'
  AND wc.page_key = 'global'
  AND wc.section_key = 'hero'
  AND NOT (wc.content ? 'slides');

UPDATE public.website_content wc
SET content = wc.content || jsonb_build_object(
  'image_url', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80',
  'slides', jsonb_build_array(
    'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b136?auto=format&fit=crop&w=2000&q=80'
  )
)
FROM public.companies c
WHERE wc.company_id = c.id
  AND c.slug = 'corporate'
  AND wc.page_key = 'contact'
  AND wc.section_key = 'hero'
  AND NOT (wc.content ? 'slides');
