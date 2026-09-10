import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SELECT,
  type Product,
  type ProductColor,
  type ProductSizeOption,
  type SizeDefinition,
} from "@/lib/admin/types-catalog";

export async function listSizeLibrary(): Promise<SizeDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sizes")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return [];
  return (data as SizeDefinition[]) ?? [];
}

async function loadProductVariants(
  productId: string
): Promise<{ colors: ProductColor[]; sizes: ProductSizeOption[] }> {
  const supabase = await createClient();
  const [{ data: colors }, { data: sizeRows }] = await Promise.all([
    supabase
      .from("product_colors")
      .select(
        "id, product_id, name, hex_code, image_url, image_public_id, sort_order, is_active"
      )
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_sizes")
      .select("id, sort_order, is_active, size:sizes(id, name, sort_order)")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const sizes: ProductSizeOption[] = [];
  for (const row of sizeRows ?? []) {
    const nested = row.size as
      | { id: string; name: string; sort_order: number }
      | { id: string; name: string; sort_order: number }[]
      | null;
    const size = Array.isArray(nested) ? nested[0] : nested;
    if (size?.id) {
      sizes.push({
        id: size.id,
        name: size.name,
        sort_order: row.sort_order ?? size.sort_order,
      });
    }
  }

  return {
    colors: ((colors as ProductColor[]) ?? []).filter((c) => c.is_active),
    sizes,
  };
}

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
  const variants = await loadProductVariants(productId);
  return { ...(data as Product), ...variants };
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
