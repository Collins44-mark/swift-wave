import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeHex, resolvedSwatchHex } from "@/lib/catalog/color-display";

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

export type SavedProductColor = {
  id: string;
  color_id: string;
  image_url: string | null;
  image_public_id: string | null;
};

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
    colors.push({
      id: row.id ? String(row.id) : undefined,
      color_id: colorId,
      name,
      hex_code: normalizeHex(String(row.hex_code ?? "")) ?? "",
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

async function resolveSizeIds(
  supabase: SupabaseClient,
  sizeNames: string[]
): Promise<{ ok: true; ids: string[] } | { ok: false; error: string }> {
  if (!sizeNames.length) return { ok: true, ids: [] };

  const { data: existing, error: existingError } = await supabase
    .from("sizes")
    .select("id, name");
  if (existingError) {
    return { ok: false, error: "Unable to save product sizes." };
  }

  const byName = new Map(
    (existing ?? []).map((row) => [
      String(row.name).trim().toLowerCase(),
      row.id as string,
    ])
  );

  const ids: string[] = [];
  const toCreate: { name: string; sort_order: number; is_active: boolean }[] =
    [];

  sizeNames.forEach((name, index) => {
    const known = byName.get(name.toLowerCase());
    if (known) {
      ids[index] = known;
    } else {
      toCreate.push({ name, sort_order: 300 + index, is_active: true });
    }
  });

  if (toCreate.length) {
    const { data: created, error } = await supabase
      .from("sizes")
      .insert(toCreate)
      .select("id, name");
    if (error || !created?.length) {
      return { ok: false, error: "Unable to save product sizes." };
    }
    for (const row of created) {
      byName.set(String(row.name).trim().toLowerCase(), row.id as string);
    }
    sizeNames.forEach((name, index) => {
      if (!ids[index]) {
        const resolved = byName.get(name.toLowerCase());
        if (resolved) ids[index] = resolved;
      }
    });
  }

  if (ids.length !== sizeNames.length || ids.some((id) => !id)) {
    return { ok: false, error: "Unable to save product sizes." };
  }
  return { ok: true, ids };
}

export async function replaceProductVariants(
  supabase: SupabaseClient,
  productId: string,
  colors: ColorDraft[],
  sizeNames: string[]
): Promise<{ ok: true; saved: SavedProductColor[] } | { ok: false; error: string }> {
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

  const updates: PromiseLike<{ error: unknown; data: { id: string }[] | null }>[] =
    [];
  const inserts: Record<string, unknown>[] = [];

  for (const [index, color] of colors.entries()) {
    const lib = libraryById.get(color.color_id);
    if (!lib) {
      return { ok: false, error: "A selected color was not found in the library." };
    }
    const hex =
      resolvedSwatchHex(lib.hex_code as string | null) ||
      resolvedSwatchHex(color.hex_code);
    if (color.id) {
      updates.push(
        supabase
          .from("product_colors")
          .update({
            product_id: productId,
            color_id: color.color_id,
            name: lib.name,
            hex_code: hex,
            sort_order: index,
            is_active: color.is_active !== false,
            ...(color.image_url
              ? {
                  image_url: color.image_url,
                  image_public_id: color.image_public_id || null,
                }
              : {}),
          })
          .eq("id", color.id)
          .eq("product_id", productId)
          .select("id")
      );
    } else {
      inserts.push({
        product_id: productId,
        color_id: color.color_id,
        name: lib.name,
        hex_code: hex,
        image_url: color.image_url || null,
        image_public_id: color.image_public_id || null,
        sort_order: index,
        is_active: color.is_active !== false,
      });
    }
  }

  if (updates.length) {
    const updated = await Promise.all(updates);
    if (updated.some((row) => row.error || !row.data?.length)) {
      return { ok: false, error: "Unable to update product colors." };
    }
  }
  if (inserts.length) {
    const { error } = await supabase.from("product_colors").insert(inserts);
    if (error) return { ok: false, error: "Unable to save product colors." };
  }

  const sizeIds = await resolveSizeIds(supabase, sizeNames);
  if (!sizeIds.ok) return sizeIds;

  const { error: clearSizesError } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);
  if (clearSizesError) {
    return { ok: false, error: "Unable to update product sizes." };
  }

  if (sizeIds.ids.length) {
    const { error } = await supabase.from("product_sizes").insert(
      sizeIds.ids.map((sizeId, index) => ({
        product_id: productId,
        size_id: sizeId,
        sort_order: index,
        is_active: true,
      }))
    );
    if (error) return { ok: false, error: "Unable to save product sizes." };
  }

  const { data: savedRows, error: savedError } = await supabase
    .from("product_colors")
    .select("id, color_id, image_url, image_public_id")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (savedError) {
    return { ok: false, error: "Unable to load saved product colors." };
  }

  return {
    ok: true,
    saved: (savedRows ?? []).map((row) => ({
      id: row.id as string,
      color_id: row.color_id as string,
      image_url: (row.image_url as string | null) ?? null,
      image_public_id: (row.image_public_id as string | null) ?? null,
    })),
  };
}
