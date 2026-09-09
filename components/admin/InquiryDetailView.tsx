import Link from "next/link";
import type { Inquiry } from "@/lib/admin/types-catalog";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquiryStatusForm } from "@/components/admin/InquiryStatusForm";
import {
  inquiryMessage,
  inquirySubjectLabel,
  isContactInquiry,
} from "@/lib/admin/inquiry-utils";
import { customerPhoneHref } from "@/lib/admin/order-utils";

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

export function InquiryDetailView({
  companySlug,
  inquiry,
  canEditStatus,
  statusAction,
  statusError,
  listStatus,
}: {
  companySlug: string;
  inquiry: Inquiry;
  canEditStatus: boolean;
  statusAction: (formData: FormData) => void | Promise<void>;
  statusError?: string | null;
  listStatus?: string | null;
}) {
  const payload = inquiry.payload ?? {};
  const contactInquiry = isContactInquiry(inquiry.inquiry_type, payload);
  const subject = contactInquiry
    ? inquirySubjectLabel(payload)
    : inquiry.inquiry_type.replace(/_/g, " ");
  const message = contactInquiry
    ? inquiryMessage(payload)
    : "";
  const phoneHref = customerPhoneHref(inquiry.customer_phone);
  const inquiriesListHref =
    listStatus && listStatus !== "all"
      ? `/admin/companies/${companySlug}/inquiries?status=${listStatus}`
      : `/admin/companies/${companySlug}/inquiries`;

  return (
    <div className="sw-admin-order-detail">
      <div className="sw-admin-order-detail-header">
        <Link className="sw-admin-back-link" href={inquiriesListHref}>
          ← Back to Inquiries
        </Link>
        <div className="sw-admin-order-detail-title-row">
          <div>
            <h2 className="sw-admin-order-detail-title">{inquiry.customer_name}</h2>
            <p className="sw-admin-order-detail-meta">
              {new Date(inquiry.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <InquiryStatusBadge status={inquiry.status} />
        </div>
      </div>

      {statusError ? (
        <div className="sw-admin-alert is-error" role="alert">
          {statusError}
        </div>
      ) : null}

      <div className="sw-admin-order-detail-grid">
        <section className="sw-admin-order-card">
          <h3 className="sw-admin-order-card-title">Contact details</h3>
          <dl className="sw-admin-order-fields">
            <div className="sw-admin-order-field">
              <dt>Full name</dt>
              <dd>{displayValue(inquiry.customer_name)}</dd>
            </div>
            <div className="sw-admin-order-field">
              <dt>Email or phone</dt>
              <dd>
                {phoneHref && !inquiry.customer_phone.includes("@") ? (
                  <a href={phoneHref}>{inquiry.customer_phone}</a>
                ) : inquiry.customer_phone.includes("@") ? (
                  <a href={`mailto:${inquiry.customer_phone}`}>
                    {inquiry.customer_phone}
                  </a>
                ) : (
                  displayValue(inquiry.customer_phone)
                )}
              </dd>
            </div>
            <div className="sw-admin-order-field">
              <dt>Subject</dt>
              <dd>{displayValue(subject)}</dd>
            </div>
            <div className="sw-admin-order-field">
              <dt>Submitted</dt>
              <dd>{new Date(inquiry.created_at).toLocaleString()}</dd>
            </div>
          </dl>
        </section>

        <section className="sw-admin-order-card">
          <h3 className="sw-admin-order-card-title">Status</h3>
          <InquiryStatusForm
            companySlug={companySlug}
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
            action={statusAction}
            canEdit={canEditStatus}
          />
        </section>
      </div>

      <section className="sw-admin-order-card sw-admin-order-items-card">
        <h3 className="sw-admin-order-card-title">Message</h3>
        {message ? (
          <p className="sw-admin-inquiry-message">{message}</p>
        ) : (
          <pre className="sw-admin-json">
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </section>

      {inquiry.notes ? (
        <section className="sw-admin-order-card sw-admin-order-items-card">
          <h3 className="sw-admin-order-card-title">Internal notes</h3>
          <p className="sw-admin-inquiry-message">{inquiry.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
