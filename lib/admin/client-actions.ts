import { adminMutate } from "@/lib/admin/client-mutate";
import type { ActionResult, BulkDeleteResult, OrderStatus } from "@/lib/admin/types-catalog";
import type { CloudinaryUploadInfo } from "@/lib/admin/types-media";
import type { MediaActionResult } from "@/lib/admin/actions/media";
import type { UserActionResult } from "@/lib/admin/actions/users";

export function createCategory(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("createCategory", formData);
}

export function updateCategory(
  companySlug: string,
  categoryId: string,
  formData: FormData
) {
  formData.set("companySlug", companySlug);
  formData.set("categoryId", categoryId);
  return adminMutate<ActionResult>("updateCategory", formData);
}

export function deleteCategory(companySlug: string, categoryId: string) {
  return adminMutate<ActionResult>("deleteCategory", { companySlug, categoryId });
}

export function deleteCategories(companySlug: string, ids: string[]) {
  return adminMutate<BulkDeleteResult>("deleteCategories", { companySlug, ids });
}

export function createProduct(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("createProduct", formData);
}

export function updateProduct(
  companySlug: string,
  productId: string,
  formData: FormData
) {
  formData.set("companySlug", companySlug);
  formData.set("productId", productId);
  return adminMutate<ActionResult>("updateProduct", formData);
}

export function deleteProduct(companySlug: string, productId: string) {
  return adminMutate<ActionResult>("deleteProduct", { companySlug, productId });
}

export function deleteProducts(companySlug: string, ids: string[]) {
  return adminMutate<BulkDeleteResult>("deleteProducts", { companySlug, ids });
}

export function updateOrderStatus(
  companySlug: string,
  orderId: string,
  status: OrderStatus
) {
  return adminMutate<ActionResult>("updateOrderStatus", {
    companySlug,
    orderId,
    status,
  });
}

export function deleteOrder(companySlug: string, orderId: string) {
  return adminMutate<ActionResult>("deleteOrder", { companySlug, orderId });
}

export function deleteOrders(companySlug: string, ids: string[]) {
  return adminMutate<BulkDeleteResult>("deleteOrders", { companySlug, ids });
}

export function updateInquiry(
  companySlug: string,
  inquiryId: string,
  formData: FormData
) {
  formData.set("companySlug", companySlug);
  formData.set("inquiryId", inquiryId);
  return adminMutate<ActionResult>("updateInquiry", formData);
}

export function updateWhatsappNumber(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateWhatsappNumber", formData);
}

export function updateCompanyProfile(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateCompanyProfile", formData);
}

export function updateCorporateProfile(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateCorporateProfile", formData);
}

export function updateScholarshipFormOptions(
  companySlug: string,
  formData: FormData
) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateScholarshipFormOptions", formData);
}

export function updateFreightRouteHubs(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateFreightRouteHubs", formData);
}

export function saveWebsiteSectionDraft(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("saveWebsiteSectionDraft", formData);
}

export function publishWebsiteSection(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("publishWebsiteSection", formData);
}

export function updateHeroImage(companySlug: string, formData: FormData) {
  formData.set("companySlug", companySlug);
  return adminMutate<ActionResult>("updateHeroImage", formData);
}

export function createLibraryColor(
  companySlug: string,
  name: string,
  hexCode: string
) {
  return adminMutate<{
    ok: true;
    id: string;
    name: string;
    hex_code: string | null;
  } | { ok: false; error: string }>("createLibraryColor", {
    companySlug,
    name,
    hexCode,
  });
}

export function saveUploadedMedia(
  companySlug: string,
  info: CloudinaryUploadInfo,
  altText?: string
) {
  return adminMutate<MediaActionResult>("saveUploadedMedia", {
    companySlug,
    info,
    altText: altText ?? "",
  });
}

export function updateMediaAltText(
  companySlug: string,
  mediaId: string,
  altText: string
) {
  return adminMutate<MediaActionResult>("updateMediaAltText", {
    companySlug,
    mediaId,
    altText,
  });
}

export function deleteMediaAsset(companySlug: string, mediaId: string) {
  return adminMutate<MediaActionResult>("deleteMediaAsset", {
    companySlug,
    mediaId,
  });
}

export function createAdminUser(formData: FormData) {
  return adminMutate<UserActionResult>("createAdminUser", formData);
}

export function updateAdminUser(userId: string, formData: FormData) {
  formData.set("userId", userId);
  return adminMutate<UserActionResult>("updateAdminUser", formData);
}

export function setAdminActive(userId: string, isActive: boolean) {
  return adminMutate<UserActionResult>("setAdminActive", {
    userId,
    isActive: String(isActive),
  });
}

export function deleteAdminUser(userId: string) {
  return adminMutate<UserActionResult>("deleteAdminUser", { userId });
}
