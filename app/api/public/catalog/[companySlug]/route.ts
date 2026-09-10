import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/normalize";
import { normalizeCompanySlug } from "@/lib/admin/company-slug";

export const dynamic = "force-dynamic";

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

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, sort_order, is_active")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id, name, slug, description, price, currency, image_url, subcategory, bullets, rating, price_label, sort_order, category_id, status"
      )
      .eq("company_id", company.id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
  ]);

  const cats = categories ?? [];
  const byId = new Map(cats.map((c) => [c.id, c]));
  const productIds = (products ?? []).map((p) => p.id);

  const [{ data: colorRows }, { data: sizeRows }] = productIds.length
    ? await Promise.all([
        supabase
          .from("product_colors")
          .select("id, product_id, name, hex_code, image_url, sort_order, is_active")
          .in("product_id", productIds)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("product_sizes")
          .select("id, product_id, sort_order, is_active, size:sizes(id, name)")
          .in("product_id", productIds)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }];

  const colorsByProduct = new Map<
    string,
    { id: string; name: string; hex_code: string | null; image_url: string | null }[]
  >();
  for (const row of colorRows ?? []) {
    const list = colorsByProduct.get(row.product_id) ?? [];
    list.push(row);
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

  // Build CATEGORIES-like map: parent name -> subcategory names
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

  const mappedProducts = (products ?? []).map((p) => {
    const cat = p.category_id ? byId.get(p.category_id) : null;
    const parent = cat?.parent_id ? byId.get(cat.parent_id) : null;
    const categoryName = parent?.name ?? cat?.name ?? "All";
    const subName = parent ? cat?.name ?? "" : p.subcategory ?? "";
    const currency = (p.currency || "").trim() || "TZS";
    const priceNum =
      p.price != null && Number(p.price) > 0 ? Number(p.price) : 0;
    const priceLabel =
      p.price_label ||
      (priceNum > 0
        ? `${currency} ${priceNum.toLocaleString("en-US")}`
        : "Enquire");
    const colors = (colorsByProduct.get(p.id) ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex_code || "#111111",
      image: c.image_url || p.image_url || "",
    }));
    const sizes = (sizesByProduct.get(p.id) ?? []).map((s) => ({
      id: s.id,
      name: s.name,
    }));
    const cover = colors.find((c) => c.image)?.image || p.image_url || "";

    return {
      id: p.slug,
      dbId: p.id,
      title: p.name,
      category: categoryName,
      sub: subName,
      currency,
      price: priceLabel,
      priceNum,
      rating: p.rating ?? "",
      image: cover,
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
