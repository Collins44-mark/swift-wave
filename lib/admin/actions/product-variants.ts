import type { SupabaseClient } from "@supabase/supabase-js";

export type ColorDraft = {
  id?: string;
  color_id: string;
  name: string;
  hex_code: string;
  image_url: string;
  image_public_id: string;
  sort_order: number;
  is_active?: boolean;
};

function normalizeHex(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withHash = value.startsWith("#") ? value : `#${value}`;
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(withHash)) {
    return null;
  }
  return withHash.toLowerCase();
}

export function parseColorDrafts(raw: string): ColorDraft[] | { error: string } {
  if (!raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Color data is invalid." };
  }
  if (!Array.isArray(parsed)) return { error: "Color data is invalid." };

  const colors: ColorDraft[] = [];
  const seen = new Set<string>();
  for (const [index, item] of parsed.entries()) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const colorId = String(row.color_id ?? "").trim();
    if (!colorId) {
      return { error: `Color ${index + 1} is missing a library color.` };
    }
    if (seen.has(colorId)) {
      return { error: "Each color can only be added once to a product." };
    }
    seen.add(colorId);
    const name = String(row.name ?? "").trim();
    if (!name) {
      return { error: `Color ${index + 1} needs a name.` };
    }
    const hex = normalizeHex(String(row.hex_code ?? ""));
    colors.push({
      id: row.id ? String(row.id) : undefined,
      color_id: colorId,
      name,
      hex_code: hex ?? "#111111",
      image_url: String(row.image_url ?? "").trim(),
      image_public_id: String(row.image_public_id ?? "").trim(),
      sort_order: Number(row.sort_order) || index,
      is_active: row.is_active !== false,
    });
  }
  return colors;
}

export function parseSizeNames(raw: string): string[] | { error: string } {
  if (!raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Size data is invalid." };
  }
  if (!Array.isArray(parsed)) return { error: "Size data is invalid." };
  const names = parsed
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  return [...new Set(names)];
}

async function ensureSizeId(
  supabase: SupabaseClient,
  name: string,
  sortOrder: number
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("sizes")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("sizes")
    .insert({ name, sort_order: sortOrder, is_active: true })
    .select("id")
    .single();
  if (error || !created) return null;
  return created.id as string;
}

export async function replaceProductVariants(
  supabase: SupabaseClient,
  productId: string,
  colors: ColorDraft[],
  sizeNames: string[]
): Promise<{ ok: true; coverUrl: string | null; coverPublicId: string | null } | { ok: false; error: string }> {
  const { data: existingColors } = await supabase
    .from("product_colors")
    .select("id")
    .eq("product_id", productId);
  const keepIds = new Set(
    colors.map((c) => c.id).filter((id): id is string => Boolean(id))
  );
  const removeIds = (existingColors ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keepIds.has(id));
  if (removeIds.length) {
    const { error } = await supabase
      .from("product_colors")
      .delete()
      .eq("product_id", productId)
      .in("id", removeIds);
    if (error) {
      return { ok: false, error: "Unable to update product colors." };
    }
  }

  const libraryIds = [...new Set(colors.map((c) => c.color_id))];
  const { data: libraryRows, error: libraryError } = libraryIds.length
    ? await supabase
        .from("colors")
        .select("id, name, hex_code")
        .in("id", libraryIds)
    : { data: [], error: null };
  if (libraryError) {
    return { ok: false, error: "Unable to load the color library." };
  }
  const libraryById = new Map(
    (libraryRows ?? []).map((row) => [row.id as string, row])
  );

  for (const [index, color] of colors.entries()) {
    const lib = libraryById.get(color.color_id);
    if (!lib) {
      return { ok: false, error: "A selected color was not found in the library." };
    }
    const payload = {
      product_id: productId,
      color_id: color.color_id,
      name: lib.name,
      hex_code: lib.hex_code || color.hex_code || null,
      image_url: color.image_url || null,
      image_public_id: color.image_public_id || null,
      sort_order: index,
      is_active: color.is_active !== false,
    };
    if (color.id) {
      const updatePayload = {
        product_id: productId,
        color_id: color.color_id,
        name: lib.name,
        hex_code: lib.hex_code || color.hex_code || null,
        sort_order: index,
        is_active: color.is_active !== false,
        ...(color.image_url
          ? {
              image_url: color.image_url,
              image_public_id: color.image_public_id || null,
            }
          : {}),
      };
      const { data: updated, error } = await supabase
        .from("product_colors")
        .update(updatePayload)
        .eq("id", color.id)
        .eq("product_id", productId)
        .select("id");
      if (error || !updated?.length) {
        return { ok: false, error: "Unable to update product colors." };
      }
    } else {
      const { error } = await supabase.from("product_colors").insert(payload);
      if (error) return { ok: false, error: "Unable to save product colors." };
    }
  }

  const { error: clearSizesError } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);
  if (clearSizesError) {
    return { ok: false, error: "Unable to update product sizes." };
  }

  for (const [index, name] of sizeNames.entries()) {
    const sizeId = await ensureSizeId(supabase, name, 300 + index);
    if (!sizeId) {
      return { ok: false, error: "Unable to save product sizes." };
    }
    const { error } = await supabase.from("product_sizes").insert({
      product_id: productId,
      size_id: sizeId,
      sort_order: index,
      is_active: true,
    });
    if (error) return { ok: false, error: "Unable to save product sizes." };
  }

  const cover = colors.find((c) => c.image_url) ?? null;
  return {
    ok: true,
    coverUrl: cover?.image_url || null,
    coverPublicId: cover?.image_public_id || null,
  };
}
