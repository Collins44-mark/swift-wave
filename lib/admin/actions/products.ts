"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { slugify } from "@/lib/admin/slugify";
import {
  defaultProductCurrency,
  isProductCurrency,
} from "@/lib/admin/product-currencies";
import {
  parseColorDrafts,
  parseSizeNames,
  replaceProductVariants,
} from "@/lib/admin/actions/product-variants";
import type { ActionResult, BulkDeleteResult } from "@/lib/admin/types-catalog";
import { MAX_BULK_DELETE, uniqueValidIds } from "@/lib/admin/ids";

function friendlyProductError(
  error: { code?: string; message?: string } | null,
  fallback: string
): string {
  if (!error) return fallback;
  if (error.code === "23505") {
    return "A product with this URL slug already exists. Choose a different slug.";
  }
  if (error.message) return error.message;
  return fallback;
}

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

function revalidateProductSurfaces(companySlug: string) {
  revalidatePath(`/companies/${companySlug}`);
  revalidatePath(`/api/public/catalog/${companySlug}`);
}

async function resolveChildCategory(opts: {
  companyId: string;
  parentCategoryId: string;
  categoryId: string;
}): Promise<
  | { ok: true; categoryId: string; subcategory: string }
  | { ok: false; error: string }
> {
  const { companyId, parentCategoryId, categoryId } = opts;
  if (!parentCategoryId) {
    return { ok: false, error: "Parent category is required." };
  }
  if (!categoryId) {
    return { ok: false, error: "Category is required." };
  }

  const supabase = await createClient();
  const { data: child, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, company_id")
    .eq("id", categoryId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error || !child) {
    return { ok: false, error: "Selected category was not found for this company." };
  }

  if (child.parent_id !== parentCategoryId) {
    return {
      ok: false,
      error: "The selected category does not belong to that parent category.",
    };
  }

  return { ok: true, categoryId: child.id, subcategory: child.name };
}

function readProductFields(
  formData: FormData,
  companySlug: string
):
  | {
      ok: true;
      name: string;
      slug: string;
      description: string;
      price: number;
      price_label: string | null;
      currency: string;
      parentCategoryId: string;
      categoryId: string;
      rating: string | null;
      bullets: string[];
      image_url: string | null;
      image_public_id: string | null;
      featured: boolean;
      sort_order: number;
    }
  | { ok: false; error: string } {
  const name = str(formData, "name");
  if (!name) return { ok: false, error: "Name is required." };

  const description = str(formData, "description");
  if (!description) return { ok: false, error: "Description is required." };

  const price = parsePrice(str(formData, "price"));
  if (price == null) return { ok: false, error: "Price is required." };
  if (price < 0) return { ok: false, error: "Price must be zero or greater." };

  const currency = str(formData, "currency") || defaultProductCurrency(companySlug);
  if (!isProductCurrency(currency)) {
    return { ok: false, error: "Select a valid currency." };
  }

  let slug = str(formData, "slug") || slugify(name);
  if (!slug) slug = `product-${Date.now()}`;

  return {
    ok: true,
    name,
    slug,
    description,
    price,
    price_label: str(formData, "price_label") || null,
    currency,
    parentCategoryId: str(formData, "parent_category_id"),
    categoryId: str(formData, "category_id"),
    rating: str(formData, "rating") || null,
    bullets: parseBullets(str(formData, "bullets")),
    image_url: str(formData, "image_url") || null,
    image_public_id: str(formData, "image_public_id") || null,
    featured:
      formData.get("featured") === "on" || formData.get("featured") === "true",
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
  };
}

export async function createProduct(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot create them." };
  }

  const fields = readProductFields(formData, company.slug);
  if (!fields.ok) return fields;

  const category = await resolveChildCategory({
    companyId: company.id,
    parentCategoryId: fields.parentCategoryId,
    categoryId: fields.categoryId,
  });
  if (!category.ok) return category;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      company_id: company.id,
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      price: fields.price,
      price_label: fields.price_label,
      currency: fields.currency,
      category_id: category.categoryId,
      subcategory: category.subcategory,
      rating: fields.rating,
      bullets: fields.bullets,
      image_url: fields.image_url,
      image_public_id: fields.image_public_id,
      status: "published",
      featured: fields.featured,
      sort_order: fields.sort_order,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      ok: false,
      error: friendlyProductError(
        error,
        "Unable to create product. Please try again."
      ),
    };
  }

  const colors = parseColorDrafts(str(formData, "colors_json"));
  if ("error" in colors) {
    await supabase.from("products").delete().eq("id", data.id);
    return { ok: false, error: colors.error };
  }
  const sizeNames = parseSizeNames(str(formData, "sizes_json"));
  if ("error" in sizeNames) {
    await supabase.from("products").delete().eq("id", data.id);
    return { ok: false, error: sizeNames.error };
  }

  const variants = await replaceProductVariants(
    supabase,
    data.id,
    colors,
    sizeNames
  );
  if (!variants.ok) {
    await supabase.from("products").delete().eq("id", data.id);
    return variants;
  }

  if (variants.coverUrl && !fields.image_url) {
    const { error: coverError, data: coverRows } = await supabase
      .from("products")
      .update({
        image_url: variants.coverUrl,
        image_public_id: variants.coverPublicId,
      })
      .eq("id", data.id)
      .eq("company_id", company.id)
      .select("id");
    if (coverError || !coverRows?.length) {
      revalidateProductSurfaces(company.slug);
      return {
        ok: false,
        error:
          "Image uploaded, but product changes could not be saved. Please try again.",
      };
    }
  }

  revalidateProductSurfaces(company.slug);
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

  const fields = readProductFields(formData, company.slug);
  if (!fields.ok) return fields;

  const category = await resolveChildCategory({
    companyId: company.id,
    parentCategoryId: fields.parentCategoryId,
    categoryId: fields.categoryId,
  });
  if (!category.ok) return category;

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (existingError || !existing) {
    return { ok: false, error: "Product was not found for this company." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      price: fields.price,
      price_label: fields.price_label,
      currency: fields.currency,
      category_id: category.categoryId,
      subcategory: category.subcategory,
      rating: fields.rating,
      bullets: fields.bullets,
      image_url: fields.image_url,
      image_public_id: fields.image_public_id,
      status: "published",
      featured: fields.featured,
      sort_order: fields.sort_order,
    })
    .eq("id", productId)
    .eq("company_id", company.id)
    .select("id");

  if (error || !data?.length) {
    return {
      ok: false,
      error: friendlyProductError(
        error,
        "Unable to update product. Please try again."
      ),
    };
  }

  const colors = parseColorDrafts(str(formData, "colors_json"));
  if ("error" in colors) return { ok: false, error: colors.error };
  const sizeNames = parseSizeNames(str(formData, "sizes_json"));
  if ("error" in sizeNames) return { ok: false, error: sizeNames.error };

  const variants = await replaceProductVariants(
    supabase,
    productId,
    colors,
    sizeNames
  );
  if (!variants.ok) return variants;

  if (variants.coverUrl && !fields.image_url) {
    const { error: coverError, data: coverRows } = await supabase
      .from("products")
      .update({
        image_url: variants.coverUrl,
        image_public_id: variants.coverPublicId,
      })
      .eq("id", productId)
      .eq("company_id", company.id)
      .select("id");
    if (coverError || !coverRows?.length) {
      return {
        ok: false,
        error:
          "Image uploaded, but product changes could not be saved. Please try again.",
      };
    }
  }

  revalidateProductSurfaces(company.slug);
  return { ok: true };
}

