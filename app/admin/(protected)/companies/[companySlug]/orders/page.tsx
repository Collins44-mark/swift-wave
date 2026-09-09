import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listOrders } from "@/lib/admin/data/orders";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrdersPageToasts } from "@/components/admin/OrdersPageToasts";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatMoney,
  formatOrderReference,
} from "@/lib/admin/order-utils";
import type { OrderStatus } from "@/lib/admin/types-catalog";

export const metadata: Metadata = {
  title: "Orders — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { companySlug } = await params;
  const { status } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "orders");

  const filterStatus =
    status && ORDER_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "all";

  const orders = await listOrders(company.id, {
    status: filterStatus,
  });

  const statusQuery =
    filterStatus !== "all" ? `?status=${filterStatus}` : "";

  return (
    <>
      <OrdersPageToasts />
      <section className="sw-admin-panel">
        <div className="sw-admin-toolbar">
          <div>
            <h2 style={{ margin: 0 }}>Orders</h2>
            <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="sw-admin-inline-form" style={{ marginTop: "1rem" }}>
          <Link
            className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === "all" ? " is-active-filter" : ""}`}
            href={`/admin/companies/${companySlug}/orders`}
          >
            All
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === s ? " is-active-filter" : ""}`}
              href={`/admin/companies/${companySlug}/orders?status=${s}`}
            >
              {ORDER_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="sw-admin-empty" style={{ marginTop: "1rem" }}>
            No orders found.
          </div>
        ) : (
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
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>
                      <Link
                        className="sw-admin-btn sw-admin-btn-ghost"
                        href={`/admin/companies/${companySlug}/orders/${o.id}${statusQuery}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
