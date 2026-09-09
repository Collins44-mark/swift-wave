import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type InquiryBody = {
  company_slug?: string;
  inquiry_type?: string;
  customer_name?: string;
  customer_phone?: string;
  payload?: Record<string, unknown>;
};

const ALLOWED_TYPES = new Set([
  "scholarship_application",
  "freight_booking",
  "general",
]);

export async function POST(request: Request) {
  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const companySlug = String(body.company_slug ?? "").trim();
  const inquiryType = String(body.inquiry_type ?? "").trim();
  const customerName = String(body.customer_name ?? "").trim();
  const customerPhone = String(body.customer_phone ?? "").trim();

  if (!companySlug || !customerName || !customerPhone) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(inquiryType)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_website_inquiry", {
    p_company_slug: companySlug,
    p_inquiry_type: inquiryType,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_payload: body.payload ?? {},
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "insert_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data });
}
