"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderDeleteButton } from "@/components/admin/OrderDeleteButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { updateOrderStatus } from "@/lib/admin/actions/orders";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatMoney,
  formatOrderReference,
} from "@/lib/admin/order-utils";
import type { Order, OrderStatus } from "@/lib/admin/types-catalog";

function OrderRowStatus({
  companySlug,
  orderId,
  initialStatus,
  canEdit,
  onUpdated,
}: {
  companySlug: string;
  orderId: string;
  initialStatus: OrderStatus;
  canEdit: boolean;
  onUpdated: (orderId: string, status: OrderStatus) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();

  if (!canEdit) {
    return <OrderStatusBadge status={status} />;
  }

  function handleChange(next: OrderStatus) {
    if (next === status || pending) return;
    startTransition(async () => {
      const result = await updateOrderStatus(companySlug, orderId, next);
      if (!result.ok) {
        showError("Couldn't update the order status.");
        return;
      }
      setStatus(next);
      onUpdated(orderId, next);
      showSuccess("Order status updated.");
    });
  }

  return (
    <select
      className="sw-admin-status-select"
      value={status}
      disabled={pending}
      aria-label="Order status"
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
    >
      {ORDER_STATUSES.map((item) => (
        <option key={item} value={item}>
          {pending && item === status ? "Updating..." : ORDER_STATUS_LABELS[item]}
        </option>
      ))}
    </select>
  );
}

export function OrdersTableClient({
  companySlug,
  initialOrders,
  filterStatus,
  canEditStatus,
  canDelete,
}: {
  companySlug: string;
  initialOrders: Order[];
  filterStatus: OrderStatus | "all";
  canEditStatus: boolean;
  canDelete: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const { showSuccess } = useAdminToastContext();

  const statusQuery = filterStatus !== "all" ? `?status=${filterStatus}` : "";

  function handleStatusUpdated(orderId: string, status: OrderStatus) {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      if (filterStatus !== "all" && status !== filterStatus) {
        return updated.filter((o) => o.id !== orderId);
      }
      return updated;
    });
  }

  function handleDeleted(orderId: string) {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showSuccess("Order deleted successfully");
  }

  if (!orders.length) {
    return (
      <>
        <p style={{ margin: "1rem 0 0", color: "var(--admin-muted)" }}>
          0 orders
        </p>
        <div className="sw-admin-empty" style={{ marginTop: "1rem" }}>
          No orders found.
        </div>
      </>
    );
  }

  return (
    <>
      <p style={{ margin: "1rem 0 0", color: "var(--admin-muted)" }}>
        {orders.length} order{orders.length === 1 ? "" : "s"}
      </p>
    <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
      <table className="sw-admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>#{formatOrderReference(o.id)}</strong>
              </td>
              <td>{o.customer_name}</td>
              <td>{o.customer_phone}</td>
              <td>{formatMoney(o.currency, Number(o.total))}</td>
              <td>
                <OrderRowStatus
                  companySlug={companySlug}
                  orderId={o.id}
                  initialStatus={o.status}
                  canEdit={canEditStatus}
                  onUpdated={handleStatusUpdated}
                />
              </td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>
                <div className="sw-admin-row-actions">
                  <Link
                    className="sw-admin-btn sw-admin-btn-ghost"
                    href={`/admin/companies/${companySlug}/orders/${o.id}${statusQuery}`}
                  >
                    View
                  </Link>
                  {canDelete ? (
                    <OrderDeleteButton
                      companySlug={companySlug}
                      orderId={o.id}
                      orderReference={formatOrderReference(o.id)}
                      customerName={o.customer_name}
                      totalLabel={formatMoney(o.currency, Number(o.total))}
                      onDeleted={() => handleDeleted(o.id)}
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
