"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderItemEnriched, OrderStatus } from "@/lib/admin/types-catalog";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { OrderDeleteButton } from "@/components/admin/OrderDeleteButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import {
  buildCustomerWhatsAppMessage,
  buildCustomerWhatsAppUrl,
  customerPhoneHref,
  displayValue,
  formatMoney,
  formatOrderReference,
} from "@/lib/admin/order-utils";

export function OrderDetailView({
  companySlug,
  companyName,
  order,
  items,
  canEditStatus,
  canDelete,
  listStatus,
}: {
  companySlug: string;
  companyName: string;
  order: Order;
  items: OrderItemEnriched[];
  canEditStatus: boolean;
  canDelete: boolean;
  listStatus?: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const router = useRouter();
  const { showSuccess } = useAdminToastContext();
  const ordersListHref =
    listStatus && listStatus !== "all"
      ? `/admin/companies/${companySlug}/orders?status=${listStatus}`
      : `/admin/companies/${companySlug}/orders`;
  const orderRef = formatOrderReference(order.id);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );
  const phoneHref = customerPhoneHref(order.customer_phone);
  const whatsappMessage = buildCustomerWhatsAppMessage({
    customerName: order.customer_name,
    companyName,
    orderReference: orderRef,
  });
  const whatsappUrl = buildCustomerWhatsAppUrl(
    order.customer_phone,
    whatsappMessage
  );

  return (
    <div className="sw-admin-order-detail">
      <div className="sw-admin-order-detail-header">
        <Link className="sw-admin-back-link" href={ordersListHref}>
          ← Back to Orders
        </Link>
        <div className="sw-admin-order-detail-title-row">
          <div>
            <h2 className="sw-admin-order-detail-title">Order #{orderRef}</h2>
            <p className="sw-admin-order-detail-meta">
              {new Date(order.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <OrderStatusBadge status={status} />
        </div>
        {canDelete ? (
          <OrderDeleteButton
            companySlug={companySlug}
            orderId={order.id}
            orderReference={orderRef}
            customerName={order.customer_name}
            totalLabel={formatMoney(order.currency, Number(order.total))}
            buttonLabel="Delete"
            onDeleted={() => {
              showSuccess("Order deleted successfully");
              router.push(ordersListHref);
            }}
          />
        ) : null}
      </div>

      <div className="sw-admin-order-detail-grid">
        <section className="sw-admin-order-card">
          <h3 className="sw-admin-order-card-title">Customer information</h3>
          <dl className="sw-admin-order-fields">
            <div className="sw-admin-order-field">
              <dt>Customer name</dt>
              <dd>{displayValue(order.customer_name)}</dd>
            </div>
            <div className="sw-admin-order-field">
              <dt>Phone number</dt>
              <dd>
                {phoneHref ? (
                  <a href={phoneHref}>{order.customer_phone}</a>
                ) : (
                  displayValue(order.customer_phone)
                )}
              </dd>
            </div>
            <div className="sw-admin-order-field">
              <dt>Location</dt>
              <dd>{displayValue(order.customer_location)}</dd>
            </div>
          </dl>
          {whatsappUrl ? (
            <a
              className="sw-admin-btn sw-admin-btn-whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact customer on WhatsApp
            </a>
          ) : (
            <p className="sw-admin-muted-sm" style={{ marginTop: "1rem" }}>
              WhatsApp contact is unavailable for this phone number.
            </p>
          )}
        </section>

        <section className="sw-admin-order-card">
          <h3 className="sw-admin-order-card-title">Order status</h3>
          <OrderStatusForm
            companySlug={companySlug}
            orderId={order.id}
            initialStatus={status}
            canEdit={canEditStatus}
            onStatusChange={setStatus}
          />
        </section>
      </div>

      <section className="sw-admin-order-card sw-admin-order-items-card">
        <h3 className="sw-admin-order-card-title">Order items</h3>
        {items.length === 0 ? (
          <p className="sw-admin-muted-sm">No line items recorded for this order.</p>
        ) : (
          <ul className="sw-admin-order-items">
            {items.map((item) => (
              <li key={item.id} className="sw-admin-order-item">
                <div className="sw-admin-order-item-media">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="sw-admin-order-item-placeholder" aria-hidden>
                      —
                    </div>
                  )}
                </div>
                <div className="sw-admin-order-item-body">
                  <strong>{item.product_name}</strong>
                  {item.product_category ? (
                    <span className="sw-admin-order-item-category">
                      {item.product_category}
                    </span>
                  ) : null}
                  {item.selected_color || item.selected_size ? (
                    <span className="sw-admin-order-item-category">
                      {[
                        item.selected_color
                          ? `Color: ${item.selected_color}`
                          : null,
                        item.selected_size
                          ? `Size: ${item.selected_size}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ) : null}
                  <p className="sw-admin-order-item-qty">
                    Qty {item.quantity} ×{" "}
                    {item.original_unit_price != null &&
                    Number(item.original_unit_price) > Number(item.unit_price) ? (
                      <>
                        <s>
                          {formatMoney(
                            order.currency,
                            Number(item.original_unit_price)
                          )}
                        </s>{" "}
                      </>
                    ) : null}
                    {formatMoney(order.currency, Number(item.unit_price))}
                  </p>
                  <p className="sw-admin-order-item-subtotal">
                    Subtotal {formatMoney(order.currency, Number(item.subtotal))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sw-admin-order-card sw-admin-order-summary-card">
        <h3 className="sw-admin-order-card-title">Order summary</h3>
        <dl className="sw-admin-order-summary">
          <div className="sw-admin-order-summary-row">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.currency, subtotal)}</dd>
          </div>
          <div className="sw-admin-order-summary-row is-total">
            <dt>Total</dt>
            <dd>{formatMoney(order.currency, Number(order.total))}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
