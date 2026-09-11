"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import type { CmsSectionDef } from "@/lib/cms/types";
import type { ContentStatus, WebsiteContent } from "@/lib/admin/types-catalog";
import { ImageFieldPicker } from "@/components/admin/ImageFieldPicker";
import type { MediaAsset } from "@/lib/admin/types-media";
import {
  publishWebsiteSection,
  saveWebsiteSectionDraft,
} from "@/lib/admin/client-actions";

type Props = {
  companySlug: string;
  pageKey: string;
  section: CmsSectionDef;
  record: WebsiteContent | null;
  mediaLibrary: MediaAsset[];
  canUpload: boolean;
  previewPath: string;
  backHref: string;
  onStatusChange?: (sectionKey: string, status: ContentStatus) => void;
};

function fieldValue(
  content: Record<string, unknown> | undefined,
  key: string
): string {
  const v = content?.[key];
  return typeof v === "string" ? v : "";
}

export function CmsSectionEditor({
  companySlug,
  pageKey,
  section,
  record,
  mediaLibrary,
  canUpload,
  previewPath,
  backHref,
  onStatusChange,
}: Props) {
  const { showSuccess, showError } = useAdminToastContext();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const content = (record?.content ?? {}) as Record<string, unknown>;
  const [status, setStatus] = useState(record?.status ?? "draft");

  return (
    <section className="sw-admin-panel">
      <div className="sw-admin-toolbar" style={{ marginBottom: "0.85rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>{section.label}</h2>
          {section.description ? (
            <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
              {section.description}
            </p>
          ) : null}
        </div>
        <span
          className={`sw-admin-badge ${
            status === "published" ? "is-active" : "is-inactive"
          }`}
        >
          {status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {error ? (
        <div className="sw-admin-alert is-error" role="alert">
          {error}
        </div>
      ) : null}

      <form
        className="sw-admin-form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("page_key", pageKey);
          fd.set("section_key", section.key);
          const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute(
            "data-action"
          );
          setError(null);
          startTransition(async () => {
            const result =
              action === "draft"
                ? await saveWebsiteSectionDraft(companySlug, fd)
                : await publishWebsiteSection(companySlug, fd);
            if (!result.ok) {
              setError(result.error);
              showError("Couldn't save changes.");
              return;
            }
            const nextStatus: ContentStatus =
              action === "draft" ? "draft" : "published";
            setStatus(nextStatus);
            onStatusChange?.(section.key, nextStatus);
            showSuccess("Changes saved.");
          });
        }}
      >
        {section.fields.map((field) => {
          if (field.type === "image") {
            return (
              <ImageFieldPicker
                key={field.key}
                companySlug={companySlug}
                library={mediaLibrary}
                canUpload={canUpload}
                initialUrl={fieldValue(content, field.key)}
                initialPublicId={fieldValue(content, "image_public_id")}
                label={field.label}
              />
            );
          }

          const isLong = field.type === "textarea" || field.type === "html";
          return (
            <div
              key={field.key}
              className={`sw-admin-field${isLong ? " sw-admin-field-span" : ""}`}
            >
              <label htmlFor={`field_${field.key}`}>{field.label}</label>
              {isLong ? (
                <textarea
                  id={`field_${field.key}`}
                  name={`field_${field.key}`}
                  rows={field.type === "html" ? 4 : 3}
                  defaultValue={fieldValue(content, field.key)}
                />
              ) : (
                <input
                  id={`field_${field.key}`}
                  name={`field_${field.key}`}
                  type={field.type === "url" ? "url" : "text"}
                  defaultValue={fieldValue(content, field.key)}
                />
              )}
            </div>
          );
        })}

        <div className="sw-admin-toolbar sw-admin-field-span">
          <button
            type="submit"
            className="sw-admin-btn sw-admin-btn-ghost"
            data-action="draft"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button type="submit" className="sw-admin-btn" data-action="publish" disabled={pending}>
            {pending ? "Publishing…" : "Publish"}
          </button>
          <Link
            className="sw-admin-btn sw-admin-btn-ghost"
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview
          </Link>
          <Link className="sw-admin-btn sw-admin-btn-ghost" href={backHref}>
            Back
          </Link>
        </div>
      </form>
    </section>
  );
}
