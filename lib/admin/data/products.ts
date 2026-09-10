import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SELECT,
  type Product,
} from "@/lib/admin/types-catalog";

export async function listProducts(
  companyId: string,
  opts?: { search?: string }
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (opts?.search?.trim()) {
    query = query.ilike("name", `%${opts.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listProducts]", error.message);
    return [];
  }
  return (data as Product[]) ?? [];
}

export async function getProduct(
  companyId: string,
  productId: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("company_id", companyId)
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Product;
}

export async function countProducts(companyId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error) return 0;
  return count ?? 0;
}

export async function countOrderItemsForProduct(
  companyId: string,
  productId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("order_items")
    .select("id, orders!inner(company_id)", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("orders.company_id", companyId);

  if (error) return 0;
  return count ?? 0;
}
