import { CompanyGridSkeleton } from "@/components/admin/CompanyGrid";
import { PageHeader } from "@/components/admin/PageHeader";

export default function DashboardLoading() {
  return (
    <>
      <PageHeader
        title="Welcome back…"
        description="Loading your Swift Wave workspace."
      />
      <div className="sw-admin-stats" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sw-admin-skeleton-card" style={{ height: 96 }} />
        ))}
      </div>
      <CompanyGridSkeleton />
    </>
  );
}
