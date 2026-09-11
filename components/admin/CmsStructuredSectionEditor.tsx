"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import type { CmsSectionDef, CmsStructuredSectionType } from "@/lib/cms/types";
import type { ContentStatus, WebsiteContent } from "@/lib/admin/types-catalog";
import type { MediaAsset } from "@/lib/admin/types-media";
import {
  publishWebsiteSection,
  saveWebsiteSectionDraft,
} from "@/lib/admin/client-actions";
import { getSeedSectionContent } from "@/lib/cms/seed-content";
import {
  type LeadershipItem,
  type StatItem,
  moveItem,
  newItemId,
  parseItems,
} from "@/lib/cms/cms-items";

type DeleteTarget = { id: string; label: string };

type Props = {
  companySlug: string;
  pageKey: string;
  section: CmsSectionDef;
  structuredType: CmsStructuredSectionType;
  record: WebsiteContent | null;
  mediaLibrary: MediaAsset[];
  canUpload: boolean;
  previewPath: string;
  backHref: string;
  onStatusChange?: (sectionKey: string, status: ContentStatus) => void;
};

function scalarString(content: Record<string, unknown>, key: string): string {
  const v = content[key];
  return typeof v === "string" ? v : "";
}

function resolveInitialContent(
  record: WebsiteContent | null,
  companySlug: string,
  pageKey: string,
  sectionKey: string
): Record<string, unknown> {
  if (record?.content && Object.keys(record.content).length) {
    return record.content as Record<string, unknown>;
  }
  return (
    getSeedSectionContent(companySlug, pageKey, sectionKey) ?? {}
  );
}

