"use client";

import { useFormStatus } from "react-dom";
import {
  INQUIRY_STATUS_LABELS,
  inquiryStatusesForCompany,
} from "@/lib/admin/inquiry-utils";
import type { InquiryStatus } from "@/lib/admin/types-catalog";
import { SubmitButton } from "@/components/admin/SubmitButton";

function SaveStatusButton() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton pendingLabel="Saving…">
      {pending ? "Saving…" : "Save status"}
    </SubmitButton>
  );
}

export function InquiryStatusForm({
  companySlug,
  inquiryId,
  currentStatus,
  action,
  canEdit,
}: {
  companySlug: string;
  inquiryId: string;
  currentStatus: InquiryStatus;
  action: (formData: FormData) => void | Promise<void>;
  canEdit: boolean;
}) {
  const statuses = inquiryStatusesForCompany(companySlug);

  if (!canEdit) {
    return (
      <p style={{ margin: 0, color: "var(--admin-muted)" }}>
        You can view inquiries but do not have permission to update status.
      </p>
    );
  }

  return (
    <form action={action} className="sw-admin-order-status-form">
      <input type="hidden" name="inquiry_id" value={inquiryId} />
      <div className="sw-admin-field">
        <label htmlFor="inquiry-status">Status</label>
        <select id="inquiry-status" name="status" defaultValue={currentStatus}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {INQUIRY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <SaveStatusButton />
    </form>
  );
}
