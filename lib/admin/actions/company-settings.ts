"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
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
  if (!canMutate(admin)) {
    return { ok: false, error: "Staff can view WhatsApp settings but cannot edit them." };
  }

  const whatsapp = str(formData, "whatsapp_number").replace(/\D/g, "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ whatsapp_number: whatsapp || null })
    .eq("id", company.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to update WhatsApp number." };
  }

  revalidatePath(`/admin/companies/${companySlug}/whatsapp`);
  revalidatePath(`/admin/companies/${companySlug}`);
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

  revalidatePath(`/admin/companies/${companySlug}/settings`);
  revalidatePath(`/admin/companies/${companySlug}`);
  revalidatePath("/admin/companies");
  revalidatePath("/admin/dashboard");
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

  revalidatePath(`/admin/companies/${companySlug}/form-options`);
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

  revalidatePath(`/admin/companies/${companySlug}/route-hubs`);
  return { ok: true };
}
