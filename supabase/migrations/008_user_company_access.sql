-- =============================================================================
-- Phase — Multi-company admin access + helper updates
-- Migration: 008_user_company_access.sql
-- =============================================================================

-- Many-to-many: one admin can access multiple companies
CREATE TABLE IF NOT EXISTS public.user_company_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT user_company_access_unique UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS user_company_access_user_id_idx
  ON public.user_company_access (user_id);
CREATE INDEX IF NOT EXISTS user_company_access_company_id_idx
  ON public.user_company_access (company_id);

-- Backfill from legacy profiles.company_id
INSERT INTO public.user_company_access (user_id, company_id, created_by)
SELECT p.id, p.company_id, p.id
FROM public.profiles p
WHERE p.company_id IS NOT NULL
ON CONFLICT (user_id, company_id) DO NOTHING;

-- Allow profiles without a single company_id (access via join table)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_company_required_for_non_super_admin;

-- Keep company_id as optional "primary" company for display; access is authoritative via join table

ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS uca_select_own_or_super ON public.user_company_access;
CREATE POLICY uca_select_own_or_super
  ON public.user_company_access
  FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS uca_manage_super_admin ON public.user_company_access;
CREATE POLICY uca_manage_super_admin
  ON public.user_company_access
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_company_access TO authenticated;

-- ---------------------------------------------------------------------------
-- Update RLS helpers to honor user_company_access
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_has_company_access(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.user_company_access uca
        WHERE uca.user_id = auth.uid()
          AND uca.company_id = target_company_id
      )
      -- Legacy fallback while profiles.company_id still populated
      OR public.current_profile_company_id() = target_company_id
    );
$$;

CREATE OR REPLACE FUNCTION public.belongs_to_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_has_company_access(target_company_id);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND (
      public.is_super_admin()
      OR (
        public.is_company_admin()
        AND public.user_has_company_access(target_company_id)
      )
    );
$$;

-- Staff may update operational records (orders / inquiries) for assigned companies
CREATE OR REPLACE FUNCTION public.can_operate_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND public.user_has_company_access(target_company_id)
    AND (
      public.is_super_admin()
      OR public.is_company_admin()
      OR public.is_staff()
    );
$$;

REVOKE ALL ON FUNCTION public.user_has_company_access(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_operate_company(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_has_company_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_operate_company(uuid) TO anon, authenticated;

-- Staff update policies for orders + inquiries
DROP POLICY IF EXISTS orders_staff_operate_update ON public.orders;
CREATE POLICY orders_staff_operate_update
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.can_operate_company(company_id))
  WITH CHECK (public.can_operate_company(company_id));

DROP POLICY IF EXISTS inquiries_staff_operate_update ON public.inquiries;
CREATE POLICY inquiries_staff_operate_update
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (public.can_operate_company(company_id))
  WITH CHECK (public.can_operate_company(company_id));

-- Super admin can manage all profiles (list/edit for user admin UI)
DROP POLICY IF EXISTS profiles_super_admin_select_all ON public.profiles;
CREATE POLICY profiles_super_admin_select_all
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin() OR id = auth.uid());

-- Ensure super admin update/delete already exist from 001; keep insert for super
