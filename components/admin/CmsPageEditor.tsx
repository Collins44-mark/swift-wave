import { CmsPageEditorClient } from "@/components/admin/CmsPageEditorClient";
import { getWebsitePageSections } from "@/lib/admin/data/website-content";
import { listMediaAssets } from "@/lib/admin/data/media";
import { getCmsPage } from "@/lib/cms/schemas";
import { publicPathForPage } from "@/lib/cms/resolve-scope";

type Props = {
  companySlug: string;
  pageKey: string;
  companyId: string;
  isCorporate: boolean;
  canUpload: boolean;
  activeSection?: string;
  backHref: string;
};

export async function CmsPageEditor({
  companySlug,
  pageKey,
  companyId,
  isCorporate,
  canUpload,
  activeSection,
  backHref,
}: Props) {
  const pageDef = getCmsPage(companySlug, pageKey);
  if (!pageDef) {
    return (
      <div className="sw-admin-empty">No CMS schema defined for this page.</div>
    );
  }

  const [sections, mediaLibrary] = await Promise.all([
    getWebsitePageSections(companyId, pageKey),
    listMediaAssets(companyId),
  ]);

  const publicPath = publicPathForPage(pageKey, isCorporate);
  const previewBase = isCorporate
    ? `/admin/website-content/corporate/${pageKey}/preview`
    : `/admin/companies/${companySlug}/website-content/preview`;

  return (
    <CmsPageEditorClient
      companySlug={companySlug}
      pageKey={pageKey}
      pageDef={pageDef}
      sections={sections}
      mediaLibrary={mediaLibrary}
      canUpload={canUpload}
      isCorporate={isCorporate}
      activeSection={activeSection}
      backHref={backHref}
      publicPath={publicPath}
      previewBase={previewBase}
    />
  );
}
