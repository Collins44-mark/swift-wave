import type { InquiryStatus } from "@/lib/admin/types-catalog";

export const OPERATIONAL_INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
];

export const CONTACT_INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "read",
  "replied",
  "resolved",
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  resolved: "Resolved",
  contacted: "Contacted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function inquiryStatusesForCompany(companySlug: string): InquiryStatus[] {
  if (companySlug === "corporate") {
    return CONTACT_INQUIRY_STATUSES;
  }
  return OPERATIONAL_INQUIRY_STATUSES;
}

export function inquiryStatusBadgeClass(status: InquiryStatus): string {
  return `sw-admin-badge sw-admin-inquiry-status is-inquiry-${status.replace(/_/g, "-")}`;
}

export function inquirySubjectLabel(payload: Record<string, unknown>): string {
  const label = payload.subject_label;
  if (typeof label === "string" && label.trim()) {
    return label.trim();
  }
  const subject = payload.subject;
  if (typeof subject === "string" && subject.trim()) {
    return subject.trim();
  }
  return "General inquiry";
}

export function inquiryMessage(payload: Record<string, unknown>): string {
  const message = payload.message;
  return typeof message === "string" ? message.trim() : "";
}

export function isContactInquiry(
  inquiryType: string,
  payload: Record<string, unknown>
): boolean {
  return inquiryType === "general" && payload.source_page === "contact";
}
