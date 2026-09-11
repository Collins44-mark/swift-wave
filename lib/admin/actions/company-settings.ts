"use server";

import { revalidatePublicLater } from "@/lib/admin/revalidate-public";
import { createClient } from "@/lib/supabase/server";
import { validateWhatsAppNumber } from "@/lib/whatsapp/normalize";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { adminCan } from "@/lib/admin/permissions";
import { getCompanySettings } from "@/lib/admin/data/company-settings";
import type { ActionResult } from "@/lib/admin/types-catalog";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function linesToArray(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const WEEKDAY_LABELS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function parseWeekdays(csv: string): number[] {
  return csv
    .split(/[,]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^\d+$/.test(p)) return Number(p);
      return WEEKDAY_LABELS[p.toLowerCase()] ?? -1;
    })
    .filter((n) => n >= 0 && n <= 6);
}

async function mergeSettings(
  companyId: string,
  patch: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const existing = await getCompanySettings(companyId);
  const next = {
    ...(existing?.settings ?? {}),
    ...patch,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("company_settings")
      .update({ settings: next })
      .eq("id", existing.id)
      .eq("company_id", companyId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase.from("company_settings").insert({
    company_id: companyId,
    settings: next,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateWhatsappNumber(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "whatsapp");
  if (!adminCan(admin, "manage_whatsapp")) {
    return { ok: false, error: "You do not have permission to edit WhatsApp settings." };
  }

  const raw = str(formData, "whatsapp_number");
  let whatsapp: string | null = null;

  if (raw) {
    const validated = validateWhatsAppNumber(raw);
    if (!validated.ok) {
      return { ok: false, error: validated.error };
    }
    whatsapp = validated.normalized;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ whatsapp_number: whatsapp })
    .eq("id", company.id);

  if (error) {
    return {
      ok: false,
      error: "Unable to save WhatsApp number. Please try again.",
    };
  }

  revalidatePublicLater([
    `/companies/${companySlug}`,
    `/api/public/catalog/${companySlug}`,
    `/api/public/company/${companySlug}`,
  ]);
  return { ok: true };
}

export async function updateCompanyProfile(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "settings");
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view settings but cannot edit them." };
  }

  const description = str(formData, "description") || null;
  const website_url = str(formData, "website_url") || null;

  const patch: Record<string, unknown> = {
    description,
    website_url,
  };

  if (admin.profile.role === "super_admin") {
    patch.is_active =
      formData.get("is_active") === "on" ||
      formData.get("is_active") === "true";
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update(patch)
    .eq("id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update company." };
  }

  revalidatePublicLater([`/companies/${companySlug}`, "/companies"]);
  return { ok: true };
}

const CORPORATE_CARD_ICONS = new Set([
  "graduation-cap",
  "truck",
  "shirt",
  "heart-pulse",
  "plane",
  "utensils",
  "building-2",
  "globe",
  "briefcase",
]);

export async function updateCorporateProfile(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "corporate_profile"
  );
  if (!canMutate(admin)) {
    return {
      ok: false,
      error: "Staff can view the corporate profile but cannot edit it.",
    };
  }

  const name = str(formData, "name");
  const card_title_short = str(formData, "card_title_short") || null;
  const description = str(formData, "description") || null;
  const card_image_url = str(formData, "card_image_url") || null;
  const card_image_public_id = str(formData, "card_image_public_id") || null;
  const card_iconRaw = str(formData, "card_icon") || null;
  const card_icon =
    card_iconRaw && CORPORATE_CARD_ICONS.has(card_iconRaw) ? card_iconRaw : null;
  const card_route = str(formData, "card_route") || null;
  const orderRaw = str(formData, "corporate_display_order");
  const corporate_display_order = orderRaw ? Number(orderRaw) : 0;
  const corporate_card_visible =
    formData.get("corporate_card_visible") === "on" ||
    formData.get("corporate_card_visible") === "true";
  const card_coming_soon =
    formData.get("card_coming_soon") === "on" ||
    formData.get("card_coming_soon") === "true";

  if (!name) {
    return { ok: false, error: "Company name is required." };
  }
  if (
    orderRaw &&
    (!Number.isFinite(corporate_display_order) || corporate_display_order < 0)
  ) {
    return { ok: false, error: "Display order must be a non-negative number." };
  }

  const patch: Record<string, unknown> = {
    card_title_short,
    description,
    card_image_url,
    card_image_public_id,
    card_icon,
    card_route,
    corporate_display_order: Math.floor(corporate_display_order),
    corporate_card_visible,
    card_coming_soon,
  };

  if (admin.profile.role === "super_admin") {
    patch.name = name;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update(patch)
    .eq("id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update corporate profile." };
  }

  revalidatePublicLater(["/companies"]);
  return { ok: true };
}

export async function updateScholarshipFormOptions(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "form_options"
  );
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff cannot edit form options." };
  }

  const scholarship_form = {
    nationalities: linesToArray(str(formData, "nationalities")),
    destinations: linesToArray(str(formData, "destinations")),
    education_levels: linesToArray(str(formData, "education_levels")),
    fields_of_study: linesToArray(str(formData, "fields_of_study")),
  };

  const result = await mergeSettings(company.id, { scholarship_form });
  if (!result.ok) return result;

  return { ok: true };
}

export async function updateFreightRouteHubs(
  companySlug: string,
  formData: FormData
): Promise<ActionResult> {
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "route_hubs"
  );
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff cannot edit route hubs." };
  }

  const hubsRaw = str(formData, "freight_hubs");
  const freight_hubs: Record<string, number[]> = {};

  for (const line of hubsRaw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const name = trimmed.slice(0, sep).trim();
    const days = parseWeekdays(trimmed.slice(sep + 1));
    if (name) freight_hubs[name] = days;
  }

  const freight_destinations = linesToArray(
    str(formData, "freight_destinations")
  );

  const result = await mergeSettings(company.id, {
    freight_hubs,
    freight_destinations,
  });
  if (!result.ok) return result;

  return { ok: true };
}
