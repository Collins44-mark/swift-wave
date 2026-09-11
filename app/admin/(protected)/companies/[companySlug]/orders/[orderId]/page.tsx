import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  requireCompanyAccess,
  canOperate,
  canMutate,
} from "@/lib/admin/require-company-access";
import { getOrderWithItems } from "@/lib/admin/data/orders";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { formatOrderReference } from "@/lib/admin/order-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string; orderId: string }>;
}): Promise<Metadata> {
  const { companySlug, orderId } = await params;
  const { company } = await requireCompanyAccess(companySlug, "orders");
  const detail = await getOrderWithItems(company.id, orderId);

  return {
    title: detail
      ? `Order #${formatOrderReference(detail.order.id)} — Swift Wave Admin`
      : "Order not found — Swift Wave Admin",
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string; orderId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { companySlug, orderId } = await params;
  const { status: listStatus } = await searchParams;
  const { admin, company } = await requireCompanyAccess(companySlug, "orders");
  const detail = await getOrderWithItems(company.id, orderId);

  if (!detail) {
    notFound();
  }

  return (
    <section className="sw-admin-panel">
      <OrderDetailView
        companySlug={companySlug}
        companyName={company.name}
        order={detail.order}
        items={detail.items}
        canEditStatus={canOperate(admin)}
        canDelete={canMutate(admin)}
        listStatus={listStatus ?? null}
      />
    </section>
  );
}
