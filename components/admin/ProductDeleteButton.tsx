"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/admin/client-actions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";

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

  function closeConfirm() {
    if (pending) return;
    setConfirmOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
        onClick={() => {
          setConfirmOpen(true);
          setError(null);
        }}
      >
        Delete
      </button>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Product?"
        error={error}
        pending={pending}
        confirmLabel="Delete Product"
        pendingLabel="Deleting..."
        onCancel={closeConfirm}
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteProduct(companySlug, productId);
            if (!result.ok) {
              setError(result.error);
              showError("Unable to delete product. Please try again.");
              return;
            }
            setConfirmOpen(false);
            setError(null);
            onDeleted?.();
          });
        }}
      >
        <p>{productName}</p>
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </>
  );
}
