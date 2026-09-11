"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { slugify } from "@/lib/admin/slugify";
import type { ActionResult, BulkDeleteResult } from "@/lib/admin/types-catalog";
import { MAX_BULK_DELETE, uniqueValidIds } from "@/lib/admin/ids";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidateCategoryCatalog(companySlug: string) {
  revalidatePath(`/companies/${companySlug}`);
  revalidatePath(`/api/public/catalog/${companySlug}`);
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

  revalidateCategoryCatalog(company.slug);
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

  revalidateCategoryCatalog(company.slug);
  return { ok: true };
}

export async function deleteCategories(
  companySlug: string,
  categoryIds: string[]
): Promise<BulkDeleteResult> {
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

  const ids = uniqueValidIds(categoryIds);
  if (!ids.length) {
    return { ok: false, error: "No categories selected." };
  }
  if (ids.length > MAX_BULK_DELETE) {
    return {
      ok: false,
      error: `You can delete up to ${MAX_BULK_DELETE} categories at a time.`,
    };
  }

  const supabase = await createClient();
  const { data: owned, error: lookupError } = await supabase
    .from("categories")
    .select("id")
    .eq("company_id", company.id)
    .in("id", ids);

  if (lookupError) {
    return {
      ok: false,
      error:
        lookupError.message || "Unable to delete categories. Please try again.",
    };
  }

  const ownedIds = (owned ?? []).map((row) => row.id as string);
  if (ownedIds.length !== ids.length) {
    return {
      ok: false,
      error: "One or more selected categories could not be deleted.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("company_id", company.id)
    .in("id", ownedIds)
    .select("id");

  if (error || !data?.length || data.length !== ownedIds.length) {
    return {
      ok: false,
      error: error?.message || "Unable to delete categories. Please try again.",
    };
  }

  revalidateCategoryCatalog(company.slug);
  return { ok: true, deletedIds: data.map((row) => row.id as string) };
}

export async function deleteCategory(
  companySlug: string,
  categoryId: string
): Promise<ActionResult> {
  const result = await deleteCategories(companySlug, [categoryId]);
  if (!result.ok) return result;
  if (!result.deletedIds.length) {
    return { ok: false, error: "Unable to delete category. Please try again." };
  }
  return { ok: true };
}
