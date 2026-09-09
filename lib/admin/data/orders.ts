import { createClient } from "@/lib/supabase/server";
import {
  ORDER_SELECT,
  type Order,
  type OrderItem,
  type OrderItemEnriched,
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
): Promise<{ order: Order; items: OrderItemEnriched[] } | null> {
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

  const baseItems = (items as OrderItem[]) ?? [];
  const productIds = [
    ...new Set(
      baseItems
        .map((item) => item.product_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const productMeta = new Map<
    string,
    { image_url: string | null; category_name: string | null }
  >();

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, image_url, category_id")
      .eq("company_id", companyId)
      .in("id", productIds);

    const categoryIds = [
      ...new Set(
        (products ?? [])
          .map((p) => p.category_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const categoryNames = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .eq("company_id", companyId)
        .in("id", categoryIds);

      for (const category of categories ?? []) {
        categoryNames.set(category.id, category.name);
      }
    }

    for (const product of products ?? []) {
      productMeta.set(product.id, {
        image_url: product.image_url,
        category_name: product.category_id
          ? categoryNames.get(product.category_id) ?? null
          : null,
      });
    }
  }

  const enrichedItems: OrderItemEnriched[] = baseItems.map((item) => {
    const meta = item.product_id ? productMeta.get(item.product_id) : null;
    return {
      ...item,
      product_image_url: meta?.image_url ?? null,
      product_category: meta?.category_name ?? null,
    };
  });

  return {
    order: order as Order,
    items: enrichedItems,
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
