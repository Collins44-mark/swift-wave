import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  requireCompanyAccess,
  canOperate,
} from "@/lib/admin/require-company-access";
import { getOrderWithItems } from "@/lib/admin/data/orders";
import { updateOrderStatus } from "@/lib/admin/actions/orders";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { OrdersPageToasts } from "@/components/admin/OrdersPageToasts";
import { formatOrderReference } from "@/lib/admin/order-utils";
import type { OrderStatus } from "@/lib/admin/types-catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string; orderId: string }>;
}): Promise<Metadata> {
  const { companySlug, orderId } = await params;
  const { company } = await requireCompanyAccess(companySlug, "orders");
  const detail = await getOrderWithItems(company.id, orderId);

  if (!detail) {
    return {
      title: "Order not found — Swift Wave Admin",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Order #${formatOrderReference(detail.order.id)} — Swift Wave Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string; orderId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { companySlug, orderId } = await params;
  const { error: queryError, status: listStatus } = await searchParams;
  const { admin, company } = await requireCompanyAccess(companySlug, "orders");
  const detail = await getOrderWithItems(company.id, orderId);

  if (!detail) {
    notFound();
  }

  async function statusAction(formData: FormData) {
    "use server";
    const nextStatus = String(formData.get("status") ?? "") as OrderStatus;
    const targetOrderId = String(formData.get("order_id") ?? orderId);
    const result = await updateOrderStatus(
      companySlug,
      targetOrderId,
      nextStatus
    );

    const statusSuffix = listStatus ? `&status=${listStatus}` : "";

    if (!result.ok) {
      redirect(
        `/admin/companies/${companySlug}/orders/${orderId}?error=${encodeURIComponent(result.error)}${statusSuffix}`
      );
    }

    redirect(
      `/admin/companies/${companySlug}/orders/${orderId}?toast=order_status_updated${statusSuffix}`
    );
  }

  return (
    <>
      <OrdersPageToasts />
      <section className="sw-admin-panel">
        <OrderDetailView
          companySlug={companySlug}
          companyName={company.name}
          order={detail.order}
          items={detail.items}
          canEditStatus={canOperate(admin)}
          statusAction={statusAction}
          statusError={queryError ? decodeURIComponent(queryError) : null}
          listStatus={listStatus ?? null}
        />
      </section>
    </>
  );
}
