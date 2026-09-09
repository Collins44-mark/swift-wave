-- =============================================================================
-- Phase 7 — media_assets for Cloudinary references
-- Migration: 007_media_assets.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'image',
  format TEXT,
  width INTEGER,
  height INTEGER,
  bytes BIGINT,
  original_filename TEXT,
  alt_text TEXT,
  folder TEXT,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT media_assets_company_public_id_unique UNIQUE (company_id, cloudinary_public_id)
);

CREATE INDEX IF NOT EXISTS media_assets_company_id_idx ON public.media_assets (company_id);
CREATE INDEX IF NOT EXISTS media_assets_created_at_idx ON public.media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_public_id_idx ON public.media_assets (cloudinary_public_id);

DROP TRIGGER IF EXISTS media_assets_set_updated_at ON public.media_assets;
CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_assets_select_company_members_or_super ON public.media_assets;
CREATE POLICY media_assets_select_company_members_or_super
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (public.belongs_to_company(company_id));

DROP POLICY IF EXISTS media_assets_insert_company_admin_or_super ON public.media_assets;
CREATE POLICY media_assets_insert_company_admin_or_super
  ON public.media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_company(company_id));

DROP POLICY IF EXISTS media_assets_update_company_admin_or_super ON public.media_assets;
CREATE POLICY media_assets_update_company_admin_or_super
  ON public.media_assets
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_company(company_id))
  WITH CHECK (public.can_manage_company(company_id));

DROP POLICY IF EXISTS media_assets_delete_company_admin_or_super ON public.media_assets;
CREATE POLICY media_assets_delete_company_admin_or_super
  ON public.media_assets
  FOR DELETE
  TO authenticated
  USING (public.can_manage_company(company_id));

-- Public site may display media URLs already stored on products/content;
-- no public SELECT on media_assets required for Phase 7.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_assets TO authenticated;
