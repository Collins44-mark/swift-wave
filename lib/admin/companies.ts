import { createClient } from "@/lib/supabase/server";
import type { CurrentAdmin } from "@/lib/auth/types";
import { adminHasCompanyAccess, adminHasCompanySlug } from "@/lib/auth/get-current-admin";
import {
  COMPANY_SELECT,
  type CompanyRecord,
} from "@/lib/admin/company-types";

/**
 * Load companies visible to the authenticated admin.
 */
export async function getAccessibleCompanies(
  admin: CurrentAdmin
): Promise<{ companies: CompanyRecord[]; error: string | null }> {
  const supabase = await createClient();

  if (admin.profile.role === "super_admin") {
    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .order("name", { ascending: true });

    if (error) return { companies: [], error: "fetch_failed" };
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

  if (error) return { companies: [], error: "fetch_failed" };
  return { companies: (data as CompanyRecord[]) ?? [], error: null };
}

/**
 * Load one company by slug if the admin is allowed to access it.
 */
export async function getAccessibleCompanyBySlug(
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

  if (error) return { company: null, error: "fetch_failed" };
  if (!data) return { company: null, error: "not_found" };

  const company = data as CompanyRecord;
  if (!adminHasCompanyAccess(admin, company.id)) {
    return { company: null, error: "unauthorized" };
  }

  return { company, error: null };
}
