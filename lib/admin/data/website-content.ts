import { createClient } from "@/lib/supabase/server";
import {
  WEBSITE_CONTENT_SELECT,
  type WebsiteContent,
} from "@/lib/admin/types-catalog";

export async function getWebsiteSection(
  companyId: string,
  pageKey: string,
  sectionKey: string
): Promise<WebsiteContent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_content")
    .select(WEBSITE_CONTENT_SELECT)
    .eq("company_id", companyId)
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (error || !data) return null;
  return data as WebsiteContent;
}

export async function getWebsitePageSections(
  companyId: string,
  pageKey: string
): Promise<WebsiteContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_content")
    .select(WEBSITE_CONTENT_SELECT)
    .eq("company_id", companyId)
    .eq("page_key", pageKey)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as WebsiteContent[];
}
