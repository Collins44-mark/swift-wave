import {
  INQUIRY_STATUS_LABELS,
  inquiryStatusBadgeClass,
} from "@/lib/admin/inquiry-utils";
import type { InquiryStatus } from "@/lib/admin/types-catalog";

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={inquiryStatusBadgeClass(status)}>
      {INQUIRY_STATUS_LABELS[status]}
    </span>
  );
}
