"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { deleteCategory } from "@/lib/admin/actions/categories";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function CategoryRowActions({
  companySlug,
  categoryId,
  categoryName,
  onDeleted,
}: {
  companySlug: string;
  categoryId: string;
  categoryName: string;
  onDeleted?: () => void;
}) {
  const { showError } = useAdminToastContext();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
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

  function handleDelete() {
    setOpen(false);
    setConfirmOpen(true);
    setError(null);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteCategory(companySlug, categoryId);
      if (!result.ok) {
        setError(result.error);
        showError("Couldn't delete this item.");
        return;
      }
      setConfirmOpen(false);
      setError(null);
      onDeleted?.();
    });
  }

  return (
    <>
      <div className="sw-admin-row-menu" ref={rootRef}>
        <button
          type="button"
          className="sw-admin-row-menu-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`Actions for ${categoryName}`}
          onClick={() => setOpen((v) => !v)}
        >
          ···
        </button>
        {open ? (
          <div className="sw-admin-row-menu-panel" id={menuId} role="menu">
            <Link
              href={`/admin/companies/${companySlug}/categories/${categoryId}/edit`}
              role="menuitem"
              className="sw-admin-row-menu-item"
              onClick={() => setOpen(false)}
            >
              Edit
            </Link>
            <button
              type="button"
              role="menuitem"
              className="sw-admin-row-menu-item is-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {confirmOpen ? (
        <div className="sw-admin-modal-backdrop" role="presentation">
          <div
            className="sw-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${menuId}-delete-title`}
          >
            <h3 id={`${menuId}-delete-title`} style={{ marginTop: 0 }}>
              Delete Category?
            </h3>
            <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
              Delete &ldquo;{categoryName}&rdquo;? This action cannot be undone.
            </p>
            {error ? (
              <div className="sw-admin-alert is-error" role="alert">
                {error}
              </div>
            ) : null}
            <div className="sw-admin-toolbar">
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-ghost"
                disabled={pending}
                onClick={() => {
                  setConfirmOpen(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-danger-solid"
                disabled={pending}
                onClick={confirmDelete}
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
