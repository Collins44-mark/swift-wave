"use server";

import { revalidatePublicLater } from "@/lib/admin/revalidate-public";
import { createClient } from "@/lib/supabase/server";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { publicPathForPage } from "@/lib/cms/resolve-scope";
import { getHeroPage } from "@/lib/cms/hero-pages";
import type { ActionResult } from "@/lib/admin/types-catalog";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidateHeroPaths(
  pageKey: string,
  isCorporate: boolean
): void {
  const paths = [publicPathForPage(pageKey, isCorporate)];
  if (isCorporate) {
    paths.push("/", "/about", "/companies", "/global", "/contact");
  } else {
    paths.push(`/companies/${pageKey}`);
  }
  revalidatePublicLater(paths);
}

/**
 * Update only hero image fields, merging into existing hero section content.
 */
export async function updateHeroImage(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "website_content"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view website content but cannot edit hero images.",
    };
  }

  const pageKey = str(formData, "page_key");
  const imageUrl = str(formData, "image_url");
  const imagePublicId = str(formData, "image_public_id");
  const altText = str(formData, "alt_text") || null;

  if (!pageKey) {
    return { ok: false, error: "Page is required." };
  }
  if (!imageUrl) {
    return { ok: false, error: "Please upload or select a hero image." };
  }

  const heroDef = getHeroPage(companySlug, pageKey);
  if (!heroDef) {
    return { ok: false, error: "This page does not have a hero section." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("website_content")
    .select("id, content")
    .eq("company_id", company.id)
    .eq("page_key", pageKey)
    .eq("section_key", "hero")
    .maybeSingle();

  const prior = (existing?.content ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = {
    ...prior,
    image_url: imageUrl,
    image_public_id: imagePublicId || null,
    alt_text: altText,
  };

  const payload = {
    content: merged,
    status: "published" as const,
    updated_by: admin.user.id,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("website_content")
      .update(payload)
      .eq("id", existing.id)
      .eq("company_id", company.id);
    if (error) {
      return {
        ok: false,
        error: "Unable to update hero image. Please try again.",
      };
    }
  } else {
    const { error } = await supabase.from("website_content").insert({
      company_id: company.id,
      page_key: pageKey,
      section_key: "hero",
      sort_order: 1,
      ...payload,
    });
    if (error) {
      return {
        ok: false,
        error: "Unable to update hero image. Please try again.",
      };
    }
  }

  revalidateHeroPaths(pageKey, heroDef.isCorporate);
  return { ok: true };
}