export async function deleteProducts(
  companySlug: string,
  productIds: string[]
): Promise<BulkDeleteResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot delete them." };
  }

  const ids = uniqueValidIds(productIds);
  if (!ids.length) {
    return { ok: false, error: "No products selected." };
  }
  if (ids.length > MAX_BULK_DELETE) {
    return {
      ok: false,
      error: `You can delete up to ${MAX_BULK_DELETE} products at a time.`,
    };
  }

  const supabase = await createClient();
  const { data: owned, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("company_id", company.id)
    .in("id", ids);

  if (lookupError) {
    return {
      ok: false,
      error: lookupError.message || "Unable to delete products. Please try again.",
    };
  }

  const ownedIds = (owned ?? []).map((row) => row.id as string);
  if (ownedIds.length !== ids.length) {
    return {
      ok: false,
      error: "One or more selected products could not be deleted.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("company_id", company.id)
    .in("id", ownedIds)
    .select("id");

  if (error || !data?.length || data.length !== ownedIds.length) {
    return {
      ok: false,
      error: error?.message || "Unable to delete products. Please try again.",
    };
  }

  revalidateProductSurfaces(company.slug);
  return { ok: true, deletedIds: data.map((row) => row.id as string) };
}

export async function deleteProduct(
  companySlug: string,
  productId: string
): Promise<ActionResult> {
  const result = await deleteProducts(companySlug, [productId]);
  if (!result.ok) return result;
  if (!result.deletedIds.length) {
    return { ok: false, error: "Unable to delete product. Please try again." };
  }
  return { ok: true };
}

export async function publishProduct(
  companySlug: string,
  productId: string
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff cannot change product status." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("products")
    .update({ status: "published" })
    .eq("id", productId)
    .eq("company_id", company.id)
    .select("id");

  if (error || !data?.length) {
    return { ok: false, error: error?.message || "Failed to update status." };
  }

  revalidateProductSurfaces(company.slug);
  return { ok: true };
}
