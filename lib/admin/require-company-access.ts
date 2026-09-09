import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanyBySlug } from "@/lib/admin/companies";
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

/**
 * Require authenticated admin with access to the company workspace.
 * Optionally assert a ready capability module (else notFound).
 */
export async function requireCompanyAccess(
  companySlug: string,
  module?: CompanyModuleKey
): Promise<CompanyAccess> {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const { company, error } = await getAccessibleCompanyBySlug(
    access.admin,
    companySlug
  );

  if (error === "unauthorized" || error === "not_found" || !company) {
    notFound();
  }

  if (error === "fetch_failed") {
    notFound();
  }

  if (module && !companyHasModule(companySlug, module)) {
    notFound();
  }

  return { admin: access.admin, company };
}

export function canMutate(admin: CurrentAdmin): boolean {
  return (
    adminCan(admin, "manage_products") ||
    adminCan(admin, "manage_orders") ||
    adminCan(admin, "manage_website_content")
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
