import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Preview — Website Content",
  robots: { index: false, follow: false },
};

export default async function CompanyCmsPreviewPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  await requireCompanyAccess(companySlug, "website_content");

  return (
    <div className="sw-admin-preview-shell">
      <div className="sw-admin-preview-bar">
        <strong>Preview — {companySlug}</strong>
        <span>Draft + published content (unpublished drafts visible here)</span>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost"
          href={`/admin/companies/${companySlug}/website-content`}
        >
          ← Back to edit
        </Link>
      </div>
      <div className="sw-admin-preview-frame">
        <LegacyPage slug={companySlug} previewDraft />
      </div>
    </div>
  );
}
