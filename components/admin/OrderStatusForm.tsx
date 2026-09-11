"use client";

import { useRef, useState, useTransition } from "react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/lib/admin/order-utils";
import type { OrderStatus } from "@/lib/admin/types-catalog";
import { updateOrderStatus } from "@/lib/admin/client-actions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function OrderStatusForm({
  companySlug,
  orderId,
  initialStatus,
  canEdit,
  onStatusChange,
}: {
  companySlug: string;
  orderId: string;
  initialStatus: OrderStatus;
  canEdit: boolean;
  onStatusChange?: (status: OrderStatus) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const confirmedStatus = useRef(initialStatus);
  const [pending, startTransition] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();

  if (!canEdit) {
    return (
      <div className="sw-admin-order-status-readonly">
        <span className="sw-admin-field-label">Order status</span>
        <p style={{ margin: "0.35rem 0 0", color: "var(--admin-muted)" }}>
          You can view orders but do not have permission to update status.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const next = new FormData(form).get("status");
    if (typeof next !== "string") return;
    const previous = confirmedStatus.current;
    const nextStatus = next as OrderStatus;
    if (nextStatus === previous && !pending) return;

    startTransition(async () => {
      const result = await updateOrderStatus(
        companySlug,
        orderId,
        nextStatus
      );
      if (!result.ok) {
        setStatus(previous);
        showError("Couldn't update the order status. Please try again.");
        return;
      }
      confirmedStatus.current = nextStatus;
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
      showSuccess("Order status updated.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="sw-admin-order-status-form">
      <div className="sw-admin-field">
        <label htmlFor="order-status">Order status</label>
        <select
          id="order-status"
          name="status"
          value={status}
          disabled={pending}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {ORDER_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="sw-admin-btn" disabled={pending}>
        {pending ? "Saving..." : "Save status"}
      </button>
    </form>
  );
}
