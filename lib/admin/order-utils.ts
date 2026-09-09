import type { OrderStatus } from "@/lib/admin/types-catalog";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp/normalize";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatOrderReference(orderId: string): string {
  return orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  return `sw-admin-badge sw-admin-order-status is-order-${status}`;
}

export function formatMoney(currency: string, amount: number): string {
  return `${currency} ${Number(amount).toLocaleString("en-US")}`;
}

export function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

export function buildCustomerWhatsAppMessage(opts: {
  customerName: string;
  companyName: string;
  orderReference: string;
}): string {
  return [
    `Hello ${opts.customerName},`,
    "",
    `Regarding your Swift Wave ${opts.companyName} order #${opts.orderReference}…`,
  ].join("\n");
}

export function buildCustomerWhatsAppUrl(
  customerPhone: string,
  message: string
): string | null {
  return buildWhatsAppUrl(customerPhone, message);
}

export function customerPhoneHref(phone: string): string | null {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return null;
  return `tel:+${normalized}`;
}
