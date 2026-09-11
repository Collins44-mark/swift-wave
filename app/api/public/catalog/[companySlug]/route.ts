import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/normalize";
import { normalizeCompanySlug } from "@/lib/admin/company-slug";
import { isLightHex, resolvedSwatchHex } from "@/lib/catalog/color-display";
import {
  applyProductDiscount,
  discountLabel,
  formatMoneyAmount,
} from "@/lib/catalog/pricing";
import { isMissingColumnError } from "@/lib/admin/supabase-error";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PRODUCT_CORE =
  "id, name, slug, description, price, currency, image_url, subcategory, bullets, rating, price_label, sort_order, category_id, status";
const PRODUCT_FULL = `${PRODUCT_CORE}, primary_color_id, discount_type, discount_value`;
const COLOR_CORE =
  "id, product_id, name, hex_code, image_url, sort_order, is_active, color_id, color:colors(name, hex_code)";
const COLOR_FULL = `${COLOR_CORE}, is_primary`;

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  subcategory: string | null;
  bullets: unknown;
  rating: string | null;
  price_label: string | null;
  sort_order: number | null;
  category_id: string | null;
  status: string;
  primary_color_id?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
};

async function loadPublishedProducts(
  supabase: SupabaseClient,
  companyId: string
): Promise<{ data: CatalogProduct[]; error: { code?: string; message?: string } | null }> {
  const full = await supabase
    .from("products")
    .select(PRODUCT_FULL)
    .eq("company_id", companyId)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (!full.error) {
    return { data: (full.data as CatalogProduct[]) ?? [], error: null };
  }
  console.error("[catalog.products]", {
    code: full.error.code,
    message: full.error.message,
    companyId,
  });
  if (
    isMissingColumnError(full.error, "primary_color_id") ||
    isMissingColumnError(full.error, "discount_type") ||
    isMissingColumnError(full.error, "discount_value")
  ) {
    const core = await supabase
      .from("products")
      .select(PRODUCT_CORE)
      .eq("company_id", companyId)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (core.error) {
      console.error("[catalog.products.core]", {
        code: core.error.code,
        message: core.error.message,
        companyId,
      });
    }
    return {
      data: (core.data as CatalogProduct[]) ?? [],
      error: core.error,
    };
  }
  return { data: [], error: full.error };
}

async function loadProductColors(
  supabase: SupabaseClient,
  productIds: string[]
) {
  const full = await supabase
    .from("product_colors")
    .select(COLOR_FULL)
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (!full.error) return full.data ?? [];
  console.error("[catalog.product_colors]", {
    code: full.error.code,
    message: full.error.message,
  });
  if (isMissingColumnError(full.error, "is_primary") || isMissingColumnError(full.error, "color_id")) {
    const core = await supabase
      .from("product_colors")
      .select(
        "id, product_id, name, hex_code, image_url, sort_order, is_active, color:colors(name, hex_code)"
      )
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return core.data ?? [];
  }
  return [];
}

