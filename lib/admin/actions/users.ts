"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import type { AdminRole } from "@/lib/auth/types";

export type UserActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const ROLES: AdminRole[] = ["super_admin", "company_admin", "staff"];

async function requireSuperAdmin() {
  const access = await getCurrentAdmin();
  if (!access.ok) return { error: "unauthenticated" as const };
  if (access.admin.profile.role !== "super_admin") {
    return { error: "forbidden" as const };
  }
  return { admin: access.admin };
}

async function countSuperAdmins(excludeUserId?: string): Promise<number> {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin")
    .eq("is_active", true);
  if (excludeUserId) q = q.neq("id", excludeUserId);
  const { count } = await q;
  return count ?? 0;
}

function parseCompanyIds(formData: FormData): string[] {
  const raw = formData.getAll("company_ids");
  return [...new Set(raw.map((v) => String(v).trim()).filter(Boolean))];
}

export async function createAdminUser(
  formData: FormData
): Promise<UserActionResult> {
  const gate = await requireSuperAdmin();
  if ("error" in gate) {
    return {
      ok: false,
      error:
        gate.error === "forbidden"
          ? "Only Super Admins can create administrators."
          : "Please sign in again.",
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  const role = String(formData.get("role") ?? "").trim() as AdminRole;
  const companyIds = parseCompanyIds(formData);

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!email || !email.includes("@")) {
    return { ok: false, error: "A valid email is required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." };
  }
  if (!ROLES.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }
  if (role !== "super_admin" && companyIds.length === 0) {
    return {
      ok: false,
      error: "Select at least one company for Company Admin or Staff.",
    };
  }

  let service;
  try {
    service = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error:
        "Administrator management is not fully configured in this environment.",
    };
  }

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createError || !created.user) {
    const msg = createError?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered")) {
      return { ok: false, error: "An account with this email already exists." };
    }
    return { ok: false, error: "Could not create the administrator account." };
  }

  const userId = created.user.id;
  const primaryCompany =
    role === "super_admin" ? null : companyIds[0] ?? null;

  const { error: profileError } = await service.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    role,
    company_id: primaryCompany,
    is_active: true,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(userId);
    return {
      ok: false,
      error: "Could not finish setting up the administrator account.",
    };
  }

  if (role !== "super_admin") {
    const rows = companyIds.map((company_id) => ({
      user_id: userId,
      company_id,
      created_by: gate.admin.user.id,
    }));
    const { error: accessError } = await service
      .from("user_company_access")
      .insert(rows);
    if (accessError) {
      return {
        ok: false,
        error:
          "User created but company access failed: " + accessError.message,
      };
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/users");
  return { ok: true, id: userId };
}

export async function updateAdminUser(
  userId: string,
  formData: FormData
): Promise<UserActionResult> {
  const gate = await requireSuperAdmin();
  if ("error" in gate) {
    return { ok: false, error: "Only Super Admins can edit administrators." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as AdminRole;
  const isActive = formData.get("is_active") === "true";
  const companyIds = parseCompanyIds(formData);

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!ROLES.includes(role)) return { ok: false, error: "Invalid role." };

  if (role !== "super_admin" && companyIds.length === 0) {
    return {
      ok: false,
      error: "Select at least one company for Company Admin or Staff.",
    };
  }

  // Protect last super admin
  if (
    (role !== "super_admin" || !isActive) &&
    userId === gate.admin.user.id
  ) {
    return {
      ok: false,
      error: "You cannot demote or disable your own Super Admin account.",
    };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };

  if (target.role === "super_admin" && (role !== "super_admin" || !isActive)) {
    const remaining = await countSuperAdmins(userId);
    if (remaining < 1) {
      return {
        ok: false,
        error: "Cannot demote or disable the last active Super Admin.",
      };
    }
  }

  const primaryCompany =
    role === "super_admin" ? null : companyIds[0] ?? null;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      is_active: isActive,
      company_id: primaryCompany,
    })
    .eq("id", userId);

  if (profileError) {
    return { ok: false, error: profileError.message || "Update failed." };
  }

  // Sync company access
  await supabase.from("user_company_access").delete().eq("user_id", userId);

  if (role !== "super_admin" && companyIds.length) {
    const { error: accessError } = await supabase
      .from("user_company_access")
      .insert(
        companyIds.map((company_id) => ({
          user_id: userId,
          company_id,
          created_by: gate.admin.user.id,
        }))
      );
    if (accessError) {
      return {
        ok: false,
        error: "Profile updated but company access sync failed.",
      };
    }
  }

  revalidatePath("/admin/settings/users");
  revalidatePath(`/admin/settings/users/${userId}`);
  return { ok: true, id: userId };
}

export async function setAdminActive(
  userId: string,
  isActive: boolean
): Promise<UserActionResult> {
  const gate = await requireSuperAdmin();
  if ("error" in gate) {
    return { ok: false, error: "Only Super Admins can change account status." };
  }
  if (userId === gate.admin.user.id && !isActive) {
    return { ok: false, error: "You cannot disable your own account." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };

  if (!isActive && target.role === "super_admin") {
    const remaining = await countSuperAdmins(userId);
    if (remaining < 1) {
      return {
        ok: false,
        error: "Cannot disable the last active Super Admin.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message || "Update failed." };

  // Best-effort: sign out disabled user sessions via service role
  if (!isActive) {
    try {
      const service = createServiceRoleClient();
      await service.auth.admin.signOut(userId, "global");
    } catch {
      /* optional */
    }
  }

  revalidatePath("/admin/settings/users");
  return { ok: true, id: userId };
}

export async function deleteAdminUser(
  userId: string
): Promise<UserActionResult> {
  const gate = await requireSuperAdmin();
  if ("error" in gate) {
    return { ok: false, error: "Only Super Admins can delete administrators." };
  }
  if (userId === gate.admin.user.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };

  if (target.role === "super_admin") {
    const remaining = await countSuperAdmins(userId);
    if (remaining < 1) {
      return {
        ok: false,
        error: "Cannot delete the last active Super Admin.",
      };
    }
  }

  let service;
  try {
    service = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "Server is missing SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  // Access rows cascade via FK on profiles; delete auth user cascades profile
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false, error: error.message || "Could not delete user." };
  }

  revalidatePath("/admin/settings/users");
  return { ok: true };
}
