import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { ModuleCompanyHub } from "@/components/admin/ModuleCompanyHub";

export const metadata: Metadata = {
  title: "Media — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  return <ModuleCompanyHub admin={access.admin} hubKey="media" />;
}
