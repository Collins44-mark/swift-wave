import { NextResponse } from "next/server";
import {
  getCompanyIdBySlug,
  getPageContent,
} from "@/lib/cms/get-page-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scope: string; pageKey: string }> }
) {
  const { scope, pageKey } = await params;
  const companyId = await getCompanyIdBySlug(scope);

  if (!companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sections = await getPageContent(companyId, pageKey, "published");

  const payload: Record<string, Record<string, unknown>> = {};
  for (const [key, section] of Object.entries(sections)) {
    payload[key] = section.content;
  }

  return NextResponse.json({
    scope,
    pageKey,
    sections: payload,
  });
}
