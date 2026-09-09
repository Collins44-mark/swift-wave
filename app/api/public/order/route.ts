import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OrderItemInput = {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
};

type OrderBody = {
  company_slug?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_location?: string;
  customer_email?: string;
  notes?: string;
  currency?: string;
  items?: OrderItemInput[];
};

export async function POST(request: Request) {
  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const companySlug = String(body.company_slug ?? "").trim();
  const customerName = String(body.customer_name ?? "").trim();
  const customerPhone = String(body.customer_phone ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!companySlug || !customerName || !customerPhone || items.length === 0) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_website_order", {
    p_company_slug: companySlug,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_items: items.map((item) => ({
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    p_customer_location: body.customer_location || null,
    p_customer_email: body.customer_email || null,
    p_notes: body.notes || null,
    p_currency: body.currency || "TZS",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "order_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data });
}
