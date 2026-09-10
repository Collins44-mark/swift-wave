import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CurrentAdmin } from "@/lib/auth/types";
import {
  adminHasCompanyAccess,
  getCurrentAdmin,
} from "@/lib/auth/get-current-admin";
import { normalizeCompanySlug } from "@/lib/admin/company-slug";
import {
  COMPANY_SELECT,
  COMPANY_SELECT_CORE,
  hydrateCompanyRecord,
  type CompanyRecord,
} from "@/lib/admin/company-types";

type CompanyQueryResult = {
  companies: CompanyRecord[];
  error: string | null;
};

async function selectCompanies(query: {
  eq?: [string, string];
  in?: [string, string[]];
  orderName?: boolean;
  limit?: number;
}): Promise<{ data: CompanyRecord[]; error: string | null }> {
  const supabase = await createClient();

  let fullQuery = supabase.from("companies").select(COMPANY_SELECT);
  if (query.eq) fullQuery = fullQuery.eq(query.eq[0], query.eq[1]);
  if (query.in) fullQuery = fullQuery.in(query.in[0], query.in[1]);
  if (query.orderName) fullQuery = fullQuery.order("name", { ascending: true });
  if (query.limit) fullQuery = fullQuery.limit(query.limit);

  const full = await fullQuery;
  if (!full.error) {
    return {
      data: (full.data ?? []).map((row) => hydrateCompanyRecord(row)),
      error: null,
    };
  }

  console.error(
    "[companies] full select failed, retrying core columns:",
    full.error.message
  );

  let coreQuery = supabase.from("companies").select(COMPANY_SELECT_CORE);
  if (query.eq) coreQuery = coreQuery.eq(query.eq[0], query.eq[1]);
  if (query.in) coreQuery = coreQuery.in(query.in[0], query.in[1]);
  if (query.orderName) {
    coreQuery = coreQuery.order("name", { ascending: true });
  }
  if (query.limit) coreQuery = coreQuery.limit(query.limit);

  const core = await coreQuery;
  if (core.error) {
    console.error("[companies] core select failed:", core.error.message);
    return { data: [], error: core.error.message };
  }

  return {
    data: (core.data ?? []).map((row) => hydrateCompanyRecord(row)),
    error: null,
  };
}

async function fetchAccessibleCompanies(
  admin: CurrentAdmin
): Promise<CompanyQueryResult> {
  if (admin.profile.role === "super_admin") {
    const { data, error } = await selectCompanies({ orderName: true });
    if (error) return { companies: [], error: "fetch_failed" };
    return { companies: data, error: null };
  }

  const ids = admin.companies.map((c) => c.id);
  if (!ids.length) {
    return { companies: [], error: "missing_company" };
  }

  const { data, error } = await selectCompanies({
    in: ["id", ids],
    orderName: true,
  });
  if (error) return { companies: [], error: "fetch_failed" };
  return { companies: data, error: null };
}

function pickCompanyRow(
  rows: CompanyRecord[],
  slug: string
): CompanyRecord | null {
  const exact = rows.filter((c) => c.slug.toLowerCase() === slug);
  const pool = exact.length ? exact : rows;
  return pool.find((c) => c.is_active) ?? pool[0] ?? null;
}

async function fetchAccessibleCompanyBySlug(
  admin: CurrentAdmin,
  slug: string
): Promise<{ company: CompanyRecord | null; error: string | null }> {
  const normalized = normalizeCompanySlug(slug);
  if (!normalized) {
    return { company: null, error: "not_found" };
  }

  const bySlug = await selectCompanies({
    eq: ["slug", normalized],
    limit: 5,
  });

  let company = pickCompanyRow(bySlug.data, normalized);

  if (!company) {
    const known = admin.companies.find(
      (c) => c.slug.toLowerCase() === normalized
    );
    if (known?.id) {
      const byId = await selectCompanies({
        eq: ["id", known.id],
        limit: 1,
      });
      company = byId.data[0] ?? null;
      if (byId.error && !company) {
        return { company: null, error: "fetch_failed" };
      }
    }
  }

  if (bySlug.error && !company) {
    return { company: null, error: "fetch_failed" };
  }

  if (!company) {
    return { company: null, error: "not_found" };
  }

  if (admin.profile.role === "super_admin") {
    return { company, error: null };
  }

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
  return fetchAccessibleCompanyBySlug(
    access.admin,
    normalizeCompanySlug(slug)
  );
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
