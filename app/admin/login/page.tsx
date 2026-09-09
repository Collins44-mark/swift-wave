import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import "../admin.css";

export const metadata: Metadata = {
  title: "Admin Login — Swift Wave",
  robots: { index: false, follow: false },
};

const ERROR_COPY: Record<string, string> = {
  no_profile:
    "Your account is authenticated but has no admin profile. Contact a system administrator.",
  inactive: "Your admin account is inactive. Contact a system administrator.",
  invalid_role: "Your account does not have a valid admin role.",
  missing_company: "Your account is missing a company assignment.",
  unauthenticated: "Please sign in to continue.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getCurrentAdmin();
  if (access.ok) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const errorKey = params.error || "";
  const banner = ERROR_COPY[errorKey] || null;

  return (
    <div className="sw-admin sw-admin-login">
      <div className="sw-admin-login-card">
        <div className="sw-admin-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/logo.png" alt="Swift Wave Group" />
          <div className="sw-admin-brand-copy">
            <strong>Swift Wave Group</strong>
            <span>Secure admin access</span>
          </div>
        </div>

        <h1>Admin Sign In</h1>
        <p className="sw-admin-lead">
          Sign in with your authorized Swift Wave credentials. Public registration
          is disabled.
        </p>

        {banner ? (
          <p className="sw-admin-error" role="alert">
            {banner}
          </p>
        ) : null}

        <AdminLoginForm />
      </div>
    </div>
  );
}
