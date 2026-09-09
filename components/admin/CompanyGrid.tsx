import type { CompanyRecord } from "@/lib/admin/company-types";
import { CompanyCard } from "@/components/admin/CompanyCard";

export function CompanyGrid({
  companies,
  emptyMessage,
}: {
  companies: CompanyRecord[];
  emptyMessage?: string;
}) {
  if (!companies.length) {
    return (
      <div className="sw-admin-empty" role="status">
        {emptyMessage || "No companies available for your account."}
      </div>
    );
  }

  return (
    <div className="sw-admin-company-grid">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}

export function CompanyGridSkeleton() {
  return (
    <div className="sw-admin-skeleton-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="sw-admin-skeleton-card" />
      ))}
    </div>
  );
}
