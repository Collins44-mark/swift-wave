import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listInquiries } from "@/lib/admin/data/inquiries";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquiriesPageToasts } from "@/components/admin/InquiriesPageToasts";
import {
  INQUIRY_STATUS_LABELS,
  inquiryStatusesForCompany,
  inquirySubjectLabel,
  isContactInquiry,
} from "@/lib/admin/inquiry-utils";
import type { InquiryStatus } from "@/lib/admin/types-catalog";

export const metadata: Metadata = {
  title: "Inquiries — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function InquiriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { companySlug } = await params;
  const { status } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "inquiries");

  const statuses = inquiryStatusesForCompany(companySlug);
  const filterStatus =
    status && statuses.includes(status as InquiryStatus)
      ? (status as InquiryStatus)
      : "all";

  const inquiries = await listInquiries(company.id, {
    status: filterStatus,
  });

  const statusQuery =
    filterStatus !== "all" ? `?status=${filterStatus}` : "";

  const inboxTitle = companySlug === "corporate" ? "Contact Messages" : "Inbox";

  return (
    <>
      <InquiriesPageToasts />
      <section className="sw-admin-panel">
        <div className="sw-admin-toolbar">
          <div>
            <h2 style={{ margin: 0 }}>{inboxTitle}</h2>
            <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
              {inquiries.length} message{inquiries.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="sw-admin-inline-form" style={{ marginTop: "1rem" }}>
          <Link
            className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === "all" ? " is-active-filter" : ""}`}
            href={`/admin/companies/${companySlug}/inquiries`}
          >
            All
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === s ? " is-active-filter" : ""}`}
              href={`/admin/companies/${companySlug}/inquiries?status=${s}`}
            >
              {INQUIRY_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {inquiries.length === 0 ? (
          <div className="sw-admin-empty" style={{ marginTop: "1rem" }}>
            No inquiries yet.
          </div>
        ) : (
          <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="sw-admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email / Phone</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => {
                  const payload = inq.payload ?? {};
                  const subject = isContactInquiry(inq.inquiry_type, payload)
                    ? inquirySubjectLabel(payload)
                    : inq.inquiry_type.replace(/_/g, " ");

                  return (
                    <tr key={inq.id}>
                      <td>
                        <strong>{inq.customer_name}</strong>
                      </td>
                      <td>{inq.customer_phone}</td>
                      <td>{subject}</td>
                      <td>
                        <InquiryStatusBadge status={inq.status} />
                      </td>
                      <td>{new Date(inq.created_at).toLocaleString()}</td>
                      <td>
                        <Link
                          className="sw-admin-btn sw-admin-btn-ghost"
                          href={`/admin/companies/${companySlug}/inquiries/${inq.id}${statusQuery}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
