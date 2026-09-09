import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanies } from "@/lib/admin/companies";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata: Metadata = {
  title: "Add Administrator — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/settings");
  }

  const { companies } = await getAccessibleCompanies(access.admin);

  return (
    <>
      <PageHeader
        title="Add Administrator"
        description="Create an administrator account and assign company access."
      />
      <section className="sw-admin-panel">
        <AdminUserForm
          companies={companies.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
        />
      </section>
    </>
  );
}
