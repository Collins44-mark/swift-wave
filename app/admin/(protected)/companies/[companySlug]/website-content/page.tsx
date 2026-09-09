import type { Metadata } from "next";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { getCompanyCapabilities } from "@/lib/admin/capabilities";
import { getCmsScope } from "@/lib/cms/schemas";
import { CmsPageEditor } from "@/components/admin/CmsPageEditor";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = {
  title: "Website Content — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function WebsiteContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { companySlug } = await params;
  const { section } = await searchParams;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "website_content"
  );
  const caps = getCompanyCapabilities(companySlug);
  const cmsScope = getCmsScope(companySlug);
  const pageKey = companySlug;

  if (!cmsScope) {
    return (
      <div className="sw-admin-empty">
        No CMS schema configured for this company.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Website Content"
        description={`Edit ${company.name} public page content. Changes publish to ${caps.label}.`}
      />
      <CmsPageEditor
        companySlug={companySlug}
        pageKey={pageKey}
        companyId={company.id}
        isCorporate={false}
        canUpload={canMutate(admin)}
        activeSection={section}
        backHref={`/admin/companies/${companySlug}`}
      />
    </>
  );
}
