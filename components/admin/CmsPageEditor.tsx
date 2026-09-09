import Link from "next/link";
import { CmsSectionEditor } from "@/components/admin/CmsSectionEditor";
import { getWebsitePageSections } from "@/lib/admin/data/website-content";
import { listMediaAssets } from "@/lib/admin/data/media";
import { getCmsPage } from "@/lib/cms/schemas";
import { publicPathForPage } from "@/lib/cms/resolve-scope";
import type { WebsiteContent } from "@/lib/admin/types-catalog";

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

  const sectionMap = new Map<string, WebsiteContent>(
    sections.map((s) => [s.section_key, s])
  );

  const publicPath = publicPathForPage(pageKey, isCorporate);
  const previewBase = isCorporate
    ? `/admin/website-content/corporate/${pageKey}/preview`
    : `/admin/companies/${companySlug}/website-content/preview`;

  const visibleSections = activeSection
    ? pageDef.sections.filter((s) => s.key === activeSection)
    : pageDef.sections;

  return (
    <div className="sw-admin-cms-layout">
      <nav className="sw-admin-cms-nav" aria-label="Page sections">
        <p className="sw-admin-cms-nav-title">{pageDef.label}</p>
        <ul>
          {pageDef.sections.map((s) => {
            const rec = sectionMap.get(s.key);
            const href = isCorporate
              ? `/admin/website-content/corporate/${pageKey}?section=${s.key}`
              : `/admin/companies/${companySlug}/website-content?section=${s.key}`;
            return (
              <li key={s.key}>
                <Link
                  href={href}
                  className={
                    (activeSection ?? pageDef.sections[0]?.key) === s.key
                      ? "is-active"
                      : undefined
                  }
                >
                  {s.label}
                  {rec?.status === "draft" ? (
                    <span className="sw-admin-pill">Draft</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost sw-admin-cms-public-link"
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
        >
          View live page ↗
        </Link>
      </nav>

      <div className="sw-admin-cms-main">
        {visibleSections.map((section) => (
          <CmsSectionEditor
            key={section.key}
            companySlug={companySlug}
            pageKey={pageKey}
            section={section}
            record={sectionMap.get(section.key) ?? null}
            mediaLibrary={mediaLibrary}
            canUpload={canUpload}
            previewPath={`${previewBase}?section=${section.key}`}
            backHref={backHref}
          />
        ))}
      </div>
    </div>
  );
}
