import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getCmsScope } from "@/lib/cms/schemas";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminHubLink } from "@/components/navigation/AdminHubLink";

export const metadata: Metadata = {
  title: "Corporate Website Content — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CorporateCmsHubPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/website-content");
  }

  const scope = getCmsScope("corporate");
  if (!scope) {
    return <div className="sw-admin-empty">Corporate CMS not configured.</div>;
  }

  return (
    <>
      <PageHeader
        title="Corporate Website Content"
        description="Manage the Swift Wave Group corporate website — home, about, companies, global, and contact."
      />
      <div className="sw-admin-hub-grid" style={{ marginBottom: "1.5rem" }}>
        <AdminHubLink href="/admin/website-content/hero">
          <strong>Hero Images</strong>
          <span>Manage hero/banner images for all corporate pages →</span>
        </AdminHubLink>
      </div>
      <div className="sw-admin-hub-grid">
        {scope.pages.map((page) => (
          <AdminHubLink
            key={page.key}
            href={`/admin/website-content/corporate/${page.key}`}
          >
            <strong>{page.label}</strong>
            <span>
              {page.sections.length} sections · {page.route} →
            </span>
          </AdminHubLink>
        ))}
      </div>
    </>
  );
}
