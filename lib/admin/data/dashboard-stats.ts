import { createClient } from "@/lib/supabase/server";
import type { CurrentAdmin } from "@/lib/auth/types";

export type DashboardStats = {
  totalCompanies: number;
  activeCompanies: number;
  administratorCount: number | null;
};

/** Business divisions shown on the dashboard (excludes corporate CMS scope). */
export const DASHBOARD_COMPANY_SLUGS = [
  "outfit",
  "scholarship",
  "freight",
  "medical",
  "travels",
  "catering",
] as const;

export function sortDashboardCompanies<T extends { slug: string }>(
  companies: T[]
): T[] {
  const order = new Map(
    DASHBOARD_COMPANY_SLUGS.map((slug, i) => [slug, i] as const)
  );
  return [...companies].sort(
    (a, b) =>
      (order.get(a.slug as (typeof DASHBOARD_COMPANY_SLUGS)[number]) ?? 99) -
      (order.get(b.slug as (typeof DASHBOARD_COMPANY_SLUGS)[number]) ?? 99)
  );
}

export function filterDashboardCompanies<T extends { slug: string }>(
  companies: T[]
): T[] {
  const allowed = new Set<string>(DASHBOARD_COMPANY_SLUGS);
  return sortDashboardCompanies(
    companies.filter((c) => allowed.has(c.slug))
  );
}

export async function getDashboardStats(
  admin: CurrentAdmin,
  companyCount: number,
  activeCount: number
): Promise<DashboardStats> {
  let administratorCount: number | null = null;

  if (admin.profile.role === "super_admin") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    administratorCount = count ?? 0;
  }

  return {
    totalCompanies: companyCount,
    activeCompanies: activeCount,
    administratorCount,
  };
}
