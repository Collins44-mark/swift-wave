-- Collapse repeated profiles lookups inside company-access RLS helpers.
-- Authorization rules stay the same: super_admin, join-table access, or legacy profiles.company_id.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
      AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_company_access(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_company_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_active = true
        AND (
          p.role = 'super_admin'
          OR p.company_id = target_company_id
          OR EXISTS (
            SELECT 1
            FROM public.user_company_access uca
            WHERE uca.user_id = p.id
              AND uca.company_id = target_company_id
          )
        )
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
