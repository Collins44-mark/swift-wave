"use server";

import { createClient } from "@/lib/supabase/server";
import {
  requireCompanyAccess,
  canMutate,
  canOperate,
} from "@/lib/admin/require-company-access";
import type { ActionResult, BulkDeleteResult, OrderStatus } from "@/lib/admin/types-catalog";
import { MAX_BULK_DELETE, uniqueValidIds } from "@/lib/admin/ids";

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
  const { error, data } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("company_id", company.id)
    .select("id");

  if (error || !data?.length) {
    return {
      ok: false,
      error: "Couldn't update the order status. Please try again.",
    };
  }

  return { ok: true, message: "Order status updated." };
}

export async function deleteOrders(
  companySlug: string,
  orderIds: string[]
): Promise<BulkDeleteResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "orders");
  if (!canMutate(admin)) {
    return { ok: false, error: "You do not have permission to delete orders." };
  }

  const ids = uniqueValidIds(orderIds);
  if (!ids.length) {
    return { ok: false, error: "No orders selected." };
  }
  if (ids.length > MAX_BULK_DELETE) {
    return {
      ok: false,
      error: `You can delete up to ${MAX_BULK_DELETE} orders at a time.`,
    };
  }

  const supabase = await createClient();
  const { data: owned, error: lookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("company_id", company.id)
    .in("id", ids);

  if (lookupError) {
    return {
      ok: false,
      error: lookupError.message || "Unable to delete orders. Please try again.",
    };
  }

  const ownedIds = (owned ?? []).map((row) => row.id as string);
  if (ownedIds.length !== ids.length) {
    return {
      ok: false,
      error: "One or more selected orders could not be deleted.",
    };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .delete()
    .in("order_id", ownedIds);

  if (itemsError) {
    return {
      ok: false,
      error: itemsError.message || "Unable to delete orders. Please try again.",
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("company_id", company.id)
    .in("id", ownedIds)
    .select("id");

  if (error || !data?.length || data.length !== ownedIds.length) {
    return {
      ok: false,
      error: error?.message || "Unable to delete orders. Please try again.",
    };
  }

  return { ok: true, deletedIds: data.map((row) => row.id as string) };
}

export async function deleteOrder(
  companySlug: string,
  orderId: string
): Promise<ActionResult> {
  const result = await deleteOrders(companySlug, [orderId]);
  if (!result.ok) return result;
  if (!result.deletedIds.length) {
    return { ok: false, error: "Unable to delete order. Please try again." };
  }
  return { ok: true };
}
