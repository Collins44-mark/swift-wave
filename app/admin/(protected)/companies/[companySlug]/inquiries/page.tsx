import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listInquiries } from "@/lib/admin/data/inquiries";
import { updateInquiry } from "@/lib/admin/actions/inquiries";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { InquiryStatus } from "@/lib/admin/types-catalog";

export const metadata: Metadata = {
  title: "Inquiries — Swift Wave Admin",
  robots: { index: false, follow: false },
};

const STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
];

export default async function InquiriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const { companySlug } = await params;
  const { status, view } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "inquiries");

  const filterStatus =
    status && STATUSES.includes(status as InquiryStatus)
      ? (status as InquiryStatus)
      : "all";

  const inquiries = await listInquiries(company.id, {
    status: filterStatus,
  });
  const selected = view
    ? inquiries.find((i) => i.id === view) ??
      (await listInquiries(company.id)).find((i) => i.id === view) ??
      null
    : null;

  async function saveAction(formData: FormData) {
    "use server";
    if (!view) return;
    const result = await updateInquiry(companySlug, view, formData);
    if (!result.ok) throw new Error(result.error);
  }

  return (
    <section className="sw-admin-panel">
      <div className="sw-admin-toolbar">
        <div>
          <h2 style={{ margin: 0 }}>Inbox</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
            {inquiries.length} inquir{inquiries.length === 1 ? "y" : "ies"}
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
        {STATUSES.map((s) => (
          <Link
            key={s}
            className={`sw-admin-btn sw-admin-btn-ghost${filterStatus === s ? " is-active-filter" : ""}`}
            href={`/admin/companies/${companySlug}/inquiries?status=${s}`}
          >
            {s}
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
                <th>Type</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <span className="sw-admin-badge">{inq.inquiry_type}</span>
                  </td>
                  <td>
                    <strong>{inq.customer_name}</strong>
                  </td>
                  <td>{inq.customer_phone}</td>
                  <td>{inq.status}</td>
                  <td>{new Date(inq.created_at).toLocaleString()}</td>
                  <td>
                    <Link
                      className="sw-admin-btn sw-admin-btn-ghost"
                      href={`/admin/companies/${companySlug}/inquiries?${status ? `status=${status}&` : ""}view=${inq.id}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="sw-admin-panel" style={{ marginTop: "1.25rem" }}>
          <div className="sw-admin-toolbar">
            <h3 style={{ margin: 0 }}>
              {selected.customer_name} · {selected.inquiry_type}
            </h3>
            <Link
              className="sw-admin-btn sw-admin-btn-ghost"
              href={`/admin/companies/${companySlug}/inquiries${status ? `?status=${status}` : ""}`}
            >
              Close
            </Link>
          </div>
          <div className="sw-admin-info-grid" style={{ marginTop: "1rem" }}>
            <div className="sw-admin-info-item">
              <span>Phone</span>
              <strong>{selected.customer_phone}</strong>
            </div>
            <div className="sw-admin-info-item">
              <span>Source</span>
              <strong>{selected.source}</strong>
            </div>
            <div className="sw-admin-info-item" style={{ gridColumn: "1 / -1" }}>
              <span>Payload</span>
              <pre className="sw-admin-json">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
          </div>

          <form action={saveAction} className="sw-admin-form-grid" style={{ marginTop: "1rem" }}>
            <div className="sw-admin-field">
              <label htmlFor="inq-status">Status</label>
              <select
                id="inq-status"
                name="status"
                defaultValue={selected.status}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="sw-admin-field sw-admin-field-span">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={selected.notes ?? ""}
              />
            </div>
            <div className="sw-admin-toolbar sw-admin-field-span">
              <SubmitButton>Save</SubmitButton>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
