import type { CompanyRecord } from "@/lib/admin/company-types";
import { DashboardCompanyCard } from "@/components/admin/DashboardCompanyCard";

export function DashboardCompanyGrid({
  companies,
  emptyMessage,
}: {
  companies: CompanyRecord[];
  emptyMessage?: string;
}) {
  if (!companies.length) {
    return (
      <div className="sw-admin-empty" role="status">
        {emptyMessage || "No companies available."}
      </div>
    );
  }

  return (
    <div className="sw-dash-company-grid">
      {companies.map((company) => (
        <DashboardCompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
