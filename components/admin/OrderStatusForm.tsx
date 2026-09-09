"use client";

import { useFormStatus } from "react-dom";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/lib/admin/order-utils";
import type { OrderStatus } from "@/lib/admin/types-catalog";
import { SubmitButton } from "@/components/admin/SubmitButton";

function SaveStatusButton() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton pendingLabel="Saving…">
      {pending ? "Saving…" : "Save status"}
    </SubmitButton>
  );
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  action,
  canEdit,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  action: (formData: FormData) => void | Promise<void>;
  canEdit: boolean;
}) {
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

  return (
    <form action={action} className="sw-admin-order-status-form">
      <input type="hidden" name="order_id" value={orderId} />
      <div className="sw-admin-field">
        <label htmlFor="order-status">Order status</label>
        <select id="order-status" name="status" defaultValue={currentStatus}>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <SaveStatusButton />
    </form>
  );
}
