import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_SELECT,
  type Category,
} from "@/lib/admin/types-catalog";

export async function listCategories(
  companyId: string
): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return (data as Category[]) ?? [];
}

export async function countCategories(companyId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error) return 0;
  return count ?? 0;
}

export async function getCategory(
  companyId: string,
  categoryId: string
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("company_id", companyId)
    .eq("id", categoryId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Category;
}

export async function countProductsInCategory(
  companyId: string,
  categoryId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("category_id", categoryId);

  if (error) return 0;
  return count ?? 0;
}
