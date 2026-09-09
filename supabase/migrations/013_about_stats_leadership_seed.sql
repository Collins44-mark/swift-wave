-- Seed About page stats + leadership (mirrors lib/cms/seed-content.ts + public about.html)

INSERT INTO public.website_content (company_id, page_key, section_key, content, status, sort_order)
SELECT c.id, v.page_key, v.section_key, v.content::jsonb, 'published', v.sort_order
FROM public.companies c
CROSS JOIN (VALUES
  (
    'about',
    'stats',
    '{"items":[{"id":"countries","value":"15","label":"Countries Reached","sort_order":1,"visible":true},{"id":"divisions","value":"6","label":"Business Divisions","sort_order":2,"visible":true},{"id":"clients","value":"500","label":"Happy Clients","sort_order":3,"visible":true},{"id":"projects","value":"1200","label":"Projects Delivered","sort_order":4,"visible":true}]}',
    3
  ),
  (
    'about',
    'leadership',
    '{"eyebrow":"Executive Team","heading":"Leadership","intro":"Experienced leaders guiding Swift Wave Group with vision, integrity, and a commitment to excellence.","closing_heading":"Guided by Shared Principles","closing_body":"Our leadership team brings together decades of experience in logistics, education, hospitality, and healthcare. Together, they ensure every Swift Wave company operates with accountability, innovation, and a people-first mindset.","items":[{"id":"ceo","name":"James Mwangi","role":"Chief Executive Officer","bio":"Leads group strategy and international expansion across all six divisions.","image_url":"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80","sort_order":1,"visible":true},{"id":"coo","name":"Amina Hassan","role":"Chief Operating Officer","bio":"Oversees day-to-day operations, quality standards, and cross-division collaboration.","image_url":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80","sort_order":2,"visible":true},{"id":"cco","name":"David Okello","role":"Chief Commercial Officer","bio":"Drives partnerships, client relations, and growth across freight, travel, and education.","image_url":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80","sort_order":3,"visible":true}]}',
    4
  )
) AS v(page_key, section_key, content, sort_order)
WHERE c.slug = 'corporate'
ON CONFLICT (company_id, page_key, section_key) DO UPDATE
SET content = EXCLUDED.content,
    status = 'published',
    sort_order = EXCLUDED.sort_order,
    updated_at = timezone('utc', now());
