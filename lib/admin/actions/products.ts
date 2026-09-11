"use server";

import { revalidatePublicLater } from "@/lib/admin/revalidate-public";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { slugify } from "@/lib/admin/slugify";
import {
  defaultProductCurrency,
  isProductCurrency,
} from "@/lib/admin/product-currencies";
import {
  orderColorsForPrimary,
  parseColorDrafts,
  parseSizeNames,
  replaceProductVariants,
  type ColorDraft,
  type SavedProductColor,
} from "@/lib/admin/actions/product-variants";
import { validateProductDiscount } from "@/lib/catalog/pricing";
import type { ActionResult, BulkDeleteResult } from "@/lib/admin/types-catalog";
import { MAX_BULK_DELETE, uniqueValidIds } from "@/lib/admin/ids";
import {
  formatSupabaseError,
  isForeignKeyError,
  isMissingColumnError,
} from "@/lib/admin/supabase-error";
import type { SupabaseClient } from "@supabase/supabase-js";

function friendlyProductError(
  error: { code?: string; message?: string } | null,
  fallback: string,
  operation = "saveProduct"
): string {
  if (!error) return fallback;
  if (error.code === "23505") {
    return "A product with this URL slug already exists. Choose a different slug.";
  }
  return formatSupabaseError(operation, error, fallback);
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

function logDbError(
  operation: string,
  error: { code?: string; message?: string } | null,
  meta: Record<string, string | null | undefined>
) {
  console.error(`[${operation}]`, {
    code: error?.code ?? null,
    message: error?.message ?? null,
    ...meta,
  });
}

function resolvePrimaryColor(
  colors: ColorDraft[],
  saved: SavedProductColor[],
  primaryLibraryId: string
): { ok: true; primary: SavedProductColor | null } | { ok: false; error: string } {
  if (!saved.length) {
    if (primaryLibraryId) {
      return { ok: false, error: "Primary color must be one of the product colors." };
    }
    return { ok: true, primary: null };
  }
  if (primaryLibraryId && !colors.some((c) => c.color_id === primaryLibraryId)) {
    return {
      ok: false,
      error: "Primary color must be one of the product colors.",
    };
  }
  const primary =
    saved.find((row) => row.color_id === primaryLibraryId) ?? saved[0] ?? null;
  return { ok: true, primary };
}

async function persistPrimaryAppearance(
  supabase: SupabaseClient,
  opts: {
    productId: string;
    companyId: string;
    primary: SavedProductColor | null;
    fallbackUrl: string | null;
    fallbackPublicId: string | null;
  }
): Promise<ActionResult> {
  const imageUrl = opts.primary?.image_url || opts.fallbackUrl;
  const imagePublicId = opts.primary?.image_url
    ? opts.primary.image_public_id
    : opts.fallbackPublicId;
  const libraryColorId = opts.primary?.color_id ?? null;
  const variantId = opts.primary?.id ?? null;

  const basePatch: Record<string, unknown> = {
    image_url: imageUrl,
    image_public_id: imagePublicId,
    status: "published",
  };

  async function apply(patch: Record<string, unknown>) {
    return supabase
      .from("products")
      .update(patch)
      .eq("id", opts.productId)
      .eq("company_id", opts.companyId);
  }

  let patch: Record<string, unknown> = libraryColorId
    ? { ...basePatch, primary_color_id: libraryColorId }
    : { ...basePatch, primary_color_id: null };

  let { error } = await apply(patch);

  if (error && isForeignKeyError(error) && variantId) {
    logDbError("persistPrimaryAppearance", error, {
      productId: opts.productId,
      companyId: opts.companyId,
      note: "library_color_fk_failed_retry_variant_id",
      variantId,
      libraryColorId,
    });
    patch = { ...basePatch, primary_color_id: variantId };
    ({ error } = await apply(patch));
  }

  if (error && isMissingColumnError(error, "primary_color_id")) {
    logDbError("persistPrimaryAppearance", error, {
      productId: opts.productId,
      companyId: opts.companyId,
      note: "primary_color_id_column_missing_retry_image_only",
    });
    ({ error } = await apply(basePatch));
  }

  if (error) {
    logDbError("persistPrimaryAppearance", error, {
      productId: opts.productId,
      companyId: opts.companyId,
      variantId,
      libraryColorId,
    });
    return {
      ok: false,
      error: friendlyProductError(
        error,
        "The primary color could not be stored.",
        "persistPrimaryAppearance"
      ),
    };
  }

  return { ok: true };
}

function revalidateProductSurfaces(companySlug: string) {
  revalidatePublicLater([
    `/companies/${companySlug}`,
    `/api/public/catalog/${companySlug}`,
    `/admin/companies/${companySlug}/products`,
  ]);
}

async function rollbackCreatedProduct(
  supabase: SupabaseClient,
  productId: string,
  companyId: string
) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("company_id", companyId);
  if (error) {
    logDbError("createProduct.rollback", error, { productId, companyId });
  }
}