function RowMenu({
  onDelete,
  disabled,
}: {
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sw-admin-row-menu">
      <button
        type="button"
        className="sw-admin-row-menu-btn"
        aria-label="More actions"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        ⋮
      </button>
      {open ? (
        <div className="sw-admin-row-menu-panel" role="menu">
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function CmsStructuredSectionEditor({
  companySlug,
  pageKey,
  section,
  structuredType,
  record,
  canUpload,
  previewPath,
  backHref,
  onStatusChange,
}: Props) {
  const { showSuccess, showError } = useAdminToastContext();
  const initialContent = resolveInitialContent(
    record,
    companySlug,
    pageKey,
    section.key
  );
  const [scalars, setScalars] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const field of section.fields) {
      map[field.key] = scalarString(initialContent, field.key);
    }
    return map;
  });
  const [items, setItems] = useState(() => parseItems(initialContent.items));
  const [status, setStatus] = useState(record?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  function buildPayload(nextItems = items): Record<string, unknown> {
    return { ...scalars, items: nextItems };
  }

  function persist(
    action: "draft" | "publish",
    nextItems = items,
    successMessage?: string
  ) {
    setError(null);
    const fd = new FormData();
    fd.set("page_key", pageKey);
    fd.set("section_key", section.key);
    fd.set("content_json", JSON.stringify(buildPayload(nextItems)));

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
      showSuccess(successMessage ?? "Changes saved.");
    });
  }

  const introPreview = useMemo(
    () => scalars.intro ?? "",
    [scalars.intro]
  );

  function addStat() {
    setItems((prev) => [
      ...prev,
      {
        id: newItemId("stat"),
        value: "",
        label: "",
        sort_order: prev.length + 1,
        visible: true,
      } satisfies StatItem,
    ]);
  }

  function addLeader() {
    setItems((prev) => [
      ...prev,
      {
        id: newItemId("leader"),
        name: "",
        role: "",
        bio: "",
        image_url: "",
        image_public_id: "",
        sort_order: prev.length + 1,
        visible: true,
      } satisfies LeadershipItem,
    ]);
  }

  function updateItem(id: string, patch: Record<string, unknown>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const nextItems = items.filter((item) => item.id !== deleteTarget.id);
    setItems(nextItems);
    setDeleteTarget(null);
    persist(
      "publish",
      nextItems,
      structuredType === "leadership"
        ? "Leadership profile deleted."
        : "Stat removed."
    );
  }

  return (
    <section className="sw-admin-panel">
      <div className="sw-admin-toolbar" style={{ marginBottom: "0.85rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>{section.label}</h2>
          {structuredType === "leadership" && introPreview ? (
            <p style={{ margin: "0.35rem 0 0", color: "var(--admin-muted)" }}>
              {introPreview}
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

      {section.fields.length ? (
        <div className="sw-admin-form-grid" style={{ marginBottom: "1rem" }}>
          {section.fields.map((field) => {
            const isLong = field.type === "textarea" || field.type === "html";
            return (
              <div
                key={field.key}
                className={`sw-admin-field${isLong ? " sw-admin-field-span" : ""}`}
              >
                <label htmlFor={`cms_${section.key}_${field.key}`}>
                  {field.label}
                </label>
                {isLong ? (
                  <textarea
                    id={`cms_${section.key}_${field.key}`}
                    rows={3}
                    value={scalars[field.key] ?? ""}
                    disabled={pending}
                    onChange={(e) =>
                      setScalars((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <input
                    id={`cms_${section.key}_${field.key}`}
                    type="text"
                    value={scalars[field.key] ?? ""}
                    disabled={pending}
                    onChange={(e) =>
                      setScalars((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="sw-admin-toolbar" style={{ marginBottom: "0.85rem" }}>
        <strong>
          {structuredType === "leadership"
            ? "Leadership profiles"
            : "Statistics"}
        </strong>
        <button
          type="button"
          className="sw-admin-btn sw-admin-btn-ghost"
          disabled={pending}
          onClick={structuredType === "leadership" ? addLeader : addStat}
        >
          {structuredType === "leadership" ? "+ Add Leader" : "+ Add Stat"}
        </button>
      </div>

      {!items.length ? (
        <div className="sw-admin-empty">
          No {structuredType === "leadership" ? "leaders" : "stats"} yet.
        </div>
      ) : (
        <div className="sw-admin-leader-grid">
          {items.map((item) => {
            if (structuredType === "stats") {
              const stat = item as StatItem;
              return (
                <article key={stat.id} className="sw-admin-leader-card">
                  <div className="sw-admin-leader-card-body">
                    <div className="sw-admin-form-grid">
                      <div className="sw-admin-field">
                        <label>Value</label>
                        <input
                          value={stat.value}
                          disabled={pending}
                          onChange={(e) =>
                            updateItem(stat.id, { value: e.target.value })
                          }
                        />
                      </div>
                      <div className="sw-admin-field">
                        <label>Label</label>
                        <input
                          value={stat.label}
                          disabled={pending}
                          onChange={(e) =>
                            updateItem(stat.id, { label: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="sw-admin-leader-card-footer">
                      <span
                        className={`sw-admin-badge ${
                          stat.visible ? "is-active" : "is-inactive"
                        }`}
                      >
                        {stat.visible ? "Active" : "Inactive"}
                      </span>
                      <div className="sw-admin-wa-actions">
                        <button
                          type="button"
                          className="sw-admin-btn sw-admin-btn-ghost"
                          disabled={pending}
                          onClick={() =>
                            updateItem(stat.id, { visible: !stat.visible })
                          }
                        >
                          {stat.visible ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="sw-admin-btn sw-admin-btn-ghost"
                          disabled={pending}
                          onClick={() =>
                            setItems((prev) => moveItem(prev, stat.id, -1))
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="sw-admin-btn sw-admin-btn-ghost"
                          disabled={pending}
                          onClick={() =>
                            setItems((prev) => moveItem(prev, stat.id, 1))
                          }
                        >
                          ↓
                        </button>
                        <RowMenu
                          disabled={pending}
                          onDelete={() =>
                            setDeleteTarget({
                              id: stat.id,
                              label: stat.label || "this stat",
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            }

            const leader = item as LeadershipItem;
            return (
              <article key={leader.id} className="sw-admin-leader-card">
                <div className="sw-admin-leader-card-media">
                  {leader.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={leader.image_url} alt={leader.name || "Leader"} />
                  ) : (
                    <div className="sw-admin-leader-card-placeholder">
                      Profile image
                    </div>
                  )}
                </div>
                <div className="sw-admin-leader-card-body">
                  <div className="sw-admin-form-grid">
                    <div className="sw-admin-field sw-admin-field-span">
                      <span className="sw-admin-image-field-label">
                        Profile image
                      </span>
                      {canUpload ? (
                        <MediaUploadButton
                          companySlug={companySlug}
                          label={
                            leader.image_url
                              ? "Replace image"
                              : "Upload image"
                          }
                          className="sw-admin-btn sw-admin-btn-ghost"
                          onSaved={(asset) =>
                            updateItem(leader.id, {
                              image_url: asset.secure_url,
                              image_public_id: asset.public_id,
                            })
                          }
                        />
                      ) : null}
                    </div>
                    <div className="sw-admin-field">
                      <label>Name</label>
                      <input
                        value={leader.name}
                        disabled={pending}
                        onChange={(e) =>
                          updateItem(leader.id, { name: e.target.value })
                        }
                      />
                    </div>
                    <div className="sw-admin-field">
                      <label>Title / role</label>
                      <input
                        value={leader.role}
                        disabled={pending}
                        onChange={(e) =>
                          updateItem(leader.id, { role: e.target.value })
                        }
                      />
                    </div>
                    <div className="sw-admin-field sw-admin-field-span">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        value={leader.bio}
                        disabled={pending}
                        onChange={(e) =>
                          updateItem(leader.id, { bio: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="sw-admin-leader-card-footer">
                    <span
                      className={`sw-admin-badge ${
                        leader.visible ? "is-active" : "is-inactive"
                      }`}
                    >
                      {leader.visible ? "Active" : "Inactive"}
                    </span>
                    <div className="sw-admin-wa-actions">
                      <button
                        type="button"
                        className="sw-admin-btn sw-admin-btn-ghost"
                        disabled={pending}
                        onClick={() =>
                          updateItem(leader.id, { visible: !leader.visible })
                        }
                      >
                        {leader.visible ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="sw-admin-btn sw-admin-btn-ghost"
                        disabled={pending}
                        onClick={() =>
                          setItems((prev) => moveItem(prev, leader.id, -1))
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="sw-admin-btn sw-admin-btn-ghost"
                        disabled={pending}
                        onClick={() =>
                          setItems((prev) => moveItem(prev, leader.id, 1))
                        }
                      >
                        ↓
                      </button>
                      <RowMenu
                        disabled={pending}
                        onDelete={() =>
                          setDeleteTarget({
                            id: leader.id,
                            label: leader.name || "this leader",
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="sw-admin-toolbar" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="sw-admin-btn sw-admin-btn-ghost"
          disabled={pending}
          onClick={() => persist("draft", items, "Draft saved.")}
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          className="sw-admin-btn"
          disabled={pending}
          onClick={() => persist("publish", items, "Changes saved.")}
        >
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

      {deleteTarget ? (
        <div className="sw-admin-modal-backdrop" role="presentation">
          <div className="sw-admin-modal" role="dialog" aria-modal="true">
            <h3 style={{ marginTop: 0 }}>
              Delete {structuredType === "leadership" ? "leader" : "stat"}?
            </h3>
            <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
              Are you sure you want to remove {deleteTarget.label}? This action
              cannot be undone.
            </p>
            <div className="sw-admin-toolbar">
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-ghost"
                disabled={pending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-danger"
                disabled={pending}
                onClick={confirmDelete}
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
