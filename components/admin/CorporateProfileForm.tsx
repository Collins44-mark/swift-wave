"use client";

import { useState } from "react";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { CompanyRecord } from "@/lib/admin/company-types";

const ICON_OPTIONS = [
  { value: "graduation-cap", label: "Graduation cap" },
  { value: "truck", label: "Truck" },
  { value: "shirt", label: "Shirt" },
  { value: "heart-pulse", label: "Medical / heart" },
  { value: "plane", label: "Plane" },
  { value: "utensils", label: "Utensils" },
  { value: "building-2", label: "Building" },
  { value: "globe", label: "Globe" },
  { value: "briefcase", label: "Briefcase" },
];

type CorporateProfileFormProps = {
  company: CompanyRecord;
  isSuperAdmin: boolean;
  action: (formData: FormData) => Promise<void>;
};

export function CorporateProfileForm({
  company,
  isSuperAdmin,
  action,
}: CorporateProfileFormProps) {
  const [imageUrl, setImageUrl] = useState(company.card_image_url ?? "");
  const [publicId, setPublicId] = useState(company.card_image_public_id ?? "");

  return (
    <form action={action} className="sw-admin-form-grid">
      <div className="sw-admin-field">
        <label htmlFor="name">Display name</label>
        <input
          id="name"
          name="name"
          defaultValue={company.name}
          readOnly={!isSuperAdmin}
          disabled={!isSuperAdmin}
          required
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="card_title_short">Short card title</label>
        <input
          id="card_title_short"
          name="card_title_short"
          defaultValue={company.card_title_short ?? ""}
          placeholder="Scholarship"
        />
      </div>
      <div className="sw-admin-field sw-admin-field-span">
        <label htmlFor="description">Short description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={company.description ?? ""}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="card_icon">Card icon</label>
        <select
          id="card_icon"
          name="card_icon"
          defaultValue={company.card_icon ?? "building-2"}
        >
          {ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sw-admin-field">
        <label htmlFor="corporate_display_order">Display order</label>
        <input
          id="corporate_display_order"
          name="corporate_display_order"
          type="number"
          min={0}
          step={1}
          defaultValue={company.corporate_display_order ?? 0}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="card_route">Card link URL</label>
        <input
          id="card_route"
          name="card_route"
          defaultValue={company.card_route ?? `/companies/${company.slug}`}
          placeholder={`/companies/${company.slug}`}
        />
      </div>
      <div className="sw-admin-field">
        <label className="sw-admin-check-label" htmlFor="corporate_card_visible">
          <input
            id="corporate_card_visible"
            name="corporate_card_visible"
            type="checkbox"
            value="true"
            defaultChecked={company.corporate_card_visible}
          />{" "}
          Show on corporate Our Companies page
        </label>
      </div>
      <div className="sw-admin-field">
        <label className="sw-admin-check-label" htmlFor="card_coming_soon">
          <input
            id="card_coming_soon"
            name="card_coming_soon"
            type="checkbox"
            value="true"
            defaultChecked={company.card_coming_soon}
          />{" "}
          Coming soon link (uses toast instead of navigation)
        </label>
      </div>
      <div className="sw-admin-field sw-admin-field-span">
        <span className="sw-admin-field-label">Corporate card image</span>
        {imageUrl ? (
          <div className="sw-admin-media-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" />
          </div>
        ) : (
          <p style={{ margin: "0 0 0.75rem", color: "var(--admin-muted)" }}>
            No card image uploaded yet.
          </p>
        )}
        <input type="hidden" name="card_image_url" value={imageUrl} />
        <input type="hidden" name="card_image_public_id" value={publicId} />
        <MediaUploadButton
          companySlug={company.slug}
          label="Upload card image"
          onSaved={(asset) => {
            setImageUrl(asset.secure_url);
            setPublicId(asset.public_id);
          }}
        />
      </div>
      <div className="sw-admin-toolbar sw-admin-field-span">
        <SubmitButton>Save corporate profile</SubmitButton>
      </div>
    </form>
  );
}
