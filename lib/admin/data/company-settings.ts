import { createClient } from "@/lib/supabase/server";
import type { CompanySettings } from "@/lib/admin/types-catalog";

export async function getCompanySettings(
  companyId: string
): Promise<CompanySettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("id, company_id, settings, created_at, updated_at")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error || !data) return null;
  return data as CompanySettings;
}
