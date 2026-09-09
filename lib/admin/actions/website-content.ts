"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { publicPathForPage } from "@/lib/cms/resolve-scope";
import { getCmsScope } from "@/lib/cms/schemas";
import type { ActionResult } from "@/lib/admin/types-catalog";
import type { ContentStatus } from "@/lib/admin/types-catalog";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseContentJson(formData: FormData): Record<string, unknown> {
  const raw = str(formData, "content_json");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function buildContentFromForm(formData: FormData): Record<string, unknown> {
  const fromJson = parseContentJson(formData);
  if (Object.keys(fromJson).length) return fromJson;

  const content: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_")) {
      content[key.replace(/^field_/, "")] = String(value).trim();
    }
  }
  const imgUrl = str(formData, "image_url");
  const imgId = str(formData, "image_public_id");
  if (imgUrl) content.image_url = imgUrl;
  if (imgId) content.image_public_id = imgId;
  return content;
}

function revalidatePublicPaths(
  companySlug: string,
  pageKey: string
): void {
  const scope = getCmsScope(companySlug);
  const isCorporate = scope?.isCorporate ?? companySlug === "corporate";
  const path = publicPathForPage(pageKey, isCorporate);
  revalidatePath(path);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/companies");
  revalidatePath("/global");
  revalidatePath("/contact");
  revalidatePath(`/companies/${pageKey}`);
}

export async function upsertWebsiteSection(
  companySlug: string,
  formData: FormData,
  publishStatus: ContentStatus = "published"
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "website_content"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view website content but cannot edit it.",
    };
  }

  const pageKey = str(formData, "page_key") || companySlug;
  const sectionKey = str(formData, "section_key") || "hero";
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const rawJson = str(formData, "content_json");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("website_content")
    .select("id, content")
    .eq("company_id", company.id)
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .maybeSingle();

  let content: Record<string, unknown>;
  if (rawJson) {
    try {
      content = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "Invalid content data." };
    }
  } else {
    const incoming = buildContentFromForm(formData);
    const prior = (existing?.content ?? {}) as Record<string, unknown>;
    content = { ...prior, ...incoming };
  }

  const payload = {
    content,
    status: publishStatus,
    sort_order: sortOrder,
    updated_by: admin.user.id,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("website_content")
      .update(payload)
      .eq("id", existing.id)
      .eq("company_id", company.id);

    if (error) {
      return { ok: false, error: error.message || "Failed to update content." };
    }
  } else {
    const { error } = await supabase.from("website_content").insert({
      company_id: company.id,
      page_key: pageKey,
      section_key: sectionKey,
      ...payload,
    });

    if (error) {
      return { ok: false, error: error.message || "Failed to create content." };
    }
  }

  if (publishStatus === "published") {
    revalidatePublicPaths(companySlug, pageKey);
  }

  revalidatePath(`/admin/companies/${companySlug}/website-content`);
  revalidatePath(
    `/admin/website-content/corporate/${pageKey}`
  );
  return { ok: true };
}

export async function saveWebsiteSectionDraft(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  return upsertWebsiteSection(companySlug, formData, "draft");
}

export async function publishWebsiteSection(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  return upsertWebsiteSection(companySlug, formData, "published");
}
