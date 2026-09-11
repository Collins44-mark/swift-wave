"use client";

import { useState, useTransition } from "react";
import { deleteOrder } from "@/lib/admin/client-actions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";

export function OrderDeleteButton({
  companySlug,
  orderId,
  orderReference,
  customerName,
  totalLabel,
  onDeleted,
  buttonLabel = "Delete",
}: {
  companySlug: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  totalLabel: string;
  onDeleted?: () => void;
  buttonLabel?: string;
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
        {buttonLabel}
      </button>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Order?"
        error={error}
        pending={pending}
        confirmLabel="Delete Order"
        pendingLabel="Deleting..."
        onCancel={closeConfirm}
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteOrder(companySlug, orderId);
            if (!result.ok) {
              setError(result.error);
              showError("Unable to delete order. Please try again.");
              return;
            }
            setConfirmOpen(false);
            setError(null);
            onDeleted?.();
          });
        }}
      >
        <p>
          Order #{orderReference}
          <br />
          Customer: {customerName}
          <br />
          Total: {totalLabel}
        </p>
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </>
  );
}
