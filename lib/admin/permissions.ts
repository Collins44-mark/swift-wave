/**
 * Role → permission matrix (extendable).
 * Server actions should call `adminCan(...)` rather than hard-coding role checks alone.
 */

import type { AdminRole, CurrentAdmin } from "@/lib/auth/types";

export type AdminPermission =
  | "manage_users"
  | "manage_companies"
  | "manage_products"
  | "manage_categories"
  | "manage_orders"
  | "update_order_status"
  | "manage_inquiries"
  | "update_inquiry_status"
  | "manage_website_content"
  | "manage_media"
  | "manage_whatsapp"
  | "manage_company_settings"
  | "view_orders"
  | "view_inquiries";

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "manage_users",
    "manage_companies",
    "manage_products",
    "manage_categories",
    "manage_orders",
    "update_order_status",
    "manage_inquiries",
    "update_inquiry_status",
    "manage_website_content",
    "manage_media",
    "manage_whatsapp",
    "manage_company_settings",
    "view_orders",
    "view_inquiries",
  ],
  company_admin: [
    "manage_products",
    "manage_categories",
    "manage_orders",
    "update_order_status",
    "manage_inquiries",
    "update_inquiry_status",
    "manage_website_content",
    "manage_media",
    "manage_whatsapp",
    "manage_company_settings",
    "view_orders",
    "view_inquiries",
  ],
  staff: [
    "view_orders",
    "update_order_status",
    "view_inquiries",
    "update_inquiry_status",
  ],
};

export function roleHasPermission(
  role: AdminRole,
  permission: AdminPermission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function adminCan(
  admin: CurrentAdmin,
  permission: AdminPermission
): boolean {
  return roleHasPermission(admin.profile.role, permission);
}
