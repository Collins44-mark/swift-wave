import Link from "next/link";

export default async function InquiryNotFound({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;

  return (
    <section className="sw-admin-panel sw-admin-route-error">
      <h2 className="sw-admin-route-error-title">Inquiry not found</h2>
      <p className="sw-admin-route-error-copy">
        This inquiry may have been removed or you may not have access to it.
      </p>
      <Link
        className="sw-admin-btn"
        href={`/admin/companies/${companySlug}/inquiries`}
      >
        ← Back to Inquiries
      </Link>
    </section>
  );
}
