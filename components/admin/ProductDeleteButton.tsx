"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/admin/actions/products";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function ProductDeleteButton({
  companySlug,
  productId,
  productName,
  onDeleted,
}: {
  companySlug: string;
  productId: string;
  productName: string;
  onDeleted?: () => void;
}) {
  const { showError } = useAdminToastContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogId = `delete-product-${productId}`;

  function openConfirm() {
    setConfirmOpen(true);
    setError(null);
  }

  function closeConfirm() {
    if (pending) return;
    setConfirmOpen(false);
    setError(null);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteProduct(companySlug, productId);
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
      <button
        type="button"
        className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
        onClick={openConfirm}
      >
        Delete
      </button>

      {confirmOpen ? (
        <div className="sw-admin-modal-backdrop" role="presentation">
          <div
            className="sw-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
          >
            <h3 id={`${dialogId}-title`} style={{ marginTop: 0 }}>
              Delete product?
            </h3>
            <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
              Are you sure you want to remove &ldquo;{productName}&rdquo;? This
              action cannot be undone.
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
                onClick={closeConfirm}
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
