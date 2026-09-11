"use client";

import { useState, useTransition } from "react";
import { deleteOrder } from "@/lib/admin/actions/orders";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

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
  const dialogId = `delete-order-${orderId}`;

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
  }

  return (
    <>
      <button
        type="button"
        className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
        onClick={openConfirm}
      >
        {buttonLabel}
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
              Delete order?
            </h3>
            <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
              Order #{orderReference}
              <br />
              Customer: {customerName}
              <br />
              Total: {totalLabel}
            </p>
            <p style={{ color: "var(--admin-muted)" }}>
              This action cannot be undone.
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
                {pending ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
