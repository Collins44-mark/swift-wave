"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { deleteCategory } from "@/lib/admin/client-actions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";

export function CategoryRowActions({
  companySlug,
  categoryId,
  categoryName,
  onDeleted,
  canDelete = true,
}: {
  companySlug: string;
  categoryId: string;
  categoryName: string;
  onDeleted?: () => void;
  canDelete?: boolean;
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
            {canDelete ? (
              <button
                type="button"
                role="menuitem"
                className="sw-admin-row-menu-item is-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Category?"
        error={error}
        pending={pending}
        confirmLabel="Delete Category"
        pendingLabel="Deleting..."
        onCancel={() => {
          if (pending) return;
          setConfirmOpen(false);
          setError(null);
        }}
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteCategory(companySlug, categoryId);
            if (!result.ok) {
              setError(result.error);
              showError("Unable to delete category. Please try again.");
              return;
            }
            setConfirmOpen(false);
            setError(null);
            onDeleted?.();
          });
        }}
      >
        <p>{categoryName}</p>
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </>
  );
}
