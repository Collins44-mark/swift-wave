"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { countProductsInCategory } from "@/lib/admin/data/categories";
import { slugify } from "@/lib/admin/slugify";
import type { ActionResult } from "@/lib/admin/types-catalog";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function categoryNameExists(
  companyId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id")
    .eq("company_id", companyId)
    .ilike("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function createCategory(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "categories"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view categories but cannot create them.",
    };
  }

  const name = str(formData, "name");
  if (!name) return { ok: false, error: "Name is required." };

  if (await categoryNameExists(company.id, name)) {
    return {
      ok: false,
      error: "A category with this name already exists for this company.",
    };
  }

  const slug = slugify(name);
  if (!slug) return { ok: false, error: "Could not generate a valid slug." };

  const isActive =
    !formData.has("is_active") ||
    formData.get("is_active") === "on" ||
    formData.get("is_active") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      company_id: company.id,
      name,
      slug,
      description: str(formData, "description") || null,
      parent_id: str(formData, "parent_id") || null,
      is_active: isActive,
      sort_order: Number(str(formData, "sort_order") || "0") || 0,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "A category with this name or slug already exists.",
      };
    }
    return { ok: false, error: error.message || "Failed to create category." };
  }

  revalidatePath(`/admin/companies/${companySlug}/categories`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true, id: data.id };
}

export async function updateCategory(
  companySlug: string,
  categoryId: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "categories"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view categories but cannot edit them.",
    };
  }

  const name = str(formData, "name");
  if (!name) return { ok: false, error: "Name is required." };

  if (await categoryNameExists(company.id, name, categoryId)) {
    return {
      ok: false,
      error: "A category with this name already exists for this company.",
    };
  }

  const slug = slugify(name);
  const parentId = str(formData, "parent_id") || null;
  if (parentId === categoryId) {
    return { ok: false, error: "A category cannot be its own parent." };
  }

  const isActive =
    formData.get("is_active") === "on" ||
    formData.get("is_active") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description: str(formData, "description") || null,
      parent_id: parentId,
      is_active: isActive,
      sort_order: Number(str(formData, "sort_order") || "0") || 0,
    })
    .eq("id", categoryId)
    .eq("company_id", company.id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "A category with this name or slug already exists.",
      };
    }
    return { ok: false, error: error.message || "Failed to update category." };
  }

  revalidatePath(`/admin/companies/${companySlug}/categories`);
  revalidatePath(`/admin/companies/${companySlug}/categories/${categoryId}/edit`);
  return { ok: true };
}

export async function deleteCategory(
  companySlug: string,
  categoryId: string
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "categories"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view categories but cannot delete them.",
    };
  }

  const productCount = await countProductsInCategory(company.id, categoryId);
  if (productCount > 0) {
    return {
      ok: false,
      error: `This category is currently used by ${productCount} product${productCount === 1 ? "" : "s"} and cannot be deleted. Reassign those products or deactivate the category instead.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to delete category." };
  }

  revalidatePath(`/admin/companies/${companySlug}/categories`);
  revalidatePath(`/admin/companies/${companySlug}`);
  return { ok: true };
}
