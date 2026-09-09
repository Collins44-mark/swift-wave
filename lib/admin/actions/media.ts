"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { findMediaUsage, getMediaAsset } from "@/lib/admin/data/media";
import { configureCloudinary } from "@/lib/cloudinary/server";
import {
  cloudinaryFolderForSlug,
  isAllowedSwiftWaveFolder,
  publicIdBelongsToFolder,
} from "@/lib/cloudinary/folders";
import type { CloudinaryUploadInfo } from "@/lib/admin/types-media";

export type MediaActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function saveUploadedMedia(
  companySlug: string,
  info: CloudinaryUploadInfo,
  altText?: string
): Promise<MediaActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "media");
  if (!canMutate(admin)) {
    return { ok: false, error: "You do not have permission to upload media." };
  }

  if (!info.public_id || !info.secure_url) {
    return { ok: false, error: "Upload result was incomplete." };
  }

  // Server-derived folder only — never trust client folder strings alone
  let expectedFolder: string;
  try {
    expectedFolder = cloudinaryFolderForSlug(company.slug);
  } catch {
    return { ok: false, error: "Invalid company media folder." };
  }

  if (!isAllowedSwiftWaveFolder(expectedFolder)) {
    return { ok: false, error: "Upload path is outside the Swift Wave media root." };
  }

  if (!publicIdBelongsToFolder(info.public_id, expectedFolder)) {
    return {
      ok: false,
      error: "Upload was rejected because it is outside this company's Swift Wave folder.",
    };
  }

  if (info.folder && info.folder.replace(/\/+$/, "") !== expectedFolder) {
    return {
      ok: false,
      error: "Upload folder does not match this company.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .upsert(
      {
        company_id: company.id,
        cloudinary_public_id: info.public_id,
        secure_url: info.secure_url,
        resource_type: info.resource_type || "image",
        format: info.format || null,
        width: info.width ?? null,
        height: info.height ?? null,
        bytes: info.bytes ?? null,
        original_filename: info.original_filename || null,
        alt_text: altText?.trim() || null,
        folder: expectedFolder,
        created_by: admin.user.id,
      },
      { onConflict: "company_id,cloudinary_public_id" }
    )
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: "Could not save media reference." };
  }

  revalidatePath(`/admin/companies/${companySlug}/media`);
  return { ok: true, id: data.id };
}

export async function updateMediaAltText(
  companySlug: string,
  mediaId: string,
  altText: string
): Promise<MediaActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "media");
  if (!canMutate(admin)) {
    return { ok: false, error: "You do not have permission to edit media." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: altText.trim() || null })
    .eq("id", mediaId)
    .eq("company_id", company.id);

  if (error) return { ok: false, error: "Could not update alt text." };
  revalidatePath(`/admin/companies/${companySlug}/media`);
  return { ok: true, id: mediaId };
}

export async function deleteMediaAsset(
  companySlug: string,
  mediaId: string
): Promise<MediaActionResult> {
  const { admin, company } = await requireCompanyAccess(companySlug, "media");
  if (!canMutate(admin)) {
    return { ok: false, error: "You do not have permission to delete media." };
  }

  const asset = await getMediaAsset(company.id, mediaId);
  if (!asset) return { ok: false, error: "Media not found." };

  const usage = await findMediaUsage(
    company.id,
    asset.cloudinary_public_id,
    asset.secure_url
  );
  if (usage.length) {
    return {
      ok: false,
      error: `This image is currently in use and cannot be deleted. (${usage.join("; ")})`,
    };
  }

  try {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(asset.cloudinary_public_id, {
      resource_type: asset.resource_type || "image",
      invalidate: true,
    });
  } catch {
    return { ok: false, error: "Could not delete the image from storage." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", mediaId)
    .eq("company_id", company.id);

  if (error) {
    return {
      ok: false,
      error: "Storage deleted, but the database record could not be removed.",
    };
  }

  revalidatePath(`/admin/companies/${companySlug}/media`);
  return { ok: true };
}
