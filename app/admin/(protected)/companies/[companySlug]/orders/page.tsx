import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import {
  getOrderWithItems,
  listOrders,
} from "@/lib/admin/data/orders";
import { updateOrderStatus } from "@/lib/admin/actions/orders";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { OrderStatus } from "@/lib/admin/types-catalog";

export const metadata: Metadata = {
  title: "Orders — Swift Wave Admin",
  robots: { index: false, follow: false },
};

const STATUSES: OrderStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
];

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const { companySlug } = await params;
  const { status, view } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "orders");

  const filterStatus =
    status && STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "all";

  const orders = await listOrders(company.id, {
    status: filterStatus,
  });

  const detail = view
    ? await getOrderWithItems(company.id, view)
    : null;

  async function statusAction(formData: FormData) {
    "use server";
    const orderId = String(formData.get("order_id") ?? "");
    const next = String(formData.get("status") ?? "") as OrderStatus;
    const result = await updateOrderStatus(companySlug, orderId, next);
    if (!result.ok) throw new Error(result.error);
  }

  return (
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
        {STATUSES.map((s) => (
          <Link
            key={s}
            className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === s ? " is-active-filter" : ""}`}
            href={`/admin/companies/${companySlug}/orders?status=${s}`}
          >
            {s}
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
                    <strong>{o.customer_name}</strong>
                  </td>
                  <td>{o.customer_phone}</td>
                  <td>
                    {o.currency}{" "}
                    {Number(o.total).toLocaleString("en-US")}
                  </td>
                  <td>
                    <span className="sw-admin-badge">{o.status}</span>
                  </td>
                  <td>
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td>
                    <Link
                      className="sw-admin-btn sw-admin-btn-ghost"
                      href={`/admin/companies/${companySlug}/orders?${status ? `status=${status}&` : ""}view=${o.id}`}
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

      {detail ? (
        <div className="sw-admin-panel" style={{ marginTop: "1.25rem" }}>
          <div className="sw-admin-toolbar">
            <h3 style={{ margin: 0 }}>Order detail</h3>
            <Link
              className="sw-admin-btn sw-admin-btn-ghost"
              href={`/admin/companies/${companySlug}/orders${status ? `?status=${status}` : ""}`}
            >
              Close
            </Link>
          </div>
          <div className="sw-admin-info-grid" style={{ marginTop: "1rem" }}>
            <div className="sw-admin-info-item">
              <span>Customer</span>
              <strong>{detail.order.customer_name}</strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Phone</span>
              <strong>{detail.order.customer_phone}</strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Email</span>
              <strong>{detail.order.customer_email || "—"}</strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Location</span>
              <strong>{detail.order.customer_location || "—"}</strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Total</span>
              <strong>
                {detail.order.currency}{" "}
                {Number(detail.order.total).toLocaleString("en-US")}
              </strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Notes</span>
              <p>{detail.order.notes || "—"}</p>
            </div>
          </div>

          <h4>Items</h4>
          {detail.items.length === 0 ? (
            <p className="sw-admin-muted-sm">No line items.</p>
          ) : (
            <div className="sw-admin-table-wrap">
              <table className="sw-admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{Number(item.unit_price).toLocaleString("en-US")}</td>
                      <td>{Number(item.subtotal).toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form action={statusAction} className="sw-admin-inline-form" style={{ marginTop: "1rem" }}>
            <input type="hidden" name="order_id" value={detail.order.id} />
            <label htmlFor="order-status">Update status</label>
            <select
              id="order-status"
              name="status"
              defaultValue={detail.order.status}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <SubmitButton>Save status</SubmitButton>
          </form>
        </div>
      ) : null}
    </section>
  );
}
