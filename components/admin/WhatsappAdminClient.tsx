"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import {
  buildWhatsAppUrl,
  validateWhatsAppNumber,
} from "@/lib/whatsapp/normalize";
import { updateWhatsappNumber } from "@/lib/admin/client-actions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export type WhatsappCompanyRow = {
  id: string;
  slug: string;
  name: string;
  whatsapp_number: string | null;
};

function RowMenu({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="sw-admin-row-menu" ref={rootRef}>
      <button
        type="button"
        className="sw-admin-row-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="More actions"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        ⋮
      </button>
      {open ? (
        <div className="sw-admin-row-menu-panel" id={menuId} role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit Number
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete Number
          </button>
        </div>
      ) : null}
    </div>
  );
}

function WhatsappCompanyRow({
  company,
  canEdit,
  onSaved,
  onRequestDelete,
}: {
  company: WhatsappCompanyRow;
  canEdit: boolean;
  onSaved: (slug: string, number: string | null) => void;
  onRequestDelete: (company: WhatsappCompanyRow) => void;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const [value, setValue] = useState(company.whatsapp_number ?? "");
  const [clientError, setClientError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(company.whatsapp_number ?? "");
  }, [company.whatsapp_number, company.slug]);

  const preview = (() => {
    const result = validateWhatsAppNumber(value);
    if (!result.ok) return null;
    return buildWhatsAppUrl(result.normalized);
  })();

  function handleSave() {
    if (!canEdit || pending) return;
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
      const result = await updateWhatsappNumber(company.slug, formData);
      if (!result.ok) {
        showError("Couldn't save changes.");
        return;
      }
      if (raw) {
        const validated = validateWhatsAppNumber(raw);
        if (validated.ok) {
          setValue(validated.normalized);
          onSaved(company.slug, validated.normalized);
        }
      } else {
        setValue("");
        onSaved(company.slug, null);
      }
      showSuccess("WhatsApp number saved.");
    });
  }

  return (
    <tr className="sw-admin-wa-row">
      <td data-label="Company">
        <strong>{company.name}</strong>
      </td>
      <td data-label="WhatsApp Number">
        <div className="sw-admin-wa-field-wrap">
          <input
            ref={inputRef}
            type="text"
            className="sw-admin-wa-input"
            value={value}
            disabled={!canEdit || pending}
            placeholder="255712345678"
            inputMode="numeric"
            autoComplete="tel"
            aria-label={`WhatsApp number for ${company.name}`}
            onChange={(e) => {
              setValue(e.target.value);
              setClientError(null);
            }}
          />
          {clientError ? (
            <p className="sw-admin-wa-field-error" role="alert">
              {clientError}
            </p>
          ) : preview ? (
            <p className="sw-admin-wa-preview">
              <a href={preview} target="_blank" rel="noreferrer">
                {preview}
              </a>
            </p>
          ) : null}
        </div>
      </td>
      <td data-label="Action">
        <div className="sw-admin-wa-actions">
          {canEdit ? (
            <>
              <button
                type="button"
                className="sw-admin-btn"
                disabled={pending}
                onClick={handleSave}
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <RowMenu
                disabled={pending}
                onEdit={() => {
                  inputRef.current?.focus();
                  inputRef.current?.select();
                }}
                onDelete={() => onRequestDelete(company)}
              />
            </>
          ) : (
            <span className="sw-admin-muted-sm">View only</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export function WhatsappAdminClient({
  companies,
  canEdit,
}: {
  companies: WhatsappCompanyRow[];
  canEdit: boolean;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const [rows, setRows] = useState(companies);
  const [deleteTarget, setDeleteTarget] = useState<WhatsappCompanyRow | null>(
    null
  );
  const [deletePending, startDeleteTransition] = useTransition();

  function handleSaved(slug: string, number: string | null) {
    setRows((prev) =>
      prev.map((row) =>
        row.slug === slug ? { ...row, whatsapp_number: number } : row
      )
    );
  }

  function confirmDelete() {
    if (!deleteTarget || deletePending) return;
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.set("whatsapp_number", "");
      const result = await updateWhatsappNumber(deleteTarget.slug, formData);
      if (!result.ok) {
        showError("Couldn't delete this item.");
        return;
      }
      setRows((prev) =>
        prev.map((row) =>
          row.slug === deleteTarget.slug
            ? { ...row, whatsapp_number: null }
            : row
        )
      );
      setDeleteTarget(null);
      showSuccess("WhatsApp number removed.");
    });
  }

  if (!rows.length) {
    return (
      <div className="sw-admin-empty">
        No companies available for WhatsApp management.
      </div>
    );
  }

  return (
    <>
      <div className="sw-admin-table-wrap sw-admin-wa-table-wrap">
        <table className="sw-admin-table sw-admin-wa-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>WhatsApp Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((company) => (
              <WhatsappCompanyRow
                key={company.id}
                company={company}
                canEdit={canEdit}
                onSaved={handleSaved}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div className="sw-admin-modal-backdrop" role="presentation">
          <div
            className="sw-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-wa-title"
          >
            <h3 id="delete-wa-title" style={{ marginTop: 0 }}>
              Delete WhatsApp number?
            </h3>
            <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
              This will remove the WhatsApp number for {deleteTarget.name}.
            </p>
            <div className="sw-admin-toolbar">
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-ghost"
                disabled={deletePending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-danger"
                disabled={deletePending}
                onClick={confirmDelete}
              >
                {deletePending ? "Deleting…" : "Delete Number"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
