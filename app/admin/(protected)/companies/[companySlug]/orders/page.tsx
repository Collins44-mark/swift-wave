import type { Metadata } from "next";
import Link from "next/link";
import {
  requireCompanyAccess,
  canOperate,
} from "@/lib/admin/require-company-access";
import { listOrders } from "@/lib/admin/data/orders";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
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
  const { admin, company } = await requireCompanyAccess(companySlug, "orders");

  const filterStatus =
    status && ORDER_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "all";

  const orders = await listOrders(company.id, {
    status: filterStatus,
  });

  return (
    <>
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

        <OrdersTableClient
          companySlug={companySlug}
          initialOrders={orders}
          filterStatus={filterStatus}
          canEditStatus={canOperate(admin)}
        />
      </section>
    </>
  );
}
