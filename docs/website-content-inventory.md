# Website Content Inventory

Source of truth: `content/*.html`, `content/manifest.json`, `public/js/pages/*.js`

Last audited: Phase — Full Website Content Migration

## Architecture

| Layer | Role |
|-------|------|
| `content/{slug}.html` | Legacy HTML layout (design preserved) |
| `data-cms="section.field"` | Hydration markers for CMS values |
| `website_content` (Supabase) | Published/draft JSONB per section |
| `LegacyPage` (server) | Loads HTML + hydrates from CMS |
| Admin `/admin/website-content` | Section-oriented editor |

## Corporate pages (`company_slug = corporate`)

### Home (`page_key = home`)

| Section | Fields | Editable |
|---------|--------|----------|
| **hero** | badge, title, subtitle, primary/secondary CTA label+URL, slides[], image_url | Yes |
| **values** | eyebrow, heading, items[] (title, description, icon, order, visible) | Yes |
| **global_teaser** | eyebrow, heading, legend_hq, legend_hub, link_label, link_url | Yes |
| **footer** | description, copyright | Yes |
| nav / mobile menu | Hard-coded structure | Static (intentional) |

### About (`page_key = about`)

| Section | Fields | Editable |
|---------|--------|----------|
| **hero** | badge, title, subtitle, image_url | Yes |
| **story** | heading, paragraph_1, paragraph_2 | Yes (markers pending on HTML) |
| **stats** | items[] value/label | Seeded; HTML markers pending |
| **leadership** | eyebrow, heading, intro, items[] | Seeded; HTML markers pending |
| **footer** | description, copyright | Partial (shared footer pattern) |

### Companies hub (`page_key = companies`)

| Section | Fields | Editable |
|---------|--------|----------|
| **hero** | badge, title, subtitle | Yes (seeded) |
| **company_cards** | 6 cards (name, desc, image, link) | Seeded via `companies` table descriptions; card HTML pending markers |
| **footer** | description, copyright | Seeded |

### Global (`page_key = global`)

| Section | Fields | Editable |
|---------|--------|----------|
| **hero** | badge, title, subtitle | Seeded |
| **locations** | items[] city, role, description, image_url, image_alt | Seeded; HTML markers pending |
| **footer** | description, copyright | Seeded |

### Contact (`page_key = contact`)

| Section | Fields | Editable |
|---------|--------|----------|
| **hero** | badge, title, subtitle | Yes (connected) |
| **contact_info** | email, phone, address, hours | Partial (email, phone connected) |
| **contact_form** | labels, subject options | Static (client-side only) |
| **footer** | description, copyright | Seeded |

## Company pages

### Scholarship (`scholarship`)

| Section | Fields | Connected |
|---------|--------|-----------|
| **hero** | badge, title, hint, image_url | Yes |
| **form_intro** | heading, description | Yes |
| form fields / options | Hard-coded + admin form-options DB | Partial |

### Freight (`freight`)

| Section | Fields | Connected |
|---------|--------|-----------|
| **hero** | badge, title, hint, image_url | Seeded |
| **form_intro** | heading, description | Seeded |
| route hubs | Admin DB + JS | Separate module |

### Outfit / Medical (ecommerce)

| Section | Fields | Connected |
|---------|--------|-----------|
| **hero** | badge, title, hint, cta_label, image_url | Yes |
| product catalog | Supabase products API | Separate module |

### Travels / Catering (coming soon)

| Section | Fields | Connected |
|---------|--------|-----------|
| **coming_soon** | eyebrow, title, body, cta_label, cta_url | Yes (travels); catering seeded |

## Intentionally static

- Global navigation structure (5 links)
- Mobile menu layout
- CSS / animations / globe widget
- Ecommerce cart/checkout shell
- Scholarship/freight form field definitions (managed via Form Options admin)
- Social links marked `data-coming-soon`
- Product grids (API-driven)

## CMS field types

Defined in `lib/cms/schemas.ts` — text, textarea, html, url, image, repeatable items.

## Admin routes

| Route | Scope |
|-------|-------|
| `/admin/website-content` | Hub (corporate + companies) |
| `/admin/website-content/corporate/[pageKey]` | Corporate page sections |
| `/admin/companies/[slug]/website-content` | Company page sections |
| `…/preview` | Live layout preview (draft + published) |

## Public API

`GET /api/public/content/[scope]/[pageKey]` — published sections JSON
