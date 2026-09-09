"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canOperate } from "@/lib/admin/require-company-access";
import type { ActionResult, OrderStatus } from "@/lib/admin/types-catalog";

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
];

export async function updateOrderStatus(
  companySlug: string,
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "orders");
  if (!canOperate(admin)) {
    return { ok: false, error: "You do not have permission to update orders." };
  }

  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid order status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("company_id", company.id);

  if (error) {
    return {
      ok: false,
      error: "Couldn't update the order status. Please try again.",
    };
  }

  revalidatePath(`/admin/companies/${companySlug}/orders`);
  revalidatePath(`/admin/companies/${companySlug}/orders/${orderId}`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true, message: "Order status updated." };
}
