"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import type { HeroPageDef } from "@/lib/cms/hero-pages";
import type { MediaAsset } from "@/lib/admin/types-media";
import { updateHeroImage } from "@/lib/admin/client-actions";

type HeroContent = {
  image_url?: string | null;
  image_public_id?: string | null;
  alt_text?: string | null;
};

type Props = {
  hero: HeroPageDef;
  content: HeroContent;
  mediaLibrary: MediaAsset[];
  canUpload: boolean;
  backHref: string;
};

function filenameFromPublicId(publicId: string | null | undefined): string | null {
  if (!publicId) return null;
  const parts = publicId.split("/");
  return parts[parts.length - 1] || publicId;
}

export function HeroImageEditor({
  hero,
  content,
  mediaLibrary,
  canUpload,
  backHref,
}: Props) {
  const { showSuccess, showError } = useAdminToastContext();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState(content.image_url ?? "");
  const [publicId, setPublicId] = useState(content.image_public_id ?? "");
  const [altText, setAltText] = useState(content.alt_text ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const matchedAsset = mediaLibrary.find(
    (a) => a.cloudinary_public_id === publicId || a.secure_url === url
  );

  return (
    <section className="sw-admin-panel">
      <div className="sw-admin-toolbar" style={{ marginBottom: "0.85rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>{hero.label}</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
            {hero.route}
            {hero.heroType === "slideshow"
              ? " · slideshow hero (primary slide)"
              : hero.heroType === "static"
                ? " · static hero"
                : " · company shop hero"}
          </p>
        </div>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost"
          href={hero.route}
          target="_blank"
          rel="noopener noreferrer"
        >
          View live ↗
        </Link>
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
          fd.set("page_key", hero.pageKey);
          setError(null);
          startTransition(async () => {
            const result = await updateHeroImage(hero.companySlug, fd);
            if (!result.ok) {
              setError(result.error);
              showError("Couldn't save changes.");
              return;
            }
            showSuccess("Changes saved.");
          });
        }}
      >
        <input type="hidden" name="image_url" value={url} />
        <input type="hidden" name="image_public_id" value={publicId} />

        <div className="sw-admin-field sw-admin-field-span">
          <span className="sw-admin-image-field-label">Hero image</span>
          <div className="sw-admin-image-field-preview sw-admin-hero-preview">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={altText || hero.label} />
            ) : (
              <div className="sw-admin-image-field-empty">
                No hero image configured — the live page uses its built-in default.
              </div>
            )}
          </div>
        </div>

        {(publicId || matchedAsset) && (
          <div className="sw-admin-field sw-admin-field-span sw-admin-hero-meta">
            <p className="sw-admin-muted" style={{ margin: 0 }}>
              {filenameFromPublicId(publicId)
                ? `File: ${filenameFromPublicId(publicId)}`
                : null}
              {matchedAsset?.width && matchedAsset?.height
                ? ` · ${matchedAsset.width}×${matchedAsset.height}px`
                : null}
              {publicId ? (
                <>
                  <br />
                  <span style={{ fontSize: "0.82rem" }}>ID: {publicId}</span>
                </>
              ) : null}
            </p>
          </div>
        )}

        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="hero_alt_text">Alt text (optional)</label>
          <input
            id="hero_alt_text"
            name="alt_text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the hero image for accessibility"
          />
        </div>

        <div className="sw-admin-media-actions sw-admin-field-span">
          {canUpload ? (
            <MediaUploadButton
              companySlug={hero.companySlug}
              label="Change Hero Image"
              className="sw-admin-btn"
              onSaved={(asset) => {
                setUrl(asset.secure_url);
                setPublicId(asset.public_id);
                setError(null);
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
        </div>

        {pickerOpen ? (
          <div className="sw-admin-media-picker sw-admin-field-span">
            {!mediaLibrary.length ? (
              <p className="sw-admin-muted">No images in this library yet.</p>
            ) : (
              <div className="sw-admin-media-picker-grid">
                {mediaLibrary.map((asset) => (
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

        <div className="sw-admin-toolbar sw-admin-field-span">
          <button type="submit" className="sw-admin-btn" disabled={pending || !url}>
            {pending ? "Saving…" : "Save & publish hero"}
          </button>
          <Link className="sw-admin-btn sw-admin-btn-ghost" href={backHref}>
            Back
          </Link>
        </div>
      </form>
    </section>
  );
}
