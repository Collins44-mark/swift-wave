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
    const priceNum =
      p.price != null && Number(p.price) > 0 ? Number(p.price) : 0;
    const priceLabel =
      p.price_label ||
      (priceNum > 0
        ? `${p.currency} ${priceNum.toLocaleString("en-US")}`
        : "Enquire");

    return {
      id: p.slug,
      dbId: p.id,
      title: p.name,
      category: cat?.name ?? "All",
      sub: p.subcategory ?? "",
      price: priceLabel,
      priceNum,
      rating: p.rating ?? "",
      image: p.image_url ?? "",
      desc: p.description ?? "",
      bullets: Array.isArray(p.bullets) ? p.bullets : [],
    };
  });

  return NextResponse.json({
    company: {
      name: company.name,
      slug: company.slug,
      whatsapp_number: normalizeWhatsAppNumber(company.whatsapp_number),
    },
    categories: categoryMap,
    products: mappedProducts,
  });
}