/**
 * GET published catalog for outfit/medical storefronts.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ companySlug: string }> }
) {
  const companySlug = normalizeCompanySlug((await context.params).companySlug);
  const allowed = new Set(["outfit", "medical"]);
  if (!allowed.has(companySlug)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = await createClient();

  const { data: companyRows, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, whatsapp_number, is_active")
    .eq("slug", companySlug)
    .eq("is_active", true)
    .limit(1);

  const company = companyRows?.[0] ?? null;

  if (companyError || !company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [{ data: categories }, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, sort_order, is_active")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    loadPublishedProducts(supabase, company.id),
  ]);

  if (productsResult.error) {
    return NextResponse.json(
      {
        error: "catalog_unavailable",
        message: productsResult.error.message,
        code: productsResult.error.code ?? null,
      },
      { status: 500 }
    );
  }

  const cats = categories ?? [];
  const byId = new Map(cats.map((c) => [c.id, c]));
  const products = productsResult.data;
  const productIds = products.map((p) => p.id);

  const [{ data: sizeRows }, colorRows] = productIds.length
    ? await Promise.all([
        supabase
          .from("product_sizes")
          .select("id, product_id, sort_order, is_active, size:sizes(id, name)")
          .in("product_id", productIds)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        loadProductColors(supabase, productIds),
      ])
    : [{ data: [] }, [] as Awaited<ReturnType<typeof loadProductColors>>];

  const colorsByProduct = new Map<
    string,
    {
      id: string;
      libraryColorId: string | null;
      name: string;
      hex_code: string | null;
      image_url: string | null;
      isPrimary: boolean;
    }[]
  >();
  for (const row of colorRows) {
    const nested = (row as { color?: unknown }).color as
      | { name: string; hex_code: string | null }
      | { name: string; hex_code: string | null }[]
      | null;
    const lib = Array.isArray(nested) ? nested[0] : nested;
    const list = colorsByProduct.get(row.product_id) ?? [];
    list.push({
      id: row.id,
      libraryColorId: ((row as { color_id?: string | null }).color_id as string | null) ?? null,
      name: lib?.name || row.name,
      hex_code: lib?.hex_code ?? row.hex_code,
      image_url: row.image_url,
      isPrimary: Boolean((row as { is_primary?: boolean }).is_primary),
    });
    colorsByProduct.set(row.product_id, list);
  }

  const sizesByProduct = new Map<string, { id: string; name: string }[]>();
  for (const row of sizeRows ?? []) {
    const nested = row.size as
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
    const size = Array.isArray(nested) ? nested[0] : nested;
    if (!size?.id) continue;
    const list = sizesByProduct.get(row.product_id) ?? [];
    list.push({ id: size.id, name: size.name });
    sizesByProduct.set(row.product_id, list);
  }

  const categoryMap: Record<string, string[]> = { All: [] };
  for (const c of cats) {
    if (!c.parent_id) {
      if (!categoryMap[c.name]) categoryMap[c.name] = [];
    }
  }
  for (const c of cats) {
    if (c.parent_id) {
      const parent = byId.get(c.parent_id);
      if (parent) {
        if (!categoryMap[parent.name]) categoryMap[parent.name] = [];
        categoryMap[parent.name].push(c.name);
      }
    }
  }

  const mappedProducts = products.map((p) => {
    const cat = p.category_id ? byId.get(p.category_id) : null;
    const parent = cat?.parent_id ? byId.get(cat.parent_id) : null;
    const categoryName = parent?.name ?? cat?.name ?? "All";
    const subName = parent ? cat?.name ?? "" : p.subcategory ?? "";
    const currency = (p.currency || "").trim() || "TZS";
    const originalPrice =
      p.price != null && Number(p.price) > 0 ? Number(p.price) : 0;
    const pricing = applyProductDiscount(
      originalPrice,
      p.discount_type,
      p.discount_value
    );
    const salePrice = pricing.sale;
    const offLabel = discountLabel(pricing, currency);
    const priceLabel = offLabel
      ? formatMoneyAmount(currency, salePrice)
      : p.price_label ||
        (salePrice > 0 ? formatMoneyAmount(currency, salePrice) : "Enquire");
    const colors = (colorsByProduct.get(p.id) ?? []).map((c) => {
      const hex = resolvedSwatchHex(c.hex_code);
      return {
        id: c.id,
        libraryColorId: c.libraryColorId,
        name: c.name,
        hex,
        light: isLightHex(hex),
        image: c.image_url || "",
        isPrimary: c.isPrimary,
      };
    });
    const sizes = (sizesByProduct.get(p.id) ?? []).map((s) => ({
      id: s.id,
      name: s.name,
    }));
    const primary =
      colors.find((c) => c.isPrimary) ||
      colors.find((c) => c.libraryColorId && c.libraryColorId === p.primary_color_id) ||
      colors.find((c) => c.id === p.primary_color_id) ||
      colors.find((c) => c.image) ||
      colors[0] ||
      null;
    const cover = primary?.image || p.image_url || "";

    return {
      id: p.slug,
      dbId: p.id,
      title: p.name,
      category: categoryName,
      sub: subName,
      currency,
      price: priceLabel,
      priceNum: salePrice,
      comparePriceNum: offLabel ? pricing.original : null,
      comparePrice: offLabel ? formatMoneyAmount(currency, pricing.original) : null,
      discountLabel: offLabel,
      discountAmount: offLabel ? pricing.discountAmount : 0,
      rating: p.rating ?? "",
      image: cover,
      primaryColorId: primary?.id ?? null,
      desc: p.description ?? "",
      bullets: Array.isArray(p.bullets) ? p.bullets : [],
      colors,
      sizes,
    };
  });

  return NextResponse.json(
    {
      company: {
        name: company.name,
        slug: company.slug,
        whatsapp_number: normalizeWhatsAppNumber(company.whatsapp_number),
      },
      categories: categoryMap,
      products: mappedProducts,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
