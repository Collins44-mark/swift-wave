"use client";

import { useState, useTransition } from "react";
import {
  buildWhatsAppUrl,
  validateWhatsAppNumber,
} from "@/lib/whatsapp/normalize";
import { updateWhatsappNumber } from "@/lib/admin/actions/company-settings";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function WhatsappSettingsClient({
  companySlug,
  initialNumber,
}: {
  companySlug: string;
  initialNumber: string;
}) {
  const [value, setValue] = useState(initialNumber);
  const [clientError, setClientError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();

  const preview = (() => {
    const result = validateWhatsAppNumber(value);
    if (!result.ok) return null;
    return buildWhatsAppUrl(result.normalized);
  })();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = value.trim();

    if (raw) {
      const result = validateWhatsAppNumber(raw);
      if (!result.ok) {
        setClientError(result.error);
        return;
      }
    }

    setClientError(null);
    const formData = new FormData();
    formData.set("whatsapp_number", raw);

    startTransition(async () => {
      const result = await updateWhatsappNumber(companySlug, formData);
      if (!result.ok) {
        showError("Couldn't save changes.");
        return;
      }
      if (raw) {
        const normalized = validateWhatsAppNumber(raw);
        if (normalized.ok) setValue(normalized.normalized);
      }
      showSuccess("WhatsApp number saved.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="sw-admin-form-grid">
      <div className="sw-admin-field">
        <label htmlFor="whatsapp_number">WhatsApp number</label>
        <p style={{ margin: "0.35rem 0 0.5rem", color: "var(--admin-muted)", fontSize: "0.85rem" }}>
          Enter the full international number including country code.
          <br />
          Example: <strong>255712345678</strong>
          <br />
          Do not include +, spaces, or dashes.
        </p>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          value={value}
          disabled={pending}
          onChange={(e) => {
            setValue(e.target.value);
            setClientError(null);
          }}
          placeholder="255712345678"
          inputMode="numeric"
          autoComplete="tel"
        />
        {clientError ? (
          <div className="sw-admin-alert is-error" role="alert" style={{ marginTop: "0.65rem" }}>
            {clientError}
          </div>
        ) : null}
      </div>
      <div className="sw-admin-field">
        <span className="sw-admin-field-label">WhatsApp link preview</span>
        {preview ? (
          <p style={{ margin: 0 }}>
            <a href={preview} target="_blank" rel="noreferrer">
              {preview}
            </a>
          </p>
        ) : (
          <p style={{ margin: 0, color: "var(--admin-muted)" }}>
            Enter a valid number to preview the checkout link.
          </p>
        )}
      </div>
      <div className="sw-admin-toolbar sw-admin-field-span">
        <button type="submit" className="sw-admin-btn" disabled={pending}>
          {pending ? "Saving..." : "Save number"}
        </button>
        <a
          className="sw-admin-btn sw-admin-btn-ghost"
          href={`/admin/companies/${companySlug}`}
        >
          Back
        </a>
      </div>
    </form>
  );
}
