import { createClient } from "@/lib/supabase/server";
import type { MediaAsset } from "@/lib/admin/types-media";
import { MEDIA_SELECT } from "@/lib/admin/types-media";

export async function listMediaAssets(
  companyId: string
): Promise<MediaAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as MediaAsset[]) ?? [];
}

export async function getMediaAsset(
  companyId: string,
  mediaId: string
): Promise<MediaAsset | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_SELECT)
    .eq("company_id", companyId)
    .eq("id", mediaId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MediaAsset;
}

/**
 * Find where a Cloudinary public_id is referenced so we can block unsafe deletes.
 */
export async function findMediaUsage(
  companyId: string,
  publicId: string,
  secureUrl: string
): Promise<string[]> {
  const supabase = await createClient();
  const reasons: string[] = [];

  const { data: products } = await supabase
    .from("products")
    .select("id, name, image_public_id, image_url")
    .eq("company_id", companyId);

  const productHits =
    products?.filter(
      (p) =>
        p.image_public_id === publicId ||
        p.image_url === secureUrl
    ) ?? [];

  if (productHits.length) {
    reasons.push(
      `Product${productHits.length > 1 ? "s" : ""}: ${productHits
        .map((p) => p.name)
        .slice(0, 3)
        .join(", ")}`
    );
  }

  const { data: content } = await supabase
    .from("website_content")
    .select("id, page_key, section_key, content")
    .eq("company_id", companyId);

  const contentHits =
    content?.filter((row) => {
      const raw = JSON.stringify(row.content ?? {});
      return raw.includes(publicId) || raw.includes(secureUrl);
    }) ?? [];

  if (contentHits.length) {
    reasons.push(
      `Website content: ${contentHits
        .map((c) => `${c.page_key}/${c.section_key}`)
        .slice(0, 3)
        .join(", ")}`
    );
  }

  const { data: settings } = await supabase
    .from("company_settings")
    .select("settings")
    .eq("company_id", companyId)
    .maybeSingle();

  if (settings?.settings) {
    const raw = JSON.stringify(settings.settings);
    if (raw.includes(publicId) || raw.includes(secureUrl)) {
      reasons.push("Company settings");
    }
  }

  return reasons;
}
