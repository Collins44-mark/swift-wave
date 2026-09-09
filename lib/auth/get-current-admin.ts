import { createClient } from "@/lib/supabase/server";
import type {
  AdminAccessError,
  AdminCompany,
  AdminProfile,
  AdminRole,
  CurrentAdmin,
} from "@/lib/auth/types";

const ALLOWED_ROLES: AdminRole[] = [
  "super_admin",
  "company_admin",
  "staff",
];

function isAdminRole(value: string): value is AdminRole {
  return ALLOWED_ROLES.includes(value as AdminRole);
}

export type GetCurrentAdminResult =
  | { ok: true; admin: CurrentAdmin }
  | { ok: false; error: AdminAccessError };

/**
 * Server-only helper: authenticated user + profile + role + company access.
 * Authorization is derived from public.profiles + user_company_access (and RLS).
 */
export async function getCurrentAdmin(): Promise<GetCurrentAdminResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "unauthenticated" };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, company_id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileRow) {
    return { ok: false, error: "no_profile" };
  }

  if (!profileRow.is_active) {
    return { ok: false, error: "inactive" };
  }

  if (!isAdminRole(profileRow.role)) {
    return { ok: false, error: "invalid_role" };
  }

  let companies: AdminCompany[] = [];

  if (profileRow.role === "super_admin") {
    const { data: allCompanies } = await supabase
      .from("companies")
      .select("id, name, slug, is_active")
      .order("name", { ascending: true });
    companies = (allCompanies as AdminCompany[]) ?? [];
  } else {
    const { data: accessRows } = await supabase
      .from("user_company_access")
      .select("company_id, company:companies(id, name, slug, is_active)")
      .eq("user_id", user.id);

    const fromAccess: AdminCompany[] = [];
    for (const row of accessRows ?? []) {
      const nested = row.company as
        | AdminCompany
        | AdminCompany[]
        | null
        | undefined;
      const c = Array.isArray(nested) ? nested[0] : nested;
      if (c?.id) fromAccess.push(c);
    }

    // Legacy fallback: profiles.company_id
    if (!fromAccess.length && profileRow.company_id) {
      const { data: legacy } = await supabase
        .from("companies")
        .select("id, name, slug, is_active")
        .eq("id", profileRow.company_id)
        .maybeSingle();
      if (legacy) fromAccess.push(legacy as AdminCompany);
    }

    companies = fromAccess;

    if (!companies.length) {
      return { ok: false, error: "missing_company" };
    }
  }

  const primaryId = profileRow.company_id;
  const company =
    companies.find((c) => c.id === primaryId) ?? companies[0] ?? null;

  const profile: AdminProfile = {
    id: profileRow.id,
    full_name: profileRow.full_name,
    role: profileRow.role,
    company_id: profileRow.company_id,
    is_active: profileRow.is_active,
  };

  return {
    ok: true,
    admin: {
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile,
      company,
      companies,
    },
  };
}

export async function requireAdmin(): Promise<CurrentAdmin> {
  const result = await getCurrentAdmin();
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.admin;
}

export function adminHasCompanyAccess(
  admin: CurrentAdmin,
  companyId: string
): boolean {
  if (admin.profile.role === "super_admin") return true;
  return admin.companies.some((c) => c.id === companyId);
}

export function adminHasCompanySlug(
  admin: CurrentAdmin,
  slug: string
): boolean {
  if (admin.profile.role === "super_admin") return true;
  return admin.companies.some((c) => c.slug === slug);
}
