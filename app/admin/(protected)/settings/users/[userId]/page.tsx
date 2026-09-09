import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanies } from "@/lib/admin/companies";
import { getManagedUser } from "@/lib/admin/data/users";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata: Metadata = {
  title: "Edit Administrator — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/settings");
  }

  const [user, companiesResult] = await Promise.all([
    getManagedUser(userId),
    getAccessibleCompanies(access.admin),
  ]);

  if (!user) notFound();

  return (
    <>
      <PageHeader
        title="Edit Administrator"
        description={user.email || user.full_name || user.id}
      />
      <section className="sw-admin-panel">
        <AdminUserForm
          user={user}
          companies={companiesResult.companies.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
        />
      </section>
    </>
  );
}
