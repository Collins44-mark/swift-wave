import { NextResponse, type NextRequest } from "next/server";
import {
  createCategory,
  updateCategory,
  deleteCategories,
  deleteCategory,
} from "@/lib/admin/actions/categories";
import {
  createProduct,
  updateProduct,
  deleteProducts,
  deleteProduct,
} from "@/lib/admin/actions/products";
import {
  updateOrderStatus,
  deleteOrders,
  deleteOrder,
} from "@/lib/admin/actions/orders";
import { updateInquiry } from "@/lib/admin/actions/inquiries";
import {
  updateWhatsappNumber,
  updateCompanyProfile,
  updateCorporateProfile,
  updateScholarshipFormOptions,
  updateFreightRouteHubs,
} from "@/lib/admin/actions/company-settings";
import {
  saveWebsiteSectionDraft,
  publishWebsiteSection,
} from "@/lib/admin/actions/website-content";
import { updateHeroImage } from "@/lib/admin/actions/hero-content";
import { createLibraryColor } from "@/lib/admin/actions/colors";
import {
  saveUploadedMedia,
  updateMediaAltText,
  deleteMediaAsset,
} from "@/lib/admin/actions/media";
import {
  createAdminUser,
  updateAdminUser,
  setAdminActive,
  deleteAdminUser,
} from "@/lib/admin/actions/users";
import type { OrderStatus } from "@/lib/admin/types-catalog";
import type { CloudinaryUploadInfo } from "@/lib/admin/types-media";

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function str(source: FormData | Record<string, unknown>, key: string): string {
  const value = source instanceof FormData ? source.get(key) : source[key];
  return String(value ?? "").trim();
}

function asFormData(body: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (key === "_action" || value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) formData.append(key, String(item));
    } else if (typeof value === "object") {
      formData.set(key, JSON.stringify(value));
    } else {
      formData.set(key, String(value));
    }
  }
  return formData;
}

async function dispatch(
  action: string,
  data: FormData | Record<string, unknown>
): Promise<unknown> {
  const companySlug = str(data, "companySlug");
  const formData = data instanceof FormData ? data : asFormData(data);
  const json = data instanceof FormData ? null : data;

  switch (action) {
    case "createCategory":
      return createCategory(companySlug, formData);
    case "updateCategory":
      return updateCategory(companySlug, str(data, "categoryId"), formData);
    case "deleteCategory":
      return deleteCategory(companySlug, str(data, "categoryId"));
    case "deleteCategories":
      return deleteCategories(
        companySlug,
        (json?.ids as string[]) ?? str(data, "ids").split(",").filter(Boolean)
      );
    case "createProduct":
      return createProduct(companySlug, formData);
    case "updateProduct":
      return updateProduct(companySlug, str(data, "productId"), formData);
    case "deleteProduct":
      return deleteProduct(companySlug, str(data, "productId"));
    case "deleteProducts":
      return deleteProducts(
        companySlug,
        (json?.ids as string[]) ?? str(data, "ids").split(",").filter(Boolean)
      );
    case "updateOrderStatus":
      return updateOrderStatus(
        companySlug,
        str(data, "orderId"),
        str(data, "status") as OrderStatus
      );
    case "deleteOrder":
      return deleteOrder(companySlug, str(data, "orderId"));
    case "deleteOrders":
      return deleteOrders(
        companySlug,
        (json?.ids as string[]) ?? str(data, "ids").split(",").filter(Boolean)
      );
    case "updateInquiry":
      return updateInquiry(companySlug, str(data, "inquiryId"), formData);
    case "updateWhatsappNumber":
      return updateWhatsappNumber(companySlug, formData);
    case "updateCompanyProfile":
      return updateCompanyProfile(companySlug, formData);
    case "updateCorporateProfile":
      return updateCorporateProfile(companySlug, formData);
    case "updateScholarshipFormOptions":
      return updateScholarshipFormOptions(companySlug, formData);
    case "updateFreightRouteHubs":
      return updateFreightRouteHubs(companySlug, formData);
    case "saveWebsiteSectionDraft":
      return saveWebsiteSectionDraft(companySlug, formData);
    case "publishWebsiteSection":
      return publishWebsiteSection(companySlug, formData);
    case "updateHeroImage":
      return updateHeroImage(companySlug, formData);
    case "createLibraryColor":
      return createLibraryColor(
        companySlug,
        str(data, "name"),
        str(data, "hexCode")
      );
    case "saveUploadedMedia":
      return saveUploadedMedia(
        companySlug,
        (json?.info as CloudinaryUploadInfo) ??
          (JSON.parse(str(data, "info") || "{}") as CloudinaryUploadInfo),
        str(data, "altText") || undefined
      );
    case "updateMediaAltText":
      return updateMediaAltText(
        companySlug,
        str(data, "mediaId"),
        str(data, "altText")
      );
    case "deleteMediaAsset":
      return deleteMediaAsset(companySlug, str(data, "mediaId"));
    case "createAdminUser":
      return createAdminUser(formData);
    case "updateAdminUser":
      return updateAdminUser(str(data, "userId"), formData);
    case "setAdminActive":
      return setAdminActive(str(data, "userId"), str(data, "isActive") === "true");
    case "deleteAdminUser":
      return deleteAdminUser(str(data, "userId"));
    default:
      return { ok: false, error: "Unknown admin action." };
  }
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Invalid request origin." },
      { status: 403 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let action = "";
  let data: FormData | Record<string, unknown>;

  try {
    if (contentType.includes("application/json")) {
      data = (await request.json()) as Record<string, unknown>;
      action = String(data._action ?? "");
    } else {
      data = await request.formData();
      action = String(data.get("_action") ?? "");
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!action) {
    return NextResponse.json(
      { ok: false, error: "Missing action." },
      { status: 400 }
    );
  }

  try {
    const result = await dispatch(action, data);
    const response = NextResponse.json(result ?? { ok: false, error: "No result." });
    response.headers.set("x-admin-mutate-ms", String(Date.now() - started));
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Couldn't save changes. Please try again.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