async function assertPublishedProduct(
  supabase: SupabaseClient,
  productId: string,
  companyId: string
): Promise<ActionResult> {
  const { data, error } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .eq("company_id", companyId)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data?.id) {
    logDbError("assertPublishedProduct", error, { productId, companyId });
    return {
      ok: false,
      error: friendlyProductError(
        error,
        "The product was saved but is not queryable as published.",
        "assertPublishedProduct"
      ),
    };
  }
  return { ok: true };
}

async function insertProductRow(
  supabase: SupabaseClient,
  row: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const first = await supabase.from("products").insert(row).select("id").single();
  if (!first.error && first.data?.id) return { id: first.data.id as string };

  if (
    first.error &&
    (isMissingColumnError(first.error, "discount_type") ||
      isMissingColumnError(first.error, "discount_value"))
  ) {
    const retryRow = { ...row };
    delete retryRow.discount_type;
    delete retryRow.discount_value;
    const retry = await supabase.from("products").insert(retryRow).select("id").single();
    if (!retry.error && retry.data?.id) return { id: retry.data.id as string };
    logDbError("createProduct.insert", retry.error, {});
    return {
      error: friendlyProductError(
        retry.error,
        "Unable to create product. Please try again.",
        "createProduct.insert"
      ),
    };
  }

  logDbError("createProduct.insert", first.error, {});
  return {
    error: friendlyProductError(
      first.error,
      "Unable to create product. Please try again.",
      "createProduct.insert"
    ),
  };
}

async function updateProductRow(
  supabase: SupabaseClient,
  productId: string,
  companyId: string,
  row: Record<string, unknown>
): Promise<ActionResult> {
  const first = await supabase
    .from("products")
    .update(row)
    .eq("id", productId)
    .eq("company_id", companyId);
  if (!first.error) return { ok: true };

  if (
    isMissingColumnError(first.error, "discount_type") ||
    isMissingColumnError(first.error, "discount_value") ||
    isMissingColumnError(first.error, "primary_color_id")
  ) {
    const retryRow = { ...row };
    if (isMissingColumnError(first.error, "discount_type") || isMissingColumnError(first.error, "discount_value")) {
      delete retryRow.discount_type;
      delete retryRow.discount_value;
    }
    if (isMissingColumnError(first.error, "primary_color_id")) {
      delete retryRow.primary_color_id;
    }
    const retry = await supabase
      .from("products")
      .update(retryRow)
      .eq("id", productId)
      .eq("company_id", companyId);
    if (!retry.error) return { ok: true };
    logDbError("updateProduct", retry.error, { productId, companyId });
    return {
      ok: false,
      error: friendlyProductError(
        retry.error,
        "Unable to update product. Please try again.",
        "updateProduct"
      ),
    };
  }

  logDbError("updateProduct", first.error, { productId, companyId });
  return {
    ok: false,
    error: friendlyProductError(
      first.error,
      "Unable to update product. Please try again.",
      "updateProduct"
    ),
  };
}

async function resolveChildCategory(
  supabase: SupabaseClient,
  opts: {
    companyId: string;
    parentCategoryId: string;
    categoryId: string;
  }
): Promise<
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
      discount_type: "none" | "percent" | "fixed";
      discount_value: number;
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

  const discount = validateProductDiscount(
    price,
    str(formData, "discount_type"),
    str(formData, "discount_value")
  );
  if (!discount.ok) return discount;

  const slug = slugify(str(formData, "slug") || name) || slugify(`product-${Date.now()}`);
  if (!slug) return { ok: false, error: "A valid URL slug is required." };

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
    discount_type: discount.discount.type,
    discount_value: discount.discount.value,
  };
}

