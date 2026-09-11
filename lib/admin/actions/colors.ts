"use server";

import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { normalizeHex, resolvedSwatchHex } from "@/lib/catalog/color-display";

export async function createLibraryColor(
  companySlug: string,
  name: string,
  hexCode: string
): Promise<
  | { ok: true; id: string; name: string; hex_code: string | null }
  | { ok: false; error: string }
> {
  const { admin } = await requireCompanyAccess(companySlug, "products");
  if (!canMutate(admin)) {
    return { ok: false, error: "You do not have permission to add colors." };
  }

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Color name is required." };
  const hex = normalizeHex(hexCode);
  if (!hex) return { ok: false, error: "Choose a color value for the swatch." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("colors")
    .select("id, name, hex_code")
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const existingHex = resolvedSwatchHex(existing.hex_code as string | null);
    if (!existingHex) {
      await supabase
        .from("colors")
        .update({ hex_code: hex })
        .eq("id", existing.id);
    }
    return {
      ok: true,
      id: existing.id as string,
      name: existing.name as string,
      hex_code: existingHex ?? hex,
    };
  }

  const { data: maxRow } = await supabase
    .from("colors")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("colors")
    .insert({
      name: trimmed,
      hex_code: hex,
      is_active: true,
      sort_order: (Number(maxRow?.sort_order) || 0) + 10,
    })
    .select("id, name, hex_code")
    .single();

  if (error || !data?.id) {
    return { ok: false, error: error?.message || "Unable to save color." };
  }

  return {
    ok: true,
    id: data.id as string,
    name: data.name as string,
    hex_code: normalizeHex(data.hex_code as string | null) ?? hex,
  };
}
