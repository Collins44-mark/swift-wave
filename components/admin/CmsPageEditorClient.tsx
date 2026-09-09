"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CmsSectionEditor } from "@/components/admin/CmsSectionEditor";
import { CmsStructuredSectionEditor } from "@/components/admin/CmsStructuredSectionEditor";
import type { CmsPageDef } from "@/lib/cms/types";
import type { ContentStatus, WebsiteContent } from "@/lib/admin/types-catalog";
import type { MediaAsset } from "@/lib/admin/types-media";

type Props = {
  companySlug: string;
  pageKey: string;
  pageDef: CmsPageDef;
  sections: WebsiteContent[];
  mediaLibrary: MediaAsset[];
  canUpload: boolean;
  isCorporate: boolean;
  activeSection?: string;
  backHref: string;
  publicPath: string;
  previewBase: string;
};

export function CmsPageEditorClient({
  companySlug,
  pageKey,
  pageDef,
  sections,
  mediaLibrary,
  canUpload,
  isCorporate,
  activeSection,
  backHref,
  publicPath,
  previewBase,
}: Props) {
  const initialMap = useMemo(
    () => new Map(sections.map((s) => [s.section_key, s.status ?? "draft"])),
    [sections]
  );
  const [sectionStatuses, setSectionStatuses] =
    useState<Map<string, ContentStatus>>(initialMap);

  const sectionMap = useMemo(
    () => new Map(sections.map((s) => [s.section_key, s])),
    [sections]
  );

  const visibleSections = activeSection
    ? pageDef.sections.filter((s) => s.key === activeSection)
    : pageDef.sections;

  function handleStatusChange(sectionKey: string, status: ContentStatus) {
    setSectionStatuses((prev) => {
      const next = new Map(prev);
      next.set(sectionKey, status);
      return next;
    });
  }

  return (
    <div className="sw-admin-cms-layout">
      <nav className="sw-admin-cms-nav" aria-label="Page sections">
        <p className="sw-admin-cms-nav-title">{pageDef.label}</p>
        <ul>
          {pageDef.sections.map((s) => {
            const status = sectionStatuses.get(s.key) ?? "draft";
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
                  {status === "draft" ? (
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
        {visibleSections.map((section) =>
          section.structuredType ? (
            <CmsStructuredSectionEditor
              key={section.key}
              companySlug={companySlug}
              pageKey={pageKey}
              section={section}
              structuredType={section.structuredType}
              record={sectionMap.get(section.key) ?? null}
              mediaLibrary={mediaLibrary}
              canUpload={canUpload}
              previewPath={`${previewBase}?section=${section.key}`}
              backHref={backHref}
              onStatusChange={handleStatusChange}
            />
          ) : (
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
              onStatusChange={handleStatusChange}
            />
          )
        )}
      </div>
    </div>
  );
}
