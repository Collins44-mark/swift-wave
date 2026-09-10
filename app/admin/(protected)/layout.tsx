import { redirect } from "next/navigation";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { filterDashboardCompanies } from "@/lib/admin/data/dashboard-stats";
import { AdminShell } from "@/components/admin/AdminShell";
import "../admin.css";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getCurrentAdmin();

  if (!access.ok) {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
    redirect(`/admin/login?error=${encodeURIComponent(access.error)}`);
  }

  const companyCount = filterDashboardCompanies(access.admin.companies).length;

  return (
    <div className="sw-admin">
      <AdminShell admin={access.admin} companyCount={companyCount}>
        {children}
      </AdminShell>
    </div>
  );
}
