import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanyBySlug } from "@/lib/admin/companies";
import { canMutate } from "@/lib/admin/require-company-access";
import { getCmsPage } from "@/lib/cms/schemas";
import { CmsPageEditor } from "@/components/admin/CmsPageEditor";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = {
  title: "Edit Corporate Page — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CorporateCmsPageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ pageKey: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { pageKey } = await params;
  const { section } = await searchParams;

  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/website-content");
  }

  const pageDef = getCmsPage("corporate", pageKey);
  if (!pageDef) notFound();

  const { company, error } = await getAccessibleCompanyBySlug(
    access.admin,
    "corporate"
  );
  if (error || !company) notFound();

  return (
    <>
      <PageHeader
        title={`Corporate — ${pageDef.label}`}
        description={`Edit content for ${pageDef.route}. Published changes appear on the live corporate site.`}
      />
      <CmsPageEditor
        companySlug="corporate"
        pageKey={pageKey}
        companyId={company.id}
        isCorporate
        canUpload={canMutate(access.admin)}
        activeSection={section}
        backHref="/admin/website-content/corporate"
      />
    </>
  );
}
