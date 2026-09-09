import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { CmsPageContent, CmsSectionRecord } from "@/lib/cms/types";

export type ContentFetchMode = "published" | "preview";

/**
 * Load CMS sections for a company page.
 * Public site uses published only. Admin preview loads all sections (including draft).
 */
export async function getPageContent(
  companyId: string,
  pageKey: string,
  mode: ContentFetchMode = "published"
): Promise<CmsPageContent> {
  if (!isSupabaseConfigured()) return {};

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_content")
    .select("section_key, content, status, sort_order, updated_at")
    .eq("company_id", companyId)
    .eq("page_key", pageKey)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return {};

  const result: CmsPageContent = {};

  for (const row of data) {
    const section: CmsSectionRecord = {
      section_key: row.section_key,
      content: (row.content as Record<string, unknown>) ?? {},
      status: row.status as "draft" | "published",
      sort_order: row.sort_order ?? 0,
      updated_at: row.updated_at,
    };

    if (mode === "published" && section.status !== "published") continue;
    result[row.section_key] = section;
  }

  return result;
}

export async function getCompanyIdBySlug(
  slug: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}
