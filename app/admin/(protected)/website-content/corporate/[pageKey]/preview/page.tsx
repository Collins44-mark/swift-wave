import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getCmsPage } from "@/lib/cms/schemas";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Preview — Corporate Website",
  robots: { index: false, follow: false },
};

export default async function CorporateCmsPreviewPage({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  const { pageKey } = await params;

  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/website-content");
  }

  const pageDef = getCmsPage("corporate", pageKey);
  if (!pageDef) notFound();

  return (
    <div className="sw-admin-preview-shell">
      <div className="sw-admin-preview-bar">
        <strong>Preview — {pageDef.label}</strong>
        <span>Uses actual public page layout with draft CMS content</span>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost"
          href={`/admin/website-content/corporate/${pageKey}`}
        >
          ← Back to edit
        </Link>
      </div>
      <div className="sw-admin-preview-frame">
        <LegacyPage slug={pageKey} previewDraft />
      </div>
    </div>
  );
}
