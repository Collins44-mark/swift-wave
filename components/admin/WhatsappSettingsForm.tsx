"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  buildWhatsAppUrl,
  validateWhatsAppNumber,
} from "@/lib/whatsapp/normalize";
import { SubmitButton } from "@/components/admin/SubmitButton";

function SaveButton() {
  const { pending } = useFormStatus();
  return <SubmitButton pendingLabel="Saving…">{pending ? "Saving…" : "Save number"}</SubmitButton>;
}

export function WhatsappSettingsForm({
  companySlug,
  initialNumber,
  action,
  serverError,
}: {
  companySlug: string;
  initialNumber: string;
  action: (formData: FormData) => void | Promise<void>;
  serverError?: string | null;
}) {
  const [value, setValue] = useState(initialNumber);
  const [clientError, setClientError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const result = validateWhatsAppNumber(value);
    if (!result.ok) return null;
    return buildWhatsAppUrl(result.normalized);
  }, [value]);

  function handleSubmit(formData: FormData) {
    const raw = String(formData.get("whatsapp_number") ?? "").trim();
    if (!raw) {
      setClientError(null);
      return action(formData);
    }

    const result = validateWhatsAppNumber(raw);
    if (!result.ok) {
      setClientError(result.error);
      return;
    }

    setClientError(null);
    formData.set("whatsapp_number", result.normalized);
    return action(formData);
  }

  return (
    <form action={handleSubmit} className="sw-admin-form-grid">
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
        {serverError ? (
          <div className="sw-admin-alert is-error" role="alert" style={{ marginTop: "0.65rem" }}>
            {serverError}
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
        <SaveButton />
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
