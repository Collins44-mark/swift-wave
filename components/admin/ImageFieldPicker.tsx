"use client";

import { useState } from "react";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import type { MediaAsset } from "@/lib/admin/types-media";

/**
 * Reusable image field: upload new or pick from existing company media.
 * Writes hidden inputs image_url + image_public_id for form posts.
 */
export function ImageFieldPicker({
  companySlug,
  library,
  canUpload,
  initialUrl,
  initialPublicId,
  label = "Image",
  onBusyChange,
}: {
  companySlug: string;
  library: MediaAsset[];
  canUpload: boolean;
  initialUrl?: string | null;
  initialPublicId?: string | null;
  label?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [publicId, setPublicId] = useState(initialPublicId ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="sw-admin-image-field sw-admin-field-span">
      <span className="sw-admin-image-field-label">{label}</span>
      <input type="hidden" name="image_url" value={url} />
      <input type="hidden" name="image_public_id" value={publicId} />

      <div className="sw-admin-image-field-preview">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" />
        ) : (
          <div className="sw-admin-image-field-empty">No image selected</div>
        )}
      </div>

      <div className="sw-admin-media-actions">
        {canUpload ? (
          <MediaUploadButton
            companySlug={companySlug}
            label="Upload Image"
            className="sw-admin-btn"
            onBusyChange={onBusyChange}
            onSaved={(asset) => {
              setUrl(asset.secure_url);
              setPublicId(asset.public_id);
            }}
          />
        ) : null}
        <button
          type="button"
          className="sw-admin-btn sw-admin-btn-ghost"
          onClick={() => setPickerOpen((v) => !v)}
        >
          {pickerOpen ? "Hide library" : "Choose from library"}
        </button>
        {url ? (
          <button
            type="button"
            className="sw-admin-btn sw-admin-btn-ghost"
            onClick={() => {
              setUrl("");
              setPublicId("");
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {pickerOpen ? (
        <div className="sw-admin-media-picker">
          {!library.length ? (
            <p className="sw-admin-muted">No images in this company library yet.</p>
          ) : (
            <div className="sw-admin-media-picker-grid">
              {library.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={`sw-admin-media-pick${
                    publicId === asset.cloudinary_public_id ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setUrl(asset.secure_url);
                    setPublicId(asset.cloudinary_public_id);
                    setPickerOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.secure_url}
                    alt={asset.alt_text || asset.original_filename || ""}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
