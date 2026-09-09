# Swift Wave Group

Next.js (App Router + TypeScript) migration of the approved Swift Wave Group static website.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check

## Notes

- Public UI markup lives in `content/` and is rendered 1:1 via App Router pages.
- Original static HTML/CSS/JS is preserved under `_legacy/`.
- Deploy on Vercel with Framework Preset **Next.js** (see `vercel.json`). Root Directory: `./`.
- Static assets are served from `public/assets`, `public/css`, and `public/js`.
- Supabase is not integrated yet (see `.env.example` for later).
