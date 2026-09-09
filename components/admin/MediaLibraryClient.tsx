"use client";

import { useState, useTransition } from "react";
import {
  deleteMediaAsset,
  updateMediaAltText,
} from "@/lib/admin/actions/media";
import type { MediaAsset } from "@/lib/admin/types-media";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MediaLibraryClient({
  companySlug,
  companyName,
  assets,
  canManage,
}: {
  companySlug: string;
  companyName: string;
  assets: MediaAsset[];
  canManage: boolean;
}) {
  const [items, setItems] = useState(assets);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshFromUpload() {
    // Server revalidates; force a soft reload for fresh list
    window.location.reload();
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Image URL copied.");
      setError(null);
    } catch {
      setError("Could not copy URL.");
    }
  }

  function onDelete(id: string) {
    if (!confirm("Delete this image permanently?")) return;
    setStatus(null);
    setError(null);
    startTransition(async () => {
      const result = await deleteMediaAsset(companySlug, id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) => prev.filter((a) => a.id !== id));
      setStatus("Image deleted.");
    });
  }

  function onAltBlur(id: string, value: string) {
    startTransition(async () => {
      const result = await updateMediaAltText(companySlug, id, value);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="sw-admin-media">
      <div className="sw-admin-toolbar">
        <div>
          <h2 style={{ margin: 0 }}>Media library</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
            Images for {companyName}. Upload from your device — storage is
            handled automatically.
          </p>
        </div>
        {canManage ? (
          <MediaUploadButton
            companySlug={companySlug}
            onSaved={refreshFromUpload}
          />
        ) : null}
      </div>

      {status ? (
        <div className="sw-admin-alert" role="status">
          {status}
        </div>
      ) : null}
      {error ? (
        <div className="sw-admin-alert is-error" role="alert">
          {error}
        </div>
      ) : null}

      {!items.length ? (
        <div className="sw-admin-empty" role="status">
          No images yet. {canManage ? "Upload an image to get started." : null}
        </div>
      ) : (
        <div className="sw-admin-media-grid">
          {items.map((asset) => (
            <article key={asset.id} className="sw-admin-media-card">
              <div className="sw-admin-media-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.secure_url}
                  alt={asset.alt_text || asset.original_filename || "Media"}
                />
              </div>
              <div className="sw-admin-media-body">
                <strong className="sw-admin-media-name">
                  {asset.original_filename || asset.cloudinary_public_id}
                </strong>
                <p className="sw-admin-media-meta">
                  {asset.width && asset.height
                    ? `${asset.width}×${asset.height}`
                    : "—"}
                  {" · "}
                  {formatBytes(asset.bytes)}
                  {" · "}
                  {formatDate(asset.created_at)}
                </p>
                <label className="sw-admin-media-alt">
                  <span>Alt text</span>
                  <input
                    defaultValue={asset.alt_text ?? ""}
                    disabled={!canManage || pending}
                    onBlur={(e) => onAltBlur(asset.id, e.target.value)}
                    placeholder="Describe this image"
                  />
                </label>
                <div className="sw-admin-media-actions">
                  <button
                    type="button"
                    className="sw-admin-btn sw-admin-btn-ghost"
                    onClick={() => copyUrl(asset.secure_url)}
                  >
                    Copy URL
                  </button>
                  {canManage ? (
                    <button
                      type="button"
                      className="sw-admin-btn sw-admin-btn-ghost"
                      disabled={pending}
                      onClick={() => onDelete(asset.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
