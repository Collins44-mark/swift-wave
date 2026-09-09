import Link from "next/link";

export default async function OrderNotFound({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;

  return (
    <section className="sw-admin-panel sw-admin-route-error">
      <h2 className="sw-admin-route-error-title">Order not found</h2>
      <p className="sw-admin-route-error-copy">
        This order may have been removed or you may not have access to it.
      </p>
      <Link
        className="sw-admin-btn"
        href={`/admin/companies/${companySlug}/orders`}
      >
        ← Back to Orders
      </Link>
    </section>
  );
}
