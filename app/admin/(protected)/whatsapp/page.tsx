import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { loadAccessibleCompanies } from "@/lib/admin/companies";
import { filterDashboardCompanies } from "@/lib/admin/data/dashboard-stats";
import { adminCan } from "@/lib/admin/permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { WhatsappAdminClient } from "@/components/admin/WhatsappAdminClient";

export const metadata: Metadata = {
  title: "WhatsApp — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function WhatsappPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const { companies } = await loadAccessibleCompanies();
  const dashboardCompanies = filterDashboardCompanies(companies);
  const canEdit = adminCan(access.admin, "manage_whatsapp");

  return (
    <>
      <PageHeader
        title="WhatsApp"
        description="Manage WhatsApp numbers used for customer inquiries and checkout."
      />
      <section className="sw-admin-panel">
        <WhatsappAdminClient
          canEdit={canEdit}
          companies={dashboardCompanies.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            whatsapp_number: c.whatsapp_number,
          }))}
        />
      </section>
    </>
  );
}
