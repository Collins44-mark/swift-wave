import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  SUBJECT_LABELS,
  contactKind,
  resolveContactCompanySlug,
  validateContactField,
} from "@/lib/contact/validate";

export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  contact?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const subject = String(body.subject ?? "general").trim() || "general";
  const message = String(body.message ?? "").trim();

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!validateContactField(contact)) {
    return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const companySlug = resolveContactCompanySlug(subject);
  const payload = {
    subject,
    subject_label: SUBJECT_LABELS[subject] ?? subject,
    message,
    contact_kind: contactKind(contact),
    source_page: "contact",
  };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_website_inquiry", {
    p_company_slug: companySlug,
    p_inquiry_type: "general",
    p_customer_name: name,
    p_customer_phone: contact,
    p_payload: payload,
  });

  if (error) {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data });
}
