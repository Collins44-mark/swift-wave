"use server";

import { redirect } from "next/navigation";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";

export type AuthActionState = {
  error: string | null;
};

function mapLoginError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  return "Unable to sign in. Please try again.";
}

function mapAccessError(code: string): string {
  switch (code) {
    case "no_profile":
      return "Your account is authenticated but has no admin profile. Contact a system administrator.";
    case "inactive":
      return "Your admin account has been disabled. Contact a system administrator.";
    case "invalid_role":
      return "Your account does not have a valid admin role.";
    case "missing_company":
      return "Your account is missing a company assignment.";
    default:
      return "You do not have permission to access the admin area.";
  }
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      error:
        "Admin authentication is not configured for this deployment. Set Supabase environment variables in Vercel Production and redeploy.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapLoginError(error.message) };
  }

  const access = await getCurrentAdmin();
  if (!access.ok) {
    await supabase.auth.signOut();
    return { error: mapAccessError(access.error) };
  }

  redirect("/admin/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
