import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SELECT,
  PRODUCT_SELECT_CORE,
  type ColorDefinition,
  type Product,
  type ProductColor,
  type ProductSizeOption,
  type SizeDefinition,
} from "@/lib/admin/types-catalog";
import { resolvedSwatchHex } from "@/lib/catalog/color-display";
import { isMissingColumnError } from "@/lib/admin/supabase-error";

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

export async function listColorLibrary(): Promise<ColorDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colors")
    .select("id, name, hex_code, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return [];
  return ((data as ColorDefinition[]) ?? []).map((row) => ({
    ...row,
    hex_code: resolvedSwatchHex(row.hex_code),
  }));
}

async function loadProductVariants(
  productId: string
): Promise<{ colors: ProductColor[]; sizes: ProductSizeOption[] }> {
  const supabase = await createClient();
  const [{ data: colors }, { data: sizeRows }] = await Promise.all([
    supabase
      .from("product_colors")
      .select(
        "id, product_id, color_id, name, hex_code, image_url, image_public_id, sort_order, is_active, color:colors(id, name, hex_code)"
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

  const mappedColors: ProductColor[] = [];
  for (const row of colors ?? []) {
    const nested = (row as { color?: unknown }).color as
      | { id: string; name: string; hex_code: string | null }
      | { id: string; name: string; hex_code: string | null }[]
      | null
      | undefined;
    const lib = Array.isArray(nested) ? nested[0] : nested;
    const pc = row as ProductColor;
    mappedColors.push({
      ...pc,
      color_id: pc.color_id || lib?.id || null,
      name: lib?.name || pc.name,
      hex_code: resolvedSwatchHex(lib?.hex_code ?? pc.hex_code),
    });
  }

  return {
    colors: mappedColors.filter((c) => c.is_active),
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
  if (!error) return (data as Product[]) ?? [];
  console.error("[listProducts]", error.code, error.message);
  if (
    isMissingColumnError(error, "primary_color_id") ||
    isMissingColumnError(error, "discount_type") ||
    isMissingColumnError(error, "discount_value")
  ) {
    let fallback = supabase
      .from("products")
      .select(PRODUCT_SELECT_CORE)
      .eq("company_id", companyId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (opts?.search?.trim()) {
      fallback = fallback.ilike("name", `%${opts.search.trim()}%`);
    }
    const retry = await fallback;
    if (retry.error) {
      console.error("[listProducts.core]", retry.error.code, retry.error.message);
      return [];
    }
    return (retry.data as Product[]) ?? [];
  }
  return [];
}

export async function getProduct(
  companyId: string,
  productId: string
): Promise<Product | null> {
  const supabase = await createClient();
  const full = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("company_id", companyId)
    .eq("id", productId)
    .maybeSingle();

  let data: Product | null = (full.data as Product | null) ?? null;
  if (full.error) {
    console.error("[getProduct]", full.error.code, full.error.message);
    if (
      isMissingColumnError(full.error, "primary_color_id") ||
      isMissingColumnError(full.error, "discount_type") ||
      isMissingColumnError(full.error, "discount_value")
    ) {
      const core = await supabase
        .from("products")
        .select(PRODUCT_SELECT_CORE)
        .eq("company_id", companyId)
        .eq("id", productId)
        .maybeSingle();
      if (core.error || !core.data) return null;
      data = {
        ...(core.data as Product),
        primary_color_id: null,
        discount_type: "none",
        discount_value: 0,
      };
    } else {
      return null;
    }
  }

  if (!data) return null;
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
