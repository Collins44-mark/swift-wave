# Swift Wave — Company Admin Audit

**Audit date:** 2026-09-09  
**Source of truth:** Migrated Next.js site (`content/*.html`, `public/js/pages/*.js`, `content/manifest.json`, `app/companies/**`)  
**Schema baseline:** `supabase/migrations/001_initial_schema.sql`

---

## Shared architecture (all companies)

| Layer | Path |
|---|---|
| Next route | `app/companies/<slug>/page.tsx` → `LegacyPage` |
| HTML | `content/<slug>.html` |
| Scripts | `public/js/main.js` + `public/js/pages/<slug>.js` |
| Manifest | `content/manifest.json` |

**Coming soon mechanism:** Travels & Catering use `refresh: "2;url=/companies"`, `ComingSoonRedirect`, and `data-coming-soon` hub links + toast.

**Hardcoded WhatsApp (all live conversion flows):** `255700000000` (placeholder). DB already has `companies.whatsapp_number` — public JS does not read it yet.

**Shared UI patterns:** `co-shop-hero`, sister “More companies” grid, site footer. No FAQ blocks on any company page.

---

## Capability map (derived from audit)

| Capability | Scholarship | Freight | Outfit | Medical | Travels | Catering |
|---|---|---|---|---|---|---|
| `overview` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `website_content` | ✓ | ✓ | ✓ | ✓ | ✓ (placeholder) | ✓ (placeholder) |
| `media` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `whatsapp` | ✓ | ✓ | ✓ | ✓ | planned | planned |
| `settings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `products` | — | — | ✓ | ✓ | — | — |
| `categories` | — | — | ✓ | ✓ | — | — |
| `orders` | — | — | ✓ | ✓ | — | — |
| `inquiries` | ✓ (applications) | ✓ (bookings) | — | — | — | — |
| `form_options` | ✓ | — | — | — | — | — |
| `route_hubs` | — | ✓ | — | — | — | — |
| `coming_soon` | — | — | — | — | ✓ | ✓ |

Shared infrastructure is allowed; navigation is capability-driven per company.

---

## 1. Swift Wave Scholarship

### Website pages
- `/companies/scholarship` — live application form page

### Website features
- Hero (badge “Apply”, title, WhatsApp hint)
- Multi-field application form → WhatsApp message
- Sister companies + footer

### Form fields (actual)
Full name, Mobile, Nationality (+ Other), Destination country (+ Other), Education level (Diploma/Degree/Masters/PhD), Field of study (fixed list + Other), Additional notes

### Content requiring CMS
- Hero badge, title, subtitle/hint, background image
- Form heading + intro + submit CTA label
- Option lists (nationalities, destinations, levels, fields)
- WhatsApp number

### Structured business data
- **Not** products/orders
- Application/inquiry records (optional but valuable for admin inbox)
- Form option catalogs → `company_settings`
- Website sections → `website_content`

### Customer workflow
Visitor fills form → validates client-side → opens `wa.me/{number}?text=…`  
**No DB write today.**

### Admin functionality required
| Module | Purpose |
|---|---|
| Overview | Application counts (when logged) |
| Applications / Inquiries | List/view status of submissions (when public form also posts to DB) |
| Form Options | Edit select lists |
| Website Content | Hero + form copy |
| WhatsApp | Number configuration |
| Media | Hero/supporting images (Cloudinary-ready URLs) |
| Settings | Company identity / activation |

---

## 2. Swift Wave Freight

### Website pages
- `/companies/freight` — live freight booking page

### Website features
- Hero (badge “Book”)
- 3-step booking: Route → Collection slots → Details → WhatsApp
- Hub weekday rules hardcoded in JS (`HUB_DAYS`)

### Route hubs (actual)
From/To: China, Dubai (UAE), India, Tanzania, Kenya, Other  
Collection weekdays per hub (e.g. China Tue/Fri; Dubai Mon/Thu; …)

### Content requiring CMS
- Hero + booking intro + step labels
- Empty-slots message
- Field labels
- Hub schedule configuration
- WhatsApp number

### Structured business data
- Hub schedules → `company_settings`
- Booking/inquiry records (name, mobile, route, slot, cargo)
- Not an ecommerce catalog

### Customer workflow
Select route → pick generated slot → enter details → WhatsApp booking message  
**No DB write / capacity holds today.**

### Admin functionality required
| Module | Purpose |
|---|---|
| Overview | Booking inquiry counts |
| Bookings / Inquiries | Inbox + status |
| Route Hubs | Edit hubs & collection weekdays |
| Website Content | Hero + booking copy |
| WhatsApp | Number |
| Media / Settings | Shared |

---

## 3. Swift Wave Outfit

### Website pages
- `/companies/outfit` — live ecommerce shop + PDP + cart + WhatsApp checkout

### Website features
- Category filters + subfilters
- Product grid (21 hardcoded SKUs)
- Hash PDP `#product/<id>`
- Related items
- In-memory cart (no localStorage)
- Checkout modal (name + mobile) → WhatsApp order

### Categories (actual)
```
Men: Shirts, Trousers, Outerwear, Knitwear
Women: Dresses, Tops, Bottoms, Sets
Footwear: Sneakers, Formal, Sandals, Boots
Accessories: Bags, Belts, Hats, Scarves
```

