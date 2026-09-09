"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canOperate } from "@/lib/admin/require-company-access";
import type { ActionResult, InquiryStatus } from "@/lib/admin/types-catalog";

const INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
];

export async function updateInquiry(
  companySlug: string,
  inquiryId: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "inquiries"
  );
  if (!canOperate(admin)) {
    return { ok: false, error: "You do not have permission to update inquiries." };
  }

  const status = String(formData.get("status") ?? "").trim() as InquiryStatus;
  if (!INQUIRY_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid inquiry status." };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status, notes })
    .eq("id", inquiryId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update inquiry." };
  }

  revalidatePath(`/admin/companies/${companySlug}/inquiries`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true };
}
