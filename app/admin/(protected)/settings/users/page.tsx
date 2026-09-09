import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { listManagedUsers } from "@/lib/admin/data/users";
import { PageHeader } from "@/components/admin/PageHeader";
import { UsersAdminTable } from "@/components/admin/UsersAdminTable";

export const metadata: Metadata = {
  title: "Administrators — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function UsersPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/settings");
  }

  const users = await listManagedUsers();

  return (
    <>
      <PageHeader
        title="Administrators"
        description="Create and manage Super Admins, Company Admins, and Staff with multi-company access."
      />
      <section className="sw-admin-panel">
        <UsersAdminTable users={users} />
      </section>
    </>
  );
}