export async function createProduct(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const started = Date.now();
  const { admin, company } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view products but cannot create them." };
  }

  const fields = readProductFields(formData, company.slug);
  if (!fields.ok) return fields;

  const supabase = await createClient();
  const category = await resolveChildCategory(supabase, {
    companyId: company.id,
    parentCategoryId: fields.parentCategoryId,
    categoryId: fields.categoryId,
  });
  if (!category.ok) return category;

  const colors = parseColorDrafts(str(formData, "colors_json"));
  if ("error" in colors) return { ok: false, error: colors.error };
  const sizeNames = parseSizeNames(str(formData, "sizes_json"));
  if ("error" in sizeNames) return { ok: false, error: sizeNames.error };
  const primaryLibraryId = str(formData, "primary_color_id");
  const orderedColors = orderColorsForPrimary(colors, primaryLibraryId);

  const inserted = await insertProductRow(supabase, {
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
    discount_type: fields.discount_type,
    discount_value: fields.discount_value,
  });
  if ("error" in inserted) return { ok: false, error: inserted.error };

  const productId = inserted.id;
  const variants = await replaceProductVariants(
    supabase,
    productId,
    orderedColors,
    sizeNames,
    primaryLibraryId
  );
  if (!variants.ok) {
    await rollbackCreatedProduct(supabase, productId, company.id);
    return variants;
  }

  const primary = resolvePrimaryColor(orderedColors, variants.saved, primaryLibraryId);
  if (!primary.ok) {
    await rollbackCreatedProduct(supabase, productId, company.id);
    return primary;
  }
  const appearance = await persistPrimaryAppearance(supabase, {
    productId,
    companyId: company.id,
    primary: primary.primary,
    fallbackUrl: fields.image_url,
    fallbackPublicId: fields.image_public_id,
  });
  if (!appearance.ok) {
    await rollbackCreatedProduct(supabase, productId, company.id);
    return appearance;
  }

  const visible = await assertPublishedProduct(supabase, productId, company.id);
  if (!visible.ok) {
    await rollbackCreatedProduct(supabase, productId, company.id);
    return visible;
  }

  console.info("[createProduct]", {
    productId,
    companyId: company.id,
    ms: Date.now() - started,
  });
  revalidateProductSurfaces(company.slug);
  return { ok: true, id: productId };
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

  const supabase = await createClient();
  const category = await resolveChildCategory(supabase, {
    companyId: company.id,
    parentCategoryId: fields.parentCategoryId,
    categoryId: fields.categoryId,
  });
  if (!category.ok) return category;

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (existingError || !existing) {
    return { ok: false, error: "Product was not found for this company." };
  }

  const colors = parseColorDrafts(str(formData, "colors_json"));
  if ("error" in colors) return { ok: false, error: colors.error };
  const sizeNames = parseSizeNames(str(formData, "sizes_json"));
  if ("error" in sizeNames) return { ok: false, error: sizeNames.error };
  const primaryLibraryId = str(formData, "primary_color_id");
  const orderedColors = orderColorsForPrimary(colors, primaryLibraryId);

  const variants = await replaceProductVariants(
    supabase,
    productId,
    orderedColors,
    sizeNames,
    primaryLibraryId
  );
  if (!variants.ok) return variants;

  const primary = resolvePrimaryColor(orderedColors, variants.saved, primaryLibraryId);
  if (!primary.ok) return primary;

  const appearance = await persistPrimaryAppearance(supabase, {
    productId,
    companyId: company.id,
    primary: primary.primary,
    fallbackUrl: fields.image_url,
    fallbackPublicId: fields.image_public_id,
  });
  if (!appearance.ok) return appearance;

  const imageUrl = primary.primary?.image_url || fields.image_url;
  const imagePublicId = primary.primary?.image_url
    ? primary.primary.image_public_id
    : fields.image_public_id;

  const updated = await updateProductRow(supabase, productId, company.id, {
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
    image_url: imageUrl,
    image_public_id: imagePublicId,
    status: "published",
    featured: fields.featured,
    sort_order: fields.sort_order,
    discount_type: fields.discount_type,
    discount_value: fields.discount_value,
  });
  if (!updated.ok) return updated;

  const visible = await assertPublishedProduct(supabase, productId, company.id);
  if (!visible.ok) return visible;

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
  const { error } = await supabase
    .from("products")
    .update({ status: "published" })
    .eq("id", productId)
    .eq("company_id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update status." };
  }

  revalidateProductSurfaces(company.slug);
  return { ok: true };
}
