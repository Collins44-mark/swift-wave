-- =============================================================================
-- CMS: corporate scope + sort_order + seed existing website content
-- Migration: 009_cms_corporate_seed.sql
-- =============================================================================

-- Corporate / group website CMS scope
INSERT INTO public.companies (name, slug, description, is_active)
VALUES (
  'Swift Wave Group (Corporate)',
  'corporate',
  'Corporate and group website content for swiftwavegroup.com.',
  true
)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.website_content
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.website_content
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS website_content_sort_order_idx
  ON public.website_content (company_id, page_key, sort_order);

-- Seed helper: insert published content from migration defaults
-- Content extracted from content/*.html (current public website)

INSERT INTO public.website_content (company_id, page_key, section_key, content, status, sort_order)
SELECT c.id, v.page_key, v.section_key, v.content::jsonb, 'published', v.sort_order
FROM public.companies c
CROSS JOIN (VALUES
  -- HOME
  ('corporate', 'home', 'hero', '{"badge":"International Multi-Division Organization","title":"Building Tomorrow<br class=\"hidden sm:block\"> Across Borders","subtitle":"Swift Wave Group delivers world-class solutions across education, logistics, fashion, healthcare, travel, and hospitality — connecting Africa to global opportunity.","primary_cta_label":"Explore Our Companies","primary_cta_url":"/companies","secondary_cta_label":"Partner With Us","secondary_cta_url":"/contact","image_url":"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80","slides":["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80","https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80","https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80","https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80","https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80"]}', 1),
  ('corporate', 'home', 'values', '{"eyebrow":"Our Values","heading":"Why Choose Swift Wave","items":[{"id":"global-reach","title":"Global Reach","description":"Operations spanning Africa, Asia, and the Middle East","icon":"globe","sort_order":1,"visible":true},{"id":"innovation","title":"Innovation Driven","description":"Modern systems that keep every division ahead","icon":"lightbulb","sort_order":2,"visible":true},{"id":"integrity","title":"Trusted Integrity","description":"Transparent partnerships built on lasting trust","icon":"shield-check","sort_order":3,"visible":true},{"id":"growth","title":"Sustainable Growth","description":"Long-term value for communities and clients","icon":"trending-up","sort_order":4,"visible":true}]}', 2),
  ('corporate', 'home', 'global_teaser', '{"eyebrow":"Worldwide Reach","heading":"Our Global Presence","legend_hq":"Tanzania · Dubai","legend_hub":"India · China","link_label":"View all locations →","link_url":"/global"}', 3),
  ('corporate', 'home', 'footer', '{"description":"International multi-division organization delivering world-class solutions across industries.","copyright":"© Swift Wave Group. All rights reserved."}', 99),
  -- ABOUT
  ('corporate', 'about', 'hero', '{"badge":"About Us","title":"Who We Are","subtitle":"An international multi-division organization rooted in Tanzania, building bridges across industries and continents."}', 1),
  ('corporate', 'about', 'story', '{"heading":"Empowering Progress Across Borders","paragraph_1":"Swift Wave Group of Companies is a diversified international organization headquartered in Dar es Salaam, Tanzania. We operate six specialized divisions spanning education, freight logistics, fashion, healthcare, travel, and catering — each built to deliver excellence with local insight and global standards.","paragraph_2":"From scholarship pathways that unlock student potential, to freight networks linking East Africa with Dubai, India, and China, our mission is simple: create lasting value for people, partners, and communities."}', 2),
  ('corporate', 'about', 'footer', '{"description":"International multi-division organization delivering world-class solutions across industries.","copyright":"© Swift Wave Group. All rights reserved."}', 99),
  -- COMPANIES HUB
  ('corporate', 'companies', 'hero', '{"badge":"Our Companies","title":"Six Divisions. One Vision.","subtitle":"Each Swift Wave company operates with independent expertise while sharing our group values of integrity, innovation, and impact."}', 1),
  ('corporate', 'companies', 'footer', '{"description":"International multi-division organization delivering world-class solutions across industries.","copyright":"© Swift Wave Group. All rights reserved."}', 99),
  -- GLOBAL
  ('corporate', 'global', 'hero', '{"badge":"Worldwide Reach","title":"Our Global Presence","subtitle":"From our headquarters in Dar es Salaam, we connect partners and clients across Africa, the Middle East, and Asia."}', 1),
  ('corporate', 'global', 'footer', '{"description":"International multi-division organization delivering world-class solutions across industries.","copyright":"© Swift Wave Group. All rights reserved."}', 99),
  -- CONTACT
  ('corporate', 'contact', 'hero', '{"badge":"Get In Touch","title":"Contact Us","subtitle":"Whether you are a partner, client, or future team member — we would love to hear from you."}', 1),
  ('corporate', 'contact', 'contact_info', '{"email":"info@swiftwavegroup.com","phone":"+255 700 000 000","address":"Dar es Salaam, Tanzania","hours":"Mon – Fri, 8:00 AM – 5:00 PM EAT"}', 2),
  ('corporate', 'contact', 'footer', '{"description":"International multi-division organization delivering world-class solutions across industries.","copyright":"© Swift Wave Group. All rights reserved."}', 99),
  -- SCHOLARSHIP
  ('scholarship', 'scholarship', 'hero', '{"badge":"Apply","title":"Swift Wave Scholarship","hint":"Fill the form — we receive it on WhatsApp","image_url":"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80"}', 1),
  ('scholarship', 'scholarship', 'form_intro', '{"heading":"Application form","description":"Complete your details, then submit via WhatsApp."}', 2),
  -- FREIGHT
  ('freight', 'freight', 'hero', '{"badge":"Book","title":"Swift Wave Freight","hint":"Pick route & collection slots — send on WhatsApp","image_url":"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80"}', 1),
  ('freight', 'freight', 'form_intro', '{"heading":"Freight booking","description":"Select where goods are picked up, where they''re going, then choose a collection slot."}', 2),
  -- OUTFIT
  ('outfit', 'outfit', 'hero', '{"badge":"Shop","title":"Swift Wave Outfit","hint":"Men · Women · Footwear · Accessories","cta_label":"View cart","image_url":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"}', 1),
  -- MEDICAL
  ('medical', 'medical', 'hero', '{"badge":"Shop","title":"Swift Wave Medical","hint":"Medical supplies, equipment & skin care","cta_label":"View cart","image_url":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80"}', 1),
  -- TRAVELS / CATERING
  ('travels', 'travels', 'coming_soon', '{"eyebrow":"Swift Wave Travels","title":"Coming soon","body":"This division is not available yet. Redirecting to Our Companies…","cta_label":"Back to Companies","cta_url":"/companies"}', 1),
  ('catering', 'catering', 'coming_soon', '{"eyebrow":"Swift Wave Catering & Events","title":"Coming soon","body":"This division is not available yet. Redirecting to Our Companies…","cta_label":"Back to Companies","cta_url":"/companies"}', 1)
) AS v(company_slug, page_key, section_key, content, sort_order)
WHERE c.slug = v.company_slug
ON CONFLICT (company_id, page_key, section_key) DO UPDATE
SET content = EXCLUDED.content,
    status = 'published',
    sort_order = EXCLUDED.sort_order,
    updated_at = timezone('utc', now());
