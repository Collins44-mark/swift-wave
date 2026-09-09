"use client";

import { useState, useTransition } from "react";
import {
  INQUIRY_STATUS_LABELS,
  inquiryStatusesForCompany,
} from "@/lib/admin/inquiry-utils";
import type { InquiryStatus } from "@/lib/admin/types-catalog";
import { updateInquiry } from "@/lib/admin/actions/inquiries";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function InquiryStatusForm({
  companySlug,
  inquiryId,
  initialStatus,
  canEdit,
  onStatusChange,
}: {
  companySlug: string;
  inquiryId: string;
  initialStatus: InquiryStatus;
  canEdit: boolean;
  onStatusChange?: (status: InquiryStatus) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();
  const statuses = inquiryStatusesForCompany(companySlug);

  if (!canEdit) {
    return (
      <p style={{ margin: 0, color: "var(--admin-muted)" }}>
        You can view inquiries but do not have permission to update status.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("status", status);

    startTransition(async () => {
      const result = await updateInquiry(companySlug, inquiryId, formData);
      if (!result.ok) {
        showError("Couldn't update the inquiry status. Please try again.");
        return;
      }
      onStatusChange?.(status);
      showSuccess("Status updated.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="sw-admin-order-status-form">
      <div className="sw-admin-field">
        <label htmlFor="inquiry-status">Status</label>
        <select
          id="inquiry-status"
          name="status"
          value={status}
          disabled={pending}
          onChange={(e) => setStatus(e.target.value as InquiryStatus)}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {INQUIRY_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="sw-admin-btn" disabled={pending}>
        {pending ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
