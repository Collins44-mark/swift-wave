import { CompanyGridSkeleton } from "@/components/admin/CompanyGrid";
import { PageHeader } from "@/components/admin/PageHeader";

export default function CompaniesLoading() {
  return (
    <>
      <PageHeader
        title="Companies"
        description="Loading company records from Supabase."
      />
      <CompanyGridSkeleton />
    </>
  );
}
