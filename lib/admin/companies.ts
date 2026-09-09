import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CurrentAdmin } from "@/lib/auth/types";
import {
  adminHasCompanyAccess,
  adminHasCompanySlug,
  getCurrentAdmin,
} from "@/lib/auth/get-current-admin";
import {
  COMPANY_SELECT,
  type CompanyRecord,
} from "@/lib/admin/company-types";

async function fetchAccessibleCompanies(
  admin: CurrentAdmin
): Promise<{ companies: CompanyRecord[]; error: string | null }> {
  const supabase = await createClient();

  if (admin.profile.role === "super_admin") {
    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .order("name", { ascending: true });

    if (error) {
      console.error("[getAccessibleCompanies]", error.message);
      return { companies: [], error: "fetch_failed" };
    }
    return { companies: (data as CompanyRecord[]) ?? [], error: null };
  }

  const ids = admin.companies.map((c) => c.id);
  if (!ids.length) {
    return { companies: [], error: "missing_company" };
  }

  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .in("id", ids)
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAccessibleCompanies]", error.message);
    return { companies: [], error: "fetch_failed" };
  }
  return { companies: (data as CompanyRecord[]) ?? [], error: null };
}

async function fetchAccessibleCompanyBySlug(
  admin: CurrentAdmin,
  slug: string
): Promise<{ company: CompanyRecord | null; error: string | null }> {
  if (!adminHasCompanySlug(admin, slug)) {
    return { company: null, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getAccessibleCompanyBySlug]", error.message);
    return { company: null, error: "fetch_failed" };
  }
  if (!data) return { company: null, error: "not_found" };

  const company = data as CompanyRecord;
  if (!adminHasCompanyAccess(admin, company.id)) {
    return { company: null, error: "unauthorized" };
  }

  return { company, error: null };
}

/** Cached per request — preferred for layout + page chains. */
export const loadAccessibleCompanies = cache(async () => {
  const access = await getCurrentAdmin();
  if (!access.ok) {
    return { companies: [] as CompanyRecord[], error: "unauthenticated" };
  }
  return fetchAccessibleCompanies(access.admin);
});

/** Cached per request by slug — preferred for company layout + pages. */
export const loadAccessibleCompanyBySlug = cache(async (slug: string) => {
  const access = await getCurrentAdmin();
  if (!access.ok) {
    return { company: null as CompanyRecord | null, error: "unauthorized" };
  }
  return fetchAccessibleCompanyBySlug(access.admin, slug);
});

/**
 * Load companies visible to the authenticated admin.
 * Delegates to the cached loader when the admin matches the current session.
 */
export async function getAccessibleCompanies(
  admin: CurrentAdmin
): Promise<{ companies: CompanyRecord[]; error: string | null }> {
  const access = await getCurrentAdmin();
  if (access.ok && access.admin.user.id === admin.user.id) {
    return loadAccessibleCompanies();
  }
  return fetchAccessibleCompanies(admin);
}

/**
 * Load one company by slug if the admin is allowed to access it.
 * Delegates to the cached loader when the admin matches the current session.
 */
export async function getAccessibleCompanyBySlug(
  admin: CurrentAdmin,
  slug: string
): Promise<{ company: CompanyRecord | null; error: string | null }> {
  const access = await getCurrentAdmin();
  if (access.ok && access.admin.user.id === admin.user.id) {
    return loadAccessibleCompanyBySlug(slug);
  }
  return fetchAccessibleCompanyBySlug(admin, slug);
}
