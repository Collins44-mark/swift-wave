"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { slugify } from "@/lib/admin/slugify";
import type { ActionResult, ProductStatus } from "@/lib/admin/types-catalog";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseBullets(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parsePrice(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function createProduct(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot create them." };
  }

  const name = str(formData, "name");
  if (!name) return { ok: false, error: "Name is required." };

  let slug = str(formData, "slug") || slugify(name);
  if (!slug) slug = `product-${Date.now()}`;

  const supabase = await createClient();
  const payload = {
    company_id: company.id,
    name,
    slug,
    description: str(formData, "description") || null,
    price: parsePrice(str(formData, "price")),
    price_label: str(formData, "price_label") || null,
    currency: str(formData, "currency") || "TZS",
    category_id: str(formData, "category_id") || null,
    subcategory: str(formData, "subcategory") || null,
    rating: str(formData, "rating") || null,
    bullets: parseBullets(str(formData, "bullets")),
    image_url: str(formData, "image_url") || null,
    image_public_id: str(formData, "image_public_id") || null,
    status: (str(formData, "status") || "draft") as ProductStatus,
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message || "Failed to create product." };
  }

  revalidatePath(`/admin/companies/${companySlug}/products`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true, id: data.id };
}

export async function updateProduct(
  companySlug: string,
  productId: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot edit them." };
  }

  const name = str(formData, "name");
  if (!name) return { ok: false, error: "Name is required." };

  let slug = str(formData, "slug") || slugify(name);
  if (!slug) slug = `product-${Date.now()}`;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description: str(formData, "description") || null,
      price: parsePrice(str(formData, "price")),
      price_label: str(formData, "price_label") || null,
      currency: str(formData, "currency") || "TZS",
      category_id: str(formData, "category_id") || null,
      subcategory: str(formData, "subcategory") || null,
      rating: str(formData, "rating") || null,
      bullets: parseBullets(str(formData, "bullets")),
      image_url: str(formData, "image_url") || null,
      image_public_id: str(formData, "image_public_id") || null,
      status: (str(formData, "status") || "draft") as ProductStatus,
      featured:
        formData.get("featured") === "on" || formData.get("featured") === "true",
      sort_order: Number(str(formData, "sort_order") || "0") || 0,
    })
    .eq("id", productId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update product." };
  }

  revalidatePath(`/admin/companies/${companySlug}/products`);
  revalidatePath(`/admin/companies/${companySlug}/products/${productId}/edit`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true };
}

export async function deleteProduct(
  companySlug: string,
  productId: string
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot delete them." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to delete product." };
  }

  revalidatePath(`/admin/companies/${companySlug}/products`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true };
}

export async function publishProduct(
  companySlug: string,
  productId: string,
  status: ProductStatus = "published"
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff cannot change product status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update status." };
  }

  revalidatePath(`/admin/companies/${companySlug}/products`);
  return { ok: true };
}
