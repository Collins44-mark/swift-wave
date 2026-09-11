"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderDeleteButton } from "@/components/admin/OrderDeleteButton";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";
import { BulkSelectionToolbar } from "@/components/admin/BulkSelectionToolbar";
import { SelectAllCheckbox } from "@/components/admin/SelectAllCheckbox";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { updateOrderStatus, deleteOrders } from "@/lib/admin/actions/orders";
import { bulkDeleteCopy } from "@/lib/admin/delete-copy";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkPending, startBulk] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();

  const statusQuery = filterStatus !== "all" ? `?status=${filterStatus}` : "";
  const visibleIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const selectedCount = selected.size;
  const allSelected = orders.length > 0 && selectedCount === orders.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const copy = bulkDeleteCopy(selectedCount, "order", "orders");

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

  function removeIds(ids: string[]) {
    const gone = new Set(ids);
    setOrders((prev) => prev.filter((o) => !gone.has(o.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function handleDeleted(orderId: string) {
    removeIds([orderId]);
    showSuccess("Order deleted successfully");
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
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
      {canDelete ? (
        <BulkSelectionToolbar
          count={selectedCount}
          onClear={() => setSelected(new Set())}
          onDelete={() => {
            setBulkError(null);
            setBulkOpen(true);
          }}
        />
      ) : null}
      <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
        <table className="sw-admin-table">
          <thead>
            <tr>
              {canDelete ? (
                <th className="sw-admin-select">
                  <SelectAllCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    label="Select all visible orders"
                    onChange={(checked) =>
                      setSelected(checked ? new Set(visibleIds) : new Set())
                    }
                  />
                </th>
              ) : null}
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
                {canDelete ? (
                  <td className="sw-admin-select">
                    <input
                      type="checkbox"
                      className="sw-admin-select-input"
                      checked={selected.has(o.id)}
                      onChange={(e) => toggleOne(o.id, e.target.checked)}
                      aria-label={`Select order ${formatOrderReference(o.id)}`}
                    />
                  </td>
                ) : null}
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
      <ConfirmationDialog
        open={bulkOpen}
        title={copy.title}
        error={bulkError}
        pending={bulkPending}
        confirmLabel={copy.confirmLabel}
        pendingLabel={copy.pendingLabel}
        onCancel={() => {
          if (bulkPending) return;
          setBulkOpen(false);
          setBulkError(null);
        }}
        onConfirm={() => {
          const ids = [...selected];
          startBulk(async () => {
            const result = await deleteOrders(companySlug, ids);
            if (!result.ok) {
              setBulkError(result.error);
              showError("Unable to delete orders. Please try again.");
              return;
            }
            removeIds(result.deletedIds);
            setBulkOpen(false);
            setBulkError(null);
            setSelected(new Set());
            showSuccess(
              bulkDeleteCopy(result.deletedIds.length, "order", "orders").success
            );
          });
        }}
      >
        <p>{copy.body}</p>
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </>
  );
}
