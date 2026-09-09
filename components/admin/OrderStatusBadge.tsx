import {
  ORDER_STATUS_LABELS,
  orderStatusBadgeClass,
} from "@/lib/admin/order-utils";
import type { OrderStatus } from "@/lib/admin/types-catalog";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={orderStatusBadgeClass(status)}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
