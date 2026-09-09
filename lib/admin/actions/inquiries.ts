"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canOperate } from "@/lib/admin/require-company-access";
import type { ActionResult, InquiryStatus } from "@/lib/admin/types-catalog";

import { inquiryStatusesForCompany } from "@/lib/admin/inquiry-utils";

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

  const allowedStatuses = inquiryStatusesForCompany(companySlug);
  const status = String(formData.get("status") ?? "").trim() as InquiryStatus;
  if (!allowedStatuses.includes(status)) {
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
    return {
      ok: false,
      error: "Couldn't update the inquiry status. Please try again.",
    };
  }

  revalidatePath(`/admin/companies/${companySlug}/inquiries`);
  revalidatePath(`/admin/companies/${companySlug}/inquiries/${inquiryId}`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true, message: "Status updated." };
}
