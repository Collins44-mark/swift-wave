import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanies } from "@/lib/admin/companies";
import {
  filterDashboardCompanies,
  getDashboardStats,
} from "@/lib/admin/data/dashboard-stats";
import { roleLabel } from "@/lib/admin/labels";
import { DashboardWelcome } from "@/components/admin/DashboardWelcome";
import { DashboardSummaryCard } from "@/components/admin/DashboardSummaryCard";
import { DashboardCompanyGrid } from "@/components/admin/DashboardCompanyGrid";

export const metadata: Metadata = {
  title: "Admin Dashboard — Swift Wave",
  robots: { index: false, follow: false },
};

function SummaryIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const { admin } = access;
  const isSuper = admin.profile.role === "super_admin";
  const displayName =
    admin.profile.full_name?.trim() ||
    (isSuper ? "Super Admin" : admin.user.email || "Administrator");

  const { companies, error } = await getAccessibleCompanies(admin);
  const dashboardCompanies = filterDashboardCompanies(companies);
  const activeCount = dashboardCompanies.filter((c) => c.is_active).length;

  const stats = await getDashboardStats(
    admin,
    dashboardCompanies.length,
    activeCount
  );

  const subtitle = isSuper
    ? "Here's what's happening across your companies today."
    : dashboardCompanies.length > 1
      ? `Managing ${dashboardCompanies.length} assigned companies today.`
      : `Here's what's happening for ${dashboardCompanies[0]?.name || "your company"} today.`;

  return (
    <div className="sw-dash-page">
      <DashboardWelcome displayName={displayName} subtitle={subtitle} />

      <div
        className={`sw-dash-stats${stats.administratorCount === null ? " is-three" : ""}`}
      >
        <DashboardSummaryCard
          label="Total Companies"
          value={String(stats.totalCompanies)}
          icon={
            <SummaryIcon path="M4 20V8.5L12 4l8 4.5V20M9 20v-6h6v6" />
          }
        />
        {stats.administratorCount !== null ? (
          <DashboardSummaryCard
            label="Administrators"
            value={String(stats.administratorCount)}
            icon={
              <SummaryIcon path="M16 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 19.5a6 6 0 0 1 12 0" />
            }
          />
        ) : null}
        <DashboardSummaryCard
          label="Active Companies"
          value={String(stats.activeCompanies)}
          icon={
            <SummaryIcon path="M9 12.5l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          }
        />
        <DashboardSummaryCard
          label="Your Role"
          value={roleLabel(admin.profile.role)}
          accent="gold"
          icon={
            <SummaryIcon path="M5 17.5l2-7h10l2 7M8 10.5h8M7.5 7.5L8.5 4h7l1 3.5" />
          }
        />
      </div>

      <h2 className="sw-dash-section-title">Your Companies</h2>

      {error === "fetch_failed" ? (
        <div className="sw-admin-alert is-error" role="alert">
          Unable to load companies right now. Please refresh and try again.
        </div>
      ) : error === "missing_company" ? (
        <div className="sw-admin-alert is-error" role="alert">
          No company is assigned to your profile. Contact a system administrator.
        </div>
      ) : (
        <DashboardCompanyGrid
          companies={dashboardCompanies}
          emptyMessage="No companies available for your account."
        />
      )}
    </div>
  );
}