### Content requiring CMS
- Hero title/hint/image
- Catalog heading, shipping note
- Checkout copy
- Full product + category catalog
- WhatsApp number

### Structured business data
- Categories (nested)
- Products (name, price TZS, image, description, bullets, rating, category/sub, status)
- Orders + order_items
- Media URLs (`image_url`, `image_public_id`)

### Customer workflow
Browse → filter → PDP → Add to cart / Checkout → Cart → Checkout form → WhatsApp  
**Cart/order not persisted today.**

### Admin functionality required
| Module | Purpose |
|---|---|
| Overview | Products, categories, orders, pending |
| Products | Full CRUD |
| Categories | Full CRUD (parent + sub) |
| Orders | List, view, status updates |
| Website Content | Hero / shop copy |
| Media | Product/hero images (URLs for now) |
| WhatsApp | Checkout number |
| Settings | Company settings |

---

## 4. Swift Wave Medical Aid

### Website pages
- `/companies/medical` — live ecommerce (same shell as Outfit)

### Website features
Identical UX pattern to Outfit with different catalog.

### Categories (actual)
```
All, Supplies, Equipment,
Skin Care: Lotion, Shampoo, Oil, Cleanser, Gel,
Wellness, Contracts
```

### Products
~20 items including fixed TZS prices and non-numeric labels: “Get Quote”, “Enquire”, “24/7 Order”.

### Content / structured data / workflow
Same as Outfit (products, categories, orders, WhatsApp checkout).

### Admin functionality required
Same ecommerce module set as Outfit. Support `price_label` / nullable price for enquire/quote items.  
**Do not build clinical EMR / patient records.**

---

## 5. Swift Wave Travels & Tours

### Website pages
- `/companies/travels` — **Coming soon** stub (auto-redirect to `/companies`)
- Hub card on `/companies` blocked via `data-coming-soon`

### Website features
None live (no tours, packages, bookings).

### Hub marketing copy (only)
“Curated travel experiences, corporate bookings, and destination services…”

### Content requiring CMS
- Coming-soon card copy
- Hub description
- Future page sections (not invent detailed tour ERP yet)

### Structured business data
**None required by live site.** Keep company row + settings + website_content ready for launch.

### Admin functionality required
| Module | Purpose |
|---|---|
| Overview | Status / coming-soon flag |
| Website Content | Coming-soon + hub blurbs |
| Media | Card imagery |
| Settings | Activate/publish when ready |
| WhatsApp | Placeholder config for launch |

**Do not invent tours/packages/itineraries CRUD until a live page exists.**

---

## 6. Swift Wave Catering & Events

### Website pages
- `/companies/catering` — **Coming soon** stub (same pattern as Travels)

### Hub marketing copy
“Premium catering for corporate events, celebrations, and hospitality experiences…”

### Admin functionality required
Same as Travels (coming-soon workspace). **No menus/events ERP until live site exists.**

---

## Schema review vs audit

### Reuse as-is
`companies`, `profiles`, `categories`, `products`, `orders`, `order_items`, `website_content`, `company_settings`

### Gaps to close (migration 002+)
1. **Nested categories** — `categories.parent_id`
2. **Product storefront fields** — `subcategory`, `bullets` JSONB, `rating`, `price_label`, sort order
3. **Inquiries** — scholarship applications + freight bookings (company-scoped, JSONB payload)
4. **Public insert policies** (carefully) for inquiry/order creation from website OR server actions only

### Intentionally not creating now
`tours`, `tour_packages`, `universities`, `menus`, `events`, `shipments`, clinical records — no live website evidence.

---

## Implementation priorities

1. Capability-driven company workspace shell  
2. Ecommerce (Outfit + Medical): categories, products, orders  
3. Scholarship + Freight: inquiries + settings (form options / hubs) + WhatsApp  
4. Website content CRUD for hero sections  
5. Travels + Catering: overview + coming-soon content/settings  
6. Seed Outfit/Medical catalogs from current JS into Supabase  
7. Wire public ecommerce/forms to Supabase where safe without redesign  

---

## Public website connection plan

| Surface | Phase 6 target |
|---|---|
| Outfit/Medical catalog | Load published products/categories from Supabase; keep existing HTML/CSS/UX |
| Scholarship/Freight forms | Persist inquiry to Supabase then open WhatsApp |
| WhatsApp number | Read from `companies.whatsapp_number` (fallback to current placeholder) |
| Travels/Catering | Remain coming soon |
| Visual design | Unchanged |

---

## Implementation status (Phase 6)

| Area | Status |
|---|---|
| Audit doc | Done (`docs/company-admin-audit.md`) |
| Capability map | Done (`lib/admin/capabilities.ts`) |
| Migrations 002–006 | Applied remotely |
| Company workspaces | Done — capability-driven nav + CRUD modules |
| Outfit/Medical catalog seed | 21 + 20 published products |
| Public catalog API | Live |
| Public inquiry/order RPCs | Live (`submit_website_inquiry`, `submit_website_order`) |
| Soft-wired public JS | Outfit, Medical, Scholarship, Freight |
| Cloudinary Media UI | Coming Soon (fields `image_url` / `image_public_id` ready) |
| Travels/Catering deep modules | Intentionally not built (coming soon sites) |

---

*End of audit.*
