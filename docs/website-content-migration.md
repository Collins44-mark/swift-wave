# Website Content Migration Report

## Summary

Existing public website content has been **audited, seeded into Supabase, and connected** to the live site via server-side HTML hydration. The public design is unchanged; CMS controls content values only.

## Pages audited (11)

| Page | Legacy slug | CMS scope | Seeded | Hydration markers |
|------|-------------|-----------|--------|-------------------|
| Home | `home` | corporate | Yes | Hero, values, global teaser, footer |
| About | `about` | corporate | Yes | Partial (hero/story pending markers) |
| Companies | `companies` | corporate | Yes | Hero seeded |
| Global | `global` | corporate | Yes | Hero seeded |
| Contact | `contact` | corporate | Yes | Hero + contact email/phone |
| Scholarship | `scholarship` | scholarship | Yes | Hero + form intro |
| Freight | `freight` | freight | Yes | Seeded |
| Outfit | `outfit` | outfit | Yes | Hero |
| Medical | `medical` | medical | Yes | Hero |
| Travels | `travels` | travels | Yes | Coming soon |
| Catering | `catering` | catering | Yes | Coming soon |

## Database changes (migration `009_cms_corporate_seed.sql`)

- Added company: **Swift Wave Group (Corporate)** — slug `corporate`
- Added columns: `website_content.sort_order`, `website_content.updated_by`
- Seeded **24 published sections** with exact current website copy
- Applied remotely via `supabase db push`

## Content migrated

All seeded values match current `content/*.html` text (not placeholders).

Examples:
- Home hero: *"Building Tomorrow Across Borders"*
- Home CTAs: *Explore Our Companies*, *Partner With Us*
- Values cards: Global Reach, Innovation Driven, Trusted Integrity, Sustainable Growth
- Contact: `info@swiftwavegroup.com`, `+255 700 000 000`

## Images

- Hero/section images remain **current Unsplash URLs** from the legacy site (no visual change).
- Admin can **replace via Cloudinary upload** (ImageFieldPicker) — stores `secure_url` + `public_id` in CMS JSON.
- Bulk migration of Unsplash → Cloudinary folders (`swift-wave/corporate/`, etc.) is **optional follow-up** — upload through Admin Media when ready.

## Public connection

```
Admin edit → website_content (draft/published)
           → LegacyPage server fetch
           → hydrateLegacyHtml(data-cms markers)
           → public page (same layout/CSS)
```

Public routes are now **dynamic** (`ƒ`) to read CMS at request time.

## Admin CMS features

- Section-oriented navigation (page → section)
- **Save draft** / **Publish** workflow
- **Preview** opens actual public layout with draft content
- Image upload via existing Cloudinary integration
- Super Admin: corporate + all companies
- Company Admin: assigned companies only (existing RLS)

## API added

- `GET /api/public/content/[scope]/[pageKey]`

## Intentionally left static

- Nav/footer link structure (duplicated HTML — future shared partial)
- About leadership/stats/gallery (seeded, markers not yet wired)
- Global location cards (seeded, markers not yet wired)
- Companies hub cards (descriptions also in `companies` table)
- Form field labels/options (Form Options admin module)
- Product catalog (Products admin module)

## Manual review recommended

1. Wire remaining `data-cms` markers on about/global/companies pages
2. Upload key hero images to Cloudinary when ready (replace Unsplash URLs)
3. Add SEO fields (meta title/description) per page if needed
4. Corporate company appears in Super Admin company list — hide from non-CMS views if desired

## Tests

| Test | Status |
|------|--------|
| Build | Pass |
| Typecheck | Pass |
| Lint | Pass |
| Migration 009 applied | Pass |
| Home hero reads CMS | Implemented |
| Draft/publish | Implemented |
| Preview route | Implemented |
| Acceptance E2E in browser | Requires manual verify with dev server |

## Key files

| Path | Purpose |
|------|---------|
| `lib/cms/schemas.ts` | Page/section field definitions |
| `lib/cms/seed-content.ts` | TypeScript seed reference |
| `lib/cms/hydrate-html.ts` | Public hydration engine |
| `components/legacy/LegacyPage.tsx` | CMS-connected renderer |
| `components/admin/CmsPageEditor.tsx` | Section admin UI |
| `supabase/migrations/009_cms_corporate_seed.sql` | DB seed |
