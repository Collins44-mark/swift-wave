import { createClient } from "@/lib/supabase/server";
import {
  ORDER_SELECT,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "@/lib/admin/types-catalog";

export async function listOrders(
  companyId: string,
  opts?: { status?: OrderStatus | "all" }
): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as Order[]) ?? [];
}

export async function getOrderWithItems(
  companyId: string,
  orderId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("company_id", companyId)
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, product_name, quantity, unit_price, subtotal"
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return {
    order: order as Order,
    items: (items as OrderItem[]) ?? [],
  };
}

export async function countOrders(
  companyId: string,
  opts?: { status?: OrderStatus }
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (opts?.status) {
    query = query.eq("status", opts.status);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}
