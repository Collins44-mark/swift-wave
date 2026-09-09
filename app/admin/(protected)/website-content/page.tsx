import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { ModuleCompanyHub } from "@/components/admin/ModuleCompanyHub";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = {
  title: "Website Content — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  const isSuper = access.admin.profile.role === "super_admin";

  return (
    <>
      <PageHeader
        title="Website Content"
        description="Edit corporate and company public website content."
      />
      {isSuper ? (
        <>
          <div className="sw-admin-section-head">
            <div>
              <h2>Corporate website</h2>
              <p>Home, about, companies hub, global presence, and contact.</p>
            </div>
          </div>
          <div className="sw-admin-hub-grid" style={{ marginBottom: "1.5rem" }}>
            <Link className="sw-admin-hub-card" href="/admin/website-content/corporate">
              <strong>Swift Wave Group (Corporate)</strong>
              <span>5 pages · home, about, companies, global, contact →</span>
            </Link>
          </div>
        </>
      ) : null}
      <div className="sw-admin-section-head">
        <div>
          <h2>Company websites</h2>
          <p>Select a division workspace to edit its public page content.</p>
        </div>
      </div>
      <ModuleCompanyHub admin={access.admin} hubKey="website-content" />
    </>
  );
}
