import { notFound, redirect } from "next/navigation";
import { getCurrentAdminIdentity } from "@/lib/auth/get-current-admin";
import { loadAccessibleCompanyBySlug } from "@/lib/admin/companies";
import {
  companyHasModule,
  type CompanyModuleKey,
} from "@/lib/admin/capabilities";
import { adminCan } from "@/lib/admin/permissions";
import type { CompanyRecord } from "@/lib/admin/company-types";
import type { CurrentAdmin } from "@/lib/auth/types";

export type CompanyAccess = {
  admin: CurrentAdmin;
  company: CompanyRecord;
};

export class CompanyLoadError extends Error {
  constructor(message = "Unable to load company data right now.") {
    super(message);
    this.name = "CompanyLoadError";
  }
}

/**
 * Require authenticated admin with access to the company workspace.
 * Optionally assert a ready capability module (else notFound).
 */
export async function requireCompanyAccess(
  companySlug: string,
  module?: CompanyModuleKey
): Promise<CompanyAccess> {
  const access = await getCurrentAdminIdentity();
  if (!access.ok) redirect("/admin/login");

  const { company, error } = await loadAccessibleCompanyBySlug(companySlug);

  if (error === "fetch_failed") {
    throw new CompanyLoadError();
  }

  if (error === "unauthorized" || error === "not_found" || !company) {
    notFound();
  }

  if (module && !companyHasModule(company.slug, module)) {
    redirect(`/admin/companies/${company.slug}`);
  }

  return {
    admin: {
      user: access.user,
      profile: access.profile,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        is_active: company.is_active,
      },
      companies: [],
    },
    company,
  };
}

export function canMutate(admin: CurrentAdmin): boolean {
  return (
    adminCan(admin, "manage_products") ||
    adminCan(admin, "manage_categories") ||
    adminCan(admin, "manage_orders") ||
    adminCan(admin, "manage_website_content") ||
    adminCan(admin, "manage_company_settings") ||
    adminCan(admin, "manage_whatsapp")
  );
}

/** Staff + admins can update operational records (orders/inquiries status). */
export function canOperate(admin: CurrentAdmin): boolean {
  return (
    adminCan(admin, "update_order_status") ||
    adminCan(admin, "update_inquiry_status") ||
    adminCan(admin, "manage_orders") ||
    adminCan(admin, "manage_inquiries")
  );
}

export function isSuperAdmin(admin: CurrentAdmin): boolean {
  return admin.profile.role === "super_admin";
}
