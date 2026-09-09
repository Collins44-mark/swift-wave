import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanies } from "@/lib/admin/companies";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyGrid } from "@/components/admin/CompanyGrid";

export const metadata: Metadata = {
  title: "Companies — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCompaniesPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const { admin } = access;
  const { companies, error } = await getAccessibleCompanies(admin);

  return (
    <>
      <PageHeader
        title="Companies"
        description={
          admin.profile.role === "super_admin"
            ? "Select a Swift Wave company to open its management workspace."
            : "Your assigned company workspace."
        }
      />

      {error === "fetch_failed" ? (
        <div className="sw-admin-alert is-error" role="alert">
          Unable to load companies right now. Please refresh and try again.
        </div>
      ) : error === "missing_company" ? (
        <div className="sw-admin-alert is-error" role="alert">
          No company is assigned to your profile. Contact a system administrator.
        </div>
      ) : (
        <CompanyGrid
          companies={companies}
          emptyMessage={
            admin.profile.role === "super_admin"
              ? "No active companies found."
              : "No company is assigned to your profile."
          }
        />
      )}
    </>
  );
}
